// Platita — get paid while your AI thinks. https://platita.lat
// v0.2.0: the sponsored line now rotates right in the editor's status bar
// (VS Code / Cursor / Windsurf) — plus Claude Code's official statusLine hook.
// Sends ONLY your account token and impression counts — never code, prompts or files.
const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const path = require("path");
const https = require("https");

const API = "https://platita.lat";
const CONF_DIR = path.join(os.homedir(), ".platita");
const BIN_DIR = path.join(CONF_DIR, "bin");
const CLAUDE_SETTINGS = path.join(os.homedir(), ".claude", "settings.json");
const ROTATE_MS = 30 * 1000;      // ad rotation, mirrors the server's refresh_sec
const MIN_VISIBLE_MS = 25 * 1000; // full-ish rotation on a focused window = impression
const IDLE_MS = 5 * 60 * 1000;    // no typing/scrolling for this long → dev is away, don't count
const WAIT_STATE_MS = 90 * 1000;  // AI touched its transcript this recently → real wait-state

let statusItem = null;   // balance (right side)
let adItem = null;       // sponsored line (left side)
let pollTimer = null;    // balance poll
let adTimer = null;      // ad rotation
let animTimer = null;    // marquee animation
let currentAd = null;    // {ad_id, text, url}
let shownSince = 0;      // when the current ad became visible on a focused window
let lastUserActivityAt = Date.now();   // typing / scrolling / switching files

function req(method, url, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request(url, {
      method,
      timeout: 10000,
      headers: data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {},
    }, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(b) }); }
        catch (e) { reject(e); }
      });
    });
    r.on("error", reject);
    r.on("timeout", () => r.destroy(new Error("timeout")));
    if (data) r.write(data);
    r.end();
  });
}
const get = (url) => req("GET", url);

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return null; }
}

function ensureInstalled(context, token, wallet) {
  // 1) client script from the bundle → ~/.platita/bin
  fs.mkdirSync(BIN_DIR, { recursive: true });
  const src = path.join(context.extensionPath, "platita_statusline.py");
  const dst = path.join(BIN_DIR, "platita_statusline.py");
  fs.copyFileSync(src, dst);
  // 2) account config
  fs.writeFileSync(path.join(CONF_DIR, "config.json"),
    JSON.stringify({ token, wallet, api: API }, null, 2));
  // 3) Claude Code's official statusLine hook (backup first)
  let settings = {};
  if (fs.existsSync(CLAUDE_SETTINGS)) {
    fs.copyFileSync(CLAUDE_SETTINGS, CLAUDE_SETTINGS + ".platita.bak");
    settings = readJson(CLAUDE_SETTINGS) || {};
  } else {
    fs.mkdirSync(path.dirname(CLAUDE_SETTINGS), { recursive: true });
  }
  settings.statusLine = { type: "command", command: `python3 ${dst}` };
  fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
}

async function refreshBalance(context) {
  const token = context.globalState.get("platita.token");
  if (!token || !statusItem) return;
  try {
    const r = await get(`${API}/v1/me?token=${encodeURIComponent(token)}`);
    if (r.status === 401) {
      statusItem.text = "▸ platita: token?";
      statusItem.tooltip = "Platita: token rejected — run “Platita: Connect account”";
      return;
    }
    const me = r.json;
    statusItem.text = `▸ $${(me.balance_usd || 0).toFixed(4)}`;
    statusItem.tooltip =
      `Platita — you earn while your AI thinks\n` +
      `Balance: $${me.balance_usd} · Impressions: ${me.impressions_total} · Paid out: $${me.paid_usd}\n` +
      `Wallet: ${me.wallet}\nClick to open your panel`;
  } catch (e) { /* offline — keep last value */ }
}

function startPolling(context) {
  if (pollTimer) clearInterval(pollTimer);
  refreshBalance(context);
  pollTimer = setInterval(() => refreshBalance(context), 5 * 60 * 1000);
}

// ── is the AI actually working? ────────────────────────────────────────────
// Claude Code appends to a session transcript while it works — in the CLI *and*
// in the editor plugin. We read ONLY the file's modification time (never its
// contents), so an impression can be tied to a real AI wait-state.
const CLAUDE_PROJECTS = path.join(os.homedir(), ".claude", "projects");
let sessionFiles = [];        // cached list of transcript paths
let sessionFilesAt = 0;

function listSessionFiles() {
  const now = Date.now();
  if (now - sessionFilesAt < 120000 && sessionFiles.length) return sessionFiles;
  const out = [];
  try {
    for (const dir of fs.readdirSync(CLAUDE_PROJECTS)) {
      const p = path.join(CLAUDE_PROJECTS, dir);
      try {
        if (!fs.statSync(p).isDirectory()) continue;
        for (const f of fs.readdirSync(p)) {
          if (f.endsWith(".jsonl")) out.push(path.join(p, f));
        }
      } catch (e) { /* unreadable dir — skip */ }
      if (out.length > 400) break;
    }
  } catch (e) { /* no ~/.claude/projects — fine */ }
  sessionFiles = out;
  sessionFilesAt = now;
  return out;
}

function aiActiveWithin(ms) {
  const now = Date.now();
  for (const f of listSessionFiles()) {
    try {
      if (now - fs.statSync(f).mtimeMs <= ms) return true;   // mtime only
    } catch (e) { /* file gone — skip */ }
  }
  return false;
}

// ── sponsored line in the editor's own status bar ──────────────────────────
function paintAd(text) {
  const label = `$(megaphone) ${text}`;
  const animate = vscode.workspace.getConfiguration("platita").get("adAnimation", true);
  if (animTimer) { clearInterval(animTimer); animTimer = null; }
  if (!animate || text.length < 12) { adItem.text = label; return; }
  // marquee: scrolls left for ~0.8s and lands exactly on the full line
  const n = text.length;
  const frames = Math.min(24, n);
  let i = 0;
  animTimer = setInterval(() => {
    if (i >= frames) {
      clearInterval(animTimer); animTimer = null;
      adItem.text = label;
      return;
    }
    const k = (n - frames + i) % n;
    adItem.text = `$(megaphone) ${text.slice(k)}   ${text.slice(0, k)}`;
    i++;
  }, 35);
}

async function rotateAd(context) {
  const token = context.globalState.get("platita.token");
  if (!token || !adItem) return;

  // 1) count the ad that just finished a full rotation — only if the window was
  //    focused the whole time AND the dev is actually around (recent activity).
  if (currentAd && shownSince && vscode.window.state.focused &&
      Date.now() - shownSince >= MIN_VISIBLE_MS &&
      Date.now() - lastUserActivityAt <= IDLE_MS) {
    req("POST", `${API}/v1/impressions`, {
      token, ad_id: currentAd.ad_id, count: 1,
      wait_state: aiActiveWithin(WAIT_STATE_MS),   // premium: shown while the AI worked
    }).catch(() => {});
  }

  // 2) fetch the next ad
  try {
    const r = await get(`${API}/v1/ad?token=${encodeURIComponent(token)}`);
    if (r.status === 200 && r.json && r.json.text) {
      currentAd = r.json;
      paintAd(currentAd.text);
      adItem.tooltip = `Sponsored · Platita\n${currentAd.url}\n` +
        `Counted only while this window is focused and you're working.\nClick to open the sponsor.`;
      adItem.show();
      shownSince = vscode.window.state.focused ? Date.now() : 0;
    }
  } catch (e) { /* offline — keep the current line, don't count it */ shownSince = 0; }
}

function startAds(context) {
  if (adTimer) clearInterval(adTimer);
  rotateAd(context);
  adTimer = setInterval(() => rotateAd(context), ROTATE_MS);
}

async function connect(context) {
  const choice = await vscode.window.showQuickPick(
    [
      { label: "I have a token (plt_…)", action: "token" },
      { label: "Create an account at platita.lat (wallet = account)", action: "create" },
    ],
    { placeHolder: "Platita — connect your account" }
  );
  if (!choice) return;
  if (choice.action === "create") {
    vscode.env.openExternal(vscode.Uri.parse(`${API}/panel.html`));
    vscode.window.showInformationMessage(
      "Create your account with your TRON wallet, copy the plt_… token, then run “Platita: Connect account” again.");
    return;
  }
  const token = (await vscode.window.showInputBox({
    prompt: "Paste your Platita token (plt_…)",
    password: true,
    validateInput: (v) => (v.trim().startsWith("plt_") ? null : "Token starts with plt_"),
  }) || "").trim();
  if (!token) return;

  try {
    const r = await get(`${API}/v1/me?token=${encodeURIComponent(token)}`);
    if (r.status !== 200) { vscode.window.showErrorMessage("Platita: invalid token"); return; }
    ensureInstalled(context, token, r.json.wallet);
    await context.globalState.update("platita.token", token);
    startPolling(context);
    startAds(context);
    vscode.window.showInformationMessage(
      `Platita connected — wallet ${r.json.wallet.slice(0, 6)}…${r.json.wallet.slice(-4)}. ` +
      `The sponsored line now rotates in your status bar and your balance grows while you code.`);
  } catch (e) {
    vscode.window.showErrorMessage("Platita: network error — try again");
  }
}

function disconnect(context) {
  // remove our statusLine hook only if it points at our script
  const settings = readJson(CLAUDE_SETTINGS);
  if (settings && settings.statusLine && String(settings.statusLine.command || "").includes(".platita")) {
    delete settings.statusLine;
    fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
  }
  context.globalState.update("platita.token", undefined);
  if (pollTimer) clearInterval(pollTimer);
  if (adTimer) clearInterval(adTimer);
  if (animTimer) { clearInterval(animTimer); animTimer = null; }
  currentAd = null;
  if (adItem) adItem.hide();
  if (statusItem) { statusItem.text = "▸ platita"; statusItem.tooltip = "Platita: disconnected — run “Platita: Connect account”"; }
  vscode.window.showInformationMessage("Platita disconnected. Your balance stays attached to your wallet at platita.lat.");
}

const touch = () => { lastUserActivityAt = Date.now(); };


function activate(context) {
  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
  statusItem.command = "platita.openPanel";
  statusItem.text = "▸ platita";
  statusItem.tooltip = "Platita: run “Platita: Connect account” to start earning";
  statusItem.show();
  context.subscriptions.push(statusItem);

  adItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  adItem.command = "platita.openAd";
  context.subscriptions.push(adItem);

  context.subscriptions.push(
    vscode.commands.registerCommand("platita.connect", () => connect(context)),
    vscode.commands.registerCommand("platita.openPanel", () =>
      vscode.env.openExternal(vscode.Uri.parse(`${API}/panel.html`))),
    vscode.commands.registerCommand("platita.openAd", () => {
      if (currentAd && currentAd.url) vscode.env.openExternal(vscode.Uri.parse(currentAd.url));
    }),
    vscode.commands.registerCommand("platita.disconnect", () => disconnect(context)),
    // window focus: an ad only counts while the window is actually visible
    vscode.window.onDidChangeWindowState((s) => {
      shownSince = s.focused && currentAd ? Date.now() : 0;
      if (s.focused) lastUserActivityAt = Date.now();
    }),
    // "the dev is actually here" — typing, scrolling, switching files
    vscode.workspace.onDidChangeTextDocument(touch),
    vscode.window.onDidChangeTextEditorSelection(touch),
    vscode.window.onDidChangeTextEditorVisibleRanges(touch),
    vscode.window.onDidChangeActiveTextEditor(touch),
    vscode.window.onDidChangeActiveTerminal(touch),
  );

  if (context.globalState.get("platita.token")) {
    startPolling(context);
    startAds(context);
  }
}

function deactivate() {
  if (pollTimer) clearInterval(pollTimer);
  if (adTimer) clearInterval(adTimer);
  if (animTimer) clearInterval(animTimer);
}

module.exports = { activate, deactivate };
