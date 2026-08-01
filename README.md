# Platita — get paid while your AI thinks

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/platita.platita?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=platita.platita)
[![Open VSX](https://img.shields.io/open-vsx/v/platita/platita?label=Open%20VSX)](https://open-vsx.org/extension/platita/platita)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[platita.lat](https://platita.lat)** shows one sponsored text line while your AI codes —
in your editor's status bar and in Claude Code's terminal status line — and pays you
**70% of the ad revenue** in **USDT (TRC-20)**, straight to your wallet. No banks, no
paperwork, no KYC.

**Any AI assistant counts.** The editor extension lives in VS Code / Cursor / Windsurf's own
status bar, so it works whether you code with **Copilot, ChatGPT, Claude, Gemini** or the
built-in agents. Claude Code users additionally get the line in the terminal.

This repository is the **complete code that runs on your machine**: the terminal client
*and* the editor extension. Both are tiny and dependency-free, so you can read every line
before running them.

## Install

**Option A — editor extension** (VS Code, Cursor, Windsurf — with any AI assistant)

Install **Platita** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=platita.platita)
or [Open VSX](https://open-vsx.org/extension/platita/platita), then `Cmd/Ctrl+Shift+P` →
**"Platita: Connect account"** → paste your token. Your live balance shows in the status bar.

**Option B — terminal** (one line, for Claude Code CLI)

**macOS / Linux**

```sh
curl -fsS https://platita.lat/i | sh -s -- --token plt_YOUR_TOKEN
```

**Windows (PowerShell)**

```powershell
& ([scriptblock]::Create((irm https://platita.lat/i.ps1))) -Token plt_YOUR_TOKEN
```

Or run `irm https://platita.lat/i.ps1 | iex` and it will ask for the token. The Windows
script looks for `py -3`, then `python`, then `python3` — whichever you have.

Restart Claude Code afterwards. The sponsored line starts rotating and your balance accrues.

**Requirements:** Python 3.8+ (the terminal client is stdlib-only). The editor extension
needs no Python for the status-bar line.

### Where do I get the token?

Open [platita.lat/panel.html](https://platita.lat/panel.html) and either:

- paste a **TRON (TRC-20) address** — that address *is* your account, or
- sign in with **[Telegram](https://t.me/platitalatbot)** if you don't have a crypto wallet —
  you then get paid inside Telegram, with no address and no network fee.

No email, no password, no KYC either way. Your `plt_…` token appears in the panel with a
Copy button.

## Why it's safe by design

- **Open source, end to end** — everything that runs on your machine is in this repo:
  the terminal client, the editor extension ([`vscode/`](vscode/)) and even the one-line
  bootstrap scripts ([`i.sh`](i.sh), [`i.ps1`](i.ps1)) that `curl | sh` and `irm | iex`
  fetch. Nothing you execute is hidden on a server.
- **Official hooks only** — we use Claude Code's `statusLine` hook and the editor's
  status-bar API. We never patch the editor bundle, weaken CSP, or inject code.
- **Minimal data** — your account token and impression counts. Never your code,
  prompts, AI responses, files or paths. To tell whether the AI is actually working,
  the extension reads only the *modification time* of Claude Code's session file —
  never a byte of its contents.
- **Billed on real attention** — an impression counts only while the window is focused
  and you're actually working. Idle window, minimized, away from the keyboard: nothing
  is counted.
- **Your wallet is your account** — no email, no KYC, no custody. Payouts in USDT
  (TRC-20), verifiable on Tronscan. 70% of ad revenue is yours.
- **Uninstall in 10 seconds** — one settings key; your balance lives on your wallet.

## How it works

- [`platita_statusline.py`](platita_statusline.py) prints one line from a local cache
  (answers in ~0.2s, silent offline fallback) and refreshes the ad every 30s via
  Claude Code's official `statusLine` hook (`~/.claude/settings.json`).
- The [editor extension](vscode/) rotates the same line in your status bar and shows your
  live balance. It wires the same official hook — nothing is patched or injected.
- One impression = the ad stayed on screen a full rotation. The server re-validates
  everything and rate-caps per account.

**Data sent to platita.lat:** your account token, ad impression counts. That's the entire
list. **Never sent:** your code, prompts, AI responses, files, paths, or anything else.

## Zero effort by design

You install it once and never touch it again. You're already staring at the screen while
your AI works — now that time pays you back. **70% of every ad dollar is yours**, and every
dev you invite adds +10% on top, for life.

How much that adds up to depends on ad demand and how much you code — we'd rather you see
it in your own panel than trust a promise on a page. Impressions are rate-capped server-side
(4/min, 600/day): this is an ad network, not a farm.

## Earn more

**Referrals:** every dev who signs up with your code earns you **+10% of what they make,
for life** — from our share, not theirs. Your invite link is in
[your panel](https://platita.lat/panel.html).

## For advertisers

One plain-text line (60 characters + your URL) on the most-watched screen in software:
the developer's editor, while their AI writes code.

- **Audience:** developers using AI assistants (Copilot, ChatGPT, Claude, Gemini) —
  Spanish-first, worldwide delivery
- **Country targeting:** pick countries and budget share on a map; enforced server-side
  by the developer's IP, so it can't be spoofed
- **Billed on attention, not "impressions":** a view counts only while the editor window
  is focused and the developer is actually working; views during real AI wait-states are
  flagged separately as premium inventory
- **Self-serve, crypto-native:** pay in USDT (TRC-20 on-chain, or in two taps via
  CryptoBot inside Telegram), budgets from **$1**, live stats, pause or stop anytime —
  unspent budget is refunded to your balance
- **CPM $2–4** depending on frequency

Start here: [platita.lat/anunciantes.html](https://platita.lat/anunciantes.html) ·
questions: ads@platita.lat

## Uninstall (10 seconds)

Remove the `statusLine` key from `~/.claude/settings.json` (a backup
`settings.json.platita.bak` is created at install), then delete `~/.platita`.
Or, in the extension: **"Platita: Disconnect"**. Your balance stays attached to your wallet,
not this machine.

## En español

Platita muestra una línea patrocinada mientras tu IA programa y te paga el 70% del ingreso
en USDT (TRC-20). Este repositorio es todo el código que corre en tu máquina — el cliente de
terminal y la extensión del editor, sin dependencias, para que audites cada línea.
Preguntas: [t.me/platitalat](https://t.me/platitalat).

---

- Site: [platita.lat](https://platita.lat) · Telegram: [t.me/platitalat](https://t.me/platitalat)
- Terms: [platita.lat/terminos.html](https://platita.lat/terminos.html) · Privacy: [platita.lat/privacidad.html](https://platita.lat/privacidad.html)
