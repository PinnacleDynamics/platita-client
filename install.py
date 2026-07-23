#!/usr/bin/env python3
"""Platita installer — wallet in, statusline on. stdlib only.

Usage:
    python3 install.py TTuWalletTron...           # new account (registers wallet)
    python3 install.py --token plt_...            # existing account (from platita.lat/panel.html)
    options: [--ref CODE] [--api https://platita.lat]

Does three things:
  1. registers the wallet (or validates your token) → saves ~/.platita/config.json
  2. backs up ~/.claude/settings.json
  3. sets Claude Code's official `statusLine` hook to our client script
Uninstall: restore the .bak file or delete the statusLine key. Your money
stays attached to your wallet, not this machine.
"""
import json
import os
import shutil
import sys
import urllib.parse
import urllib.request

DEFAULT_API = os.environ.get("PLATITA_API", "https://platita.lat")
CONF_DIR = os.path.expanduser("~/.platita")
CLAUDE_SETTINGS = os.path.expanduser("~/.claude/settings.json")


def _post(api, path, payload):
    req = urllib.request.Request(
        api + path, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.load(r)


def _get(api, path):
    with urllib.request.urlopen(api + path, timeout=10) as r:
        return json.load(r)


def main():
    argv = sys.argv[1:]
    api, ref, token = DEFAULT_API, None, None
    pos = []
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--api" and i + 1 < len(argv):
            api = argv[i + 1]; i += 2; continue
        if a == "--ref" and i + 1 < len(argv):
            ref = argv[i + 1]; i += 2; continue
        if a == "--token" and i + 1 < len(argv):
            token = argv[i + 1]; i += 2; continue
        pos.append(a); i += 1

    if not token and not pos:
        print(__doc__)
        sys.exit(1)

    if token:
        # existing account: validate token, learn the wallet
        me = _get(api, "/v1/me?token=" + urllib.parse.quote(token))
        wallet = me["wallet"]
        print(f"✔ token válido · wallet {wallet[:6]}…{wallet[-4:]} · saldo ${me['balance_usd']}")
    else:
        wallet = pos[0].strip()
        out = _post(api, "/v1/register", {"wallet": wallet, "ref": ref})
        token = out["token"]
        print(f"✔ wallet registrada · tu ref code: {out['ref_code']} · share: {int(out['share']*100)}%")
        print(f"  TOKEN (guárdalo): {token}")

    os.makedirs(CONF_DIR, exist_ok=True)
    with open(os.path.join(CONF_DIR, "config.json"), "w") as f:
        json.dump({"token": token, "wallet": wallet, "api": api}, f, indent=2)

    # wire the Claude Code statusline (official hook, reversible)
    script = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "platita_statusline.py"))
    settings = {}
    if os.path.exists(CLAUDE_SETTINGS):
        shutil.copy(CLAUDE_SETTINGS, CLAUDE_SETTINGS + ".platita.bak")
        try:
            with open(CLAUDE_SETTINGS) as f:
                settings = json.load(f)
        except Exception:
            settings = {}
    settings["statusLine"] = {"type": "command", "command": f"python3 {script}"}
    os.makedirs(os.path.dirname(CLAUDE_SETTINGS), exist_ok=True)
    with open(CLAUDE_SETTINGS, "w") as f:
        json.dump(settings, f, indent=2)
    print(f"✔ statusline conectada ({CLAUDE_SETTINGS})")
    print("✔ listo — abre Claude Code y empieza a ganar · panel: https://platita.lat/panel.html")


if __name__ == "__main__":
    main()
