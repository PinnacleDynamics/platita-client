# Platita — get paid while your AI thinks

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/platita.platita?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=platita.platita)
[![Open VSX](https://img.shields.io/open-vsx/v/platita/platita?label=Open%20VSX)](https://open-vsx.org/extension/platita/platita)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[platita.lat](https://platita.lat)** shows one sponsored text line while your AI codes —
in Claude Code's status line and in your editor's status bar — and pays you **70% of the
ad revenue** in **USDT (TRC-20)**, straight to your wallet. No banks, no paperwork, no KYC.

This repository is the **complete code that runs on your machine**: the terminal client
*and* the editor extension. Both are tiny and dependency-free, so you can read every line
before running them.

## Install

**Option A — editor extension** (VS Code, Cursor, Windsurf)

Install **Platita** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=platita.platita)
or [Open VSX](https://open-vsx.org/extension/platita/platita), then `Cmd/Ctrl+Shift+P` →
**"Platita: Connect account"** → paste your token. Your live balance shows in the status bar.

**Option B — terminal** (one line)

Create an account at [platita.lat/panel.html](https://platita.lat/panel.html)
(your TRON wallet IS your account), then:

```sh
curl -fsS https://platita.lat/i | sh -s -- --token plt_YOUR_TOKEN
```

Restart Claude Code. Done — the sponsored line rotates and your balance accrues.
Payouts every Friday from $10, verifiable on Tronscan.

## Why it's safe by design

- **Open source, end to end** — this terminal client *and* the editor extension
  ([`vscode/`](vscode/)) are both here. Read every line before you run it.
- **Official hooks only** — we use Claude Code's `statusLine` hook and the editor's
  status-bar API. We never patch the editor bundle, weaken CSP, or inject code.
- **Minimal data** — your account token and impression counts. Never your code,
  prompts, AI responses, files or paths. The whole client is auditable above.
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

## Earn more

**Referrals:** every dev who signs up with your code earns you **+10% of what they make,
for life** — from our share, not theirs. Your invite link is in
[your panel](https://platita.lat/panel.html).

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
