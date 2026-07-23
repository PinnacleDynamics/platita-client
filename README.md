# Platita client — get paid while your AI thinks

**[platita.lat](https://platita.lat)** shows one sponsored text line in your terminal
while Claude Code works — and pays you **70% of the ad revenue** in **USDT (TRC-20)**,
straight to your wallet. No banks, no paperwork, no KYC.

This repository contains the **complete client** that runs on your machine.
It is intentionally tiny (2 files, Python stdlib only, zero dependencies) so you
can read every line before running it.

## Install

Create an account at [platita.lat/panel.html](https://platita.lat/panel.html)
(your TRON wallet IS your account), then:

```sh
curl -fsS https://platita.lat/i | sh -s -- --token plt_YOUR_TOKEN
```

Restart Claude Code. Done — the status line now rotates sponsored lines and your
balance accrues. Payouts every Friday from $10, verifiable on Tronscan.

## How it works — and what it does NOT do

- Uses Claude Code's **official `statusLine` hook** (`~/.claude/settings.json`).
  Nothing is patched, injected or hooked into the editor or the model.
- [`platita_statusline.py`](platita_statusline.py) prints one line from a local
  cache (answers in ~0.2s, silent offline fallback) and refreshes the ad every 30s.
- One impression = the previous ad stayed on screen a full rotation.
  The server re-validates everything and rate-caps per account.

**Data sent to platita.lat:** your account token, ad impression counts. That's the
entire list. **Never sent:** your code, prompts, AI responses, files, paths, or
anything else from your machine. Verify it yourself — the whole client is here.

## Uninstall (10 seconds)

Remove the `statusLine` key from `~/.claude/settings.json` (a backup
`settings.json.platita.bak` is created at install), then delete `~/.platita`.
Your balance stays attached to your wallet, not this machine.

## Es en español

Platita muestra una línea patrocinada en tu terminal mientras tu IA trabaja y te
paga el 70% del ingreso en USDT (TRC-20). Este repositorio es el cliente completo —
2 archivos de Python sin dependencias, para que puedas auditar cada línea.
Instalación, desinstalación y detalles arriba. Preguntas: [t.me/platitalat](https://t.me/platitalat).

---

- Site: [platita.lat](https://platita.lat) · Telegram: [t.me/platitalat](https://t.me/platitalat)
- Terms: [platita.lat/terminos.html](https://platita.lat/terminos.html) · Privacy: [platita.lat/privacidad.html](https://platita.lat/privacidad.html)
