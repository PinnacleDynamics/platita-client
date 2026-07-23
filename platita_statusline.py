#!/usr/bin/env python3
"""Platita — Claude Code statusline client. stdlib only, zero deps.

Claude Code invokes this command to render the status line (official
`statusLine` hook — we do NOT patch any editor bundle). It must be fast:
we always print from a local cache and refresh over the network only when
the cache is stale, with a short timeout and silent fallback.

Impression model (server re-checks everything, this is just bookkeeping):
one impression = the previous ad was on screen for a full rotation
(>=25s between refreshes and the session stayed alive, <=120s gap).
"""
import json
import os
import sys
import time
import urllib.request

CONF_DIR = os.path.expanduser("~/.platita")
CONF = os.path.join(CONF_DIR, "config.json")
CACHE = os.path.join(CONF_DIR, "cache.json")
TIMEOUT = 0.6          # never make Claude Code wait
ROTATE_SEC = 30
MIN_VISIBLE = 25       # full-ish rotation counts as an impression
MAX_GAP = 120          # laptop slept / session gone — don't count

FALLBACK = "▸ platita.lat — te pagan por esperar"


def _load(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return {}


def _save(path, data):
    try:
        os.makedirs(CONF_DIR, exist_ok=True)
        tmp = path + ".tmp"
        with open(tmp, "w") as f:
            json.dump(data, f)
        os.replace(tmp, path)
    except Exception:
        pass


def _api(conf, path, payload=None):
    base = conf.get("api", "http://localhost:8788")
    req = urllib.request.Request(
        base + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Content-Type": "application/json"},
        method="POST" if payload is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.load(r)


def main():
    # Claude Code pipes session JSON to stdin — read and ignore for now.
    try:
        if not sys.stdin.isatty():
            sys.stdin.read()
    except Exception:
        pass

    conf = _load(CONF)
    if not conf.get("token"):
        print(FALLBACK + "  ·  instala: platita.lat")
        return

    cache = _load(CACHE)
    now = time.time()
    age = now - cache.get("fetched_at", 0)

    if age >= ROTATE_SEC:
        # 1) count the ad that just finished rotating
        pending = cache.get("pending", [])
        if cache.get("ad", {}).get("ad_id") and MIN_VISIBLE <= age <= MAX_GAP:
            pending.append(cache["ad"]["ad_id"])

        # 2) refresh ad + flush impressions (best-effort, silent fallback)
        try:
            ad = _api(conf, "/v1/ad?token=" + conf["token"])
            balance = cache.get("balance_usd")
            if pending:
                counts = {}
                for aid in pending:
                    counts[aid] = counts.get(aid, 0) + 1
                for aid, n in counts.items():
                    resp = _api(conf, "/v1/impressions",
                                {"token": conf["token"], "ad_id": aid, "count": n})
                    balance = resp.get("balance_usd", balance)
                pending = []
            cache = {"ad": ad, "fetched_at": now, "pending": pending, "balance_usd": balance}
            _save(CACHE, cache)
        except Exception:
            cache["fetched_at"] = now - ROTATE_SEC + 10   # retry in 10s
            cache["pending"] = pending[-40:]
            _save(CACHE, cache)

    ad = cache.get("ad") or {}
    text = ad.get("text") or FALLBACK.lstrip("▸ ")
    line = "▸ " + text
    bal = cache.get("balance_usd")
    if bal is not None:
        line += f"   ·   ganado: ${bal:.4f}"
    print(line[:160])


if __name__ == "__main__":
    main()
