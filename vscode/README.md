# Platita — get paid while your AI thinks

While your AI writes code, one sponsored text line sits in your editor's status bar — and
**[platita.lat](https://platita.lat) pays you 70% of the ad revenue in USDT (TRC-20)**,
straight to your wallet. Your wallet IS your account: no banks, no KYC, no paperwork.

**Works with any AI assistant** — Copilot, ChatGPT, Claude, Gemini, Cursor's or Windsurf's
built-in agents. The extension lives in the editor's own status bar, so it doesn't care which
assistant you use. Claude Code users additionally get the line in the terminal status line.

## Quick start (30 seconds)

1. Get your token: open [platita.lat/panel.html](https://platita.lat/panel.html), sign in
   with your TRON wallet — your `plt_…` token is right there with a Copy button.
2. In VS Code press **Cmd+Shift+P** (Windows/Linux: **Ctrl+Shift+P**) →
   **`Platita: Connect account`** → paste your `plt_…` token.
3. Done — the sponsored line starts rotating in your editor's status bar and your
   live balance appears next to it. (Claude Code CLI users also get the line in
   the terminal status line.)

Reconnecting with a different token later is fine — impressions simply start
counting toward the account you connected last.

## What this extension does

- **Rotates the sponsored line right in your editor's status bar** (VS Code, Cursor,
  Windsurf) — an impression only counts while your window is actually focused
- **Connects your account in two clicks** — `Platita: Connect account`, paste your token
  (or create an account at [platita.lat/panel.html](https://platita.lat/panel.html) with your TRON wallet)
- **Wires Claude Code's official `statusLine` hook** — the same ad line shows in the
  Claude Code CLI too; no patching, no code injection
- **Shows your live balance in the status bar** — `▸ $0.0420`, click to open your panel

## Trust

The terminal client this extension installs is **open source and dependency-free**:
[github.com/PinnacleDynamics/platita-client](https://github.com/PinnacleDynamics/platita-client).
It sends your account token and impression counts — nothing else. **Your code, prompts
and files never leave your machine.**

## Payouts

Every Friday from $10, in USDT (TRC-20), verifiable on Tronscan. The TRC-20 network
fee is deducted from the payout. Invite a dev — earn **+10% of their earnings for life**
(from our share, not theirs).

## Uninstall

`Platita: Disconnect` removes the status-line hook. Your balance stays attached to
your wallet at platita.lat, not to this machine.

---

Español: Platita muestra una línea patrocinada mientras tu IA trabaja y te paga el 70%
en USDT. Preguntas: [t.me/platitalat](https://t.me/platitalat) · [Términos](https://platita.lat/terminos.html) · [Privacidad](https://platita.lat/privacidad.html)
