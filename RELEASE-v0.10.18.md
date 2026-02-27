# ClawRouter v0.10.18 — Feb 26, 2026

## Bug Fix: Session re-pins to fallback model after provider failure

### Problem

v0.10.17 introduced session persistence but pinned the session to the **routing decision** (primary model), not the **actual model that responded**. When the primary was rate-limited:

- Request 1: routes → kimi-k2.5 (pinned to session) → rate-limited → falls back to gemini-flash
- Request 2: session says kimi-k2.5 → rate-limited again → falls back to gemini-flash again
- Result: every message retried the failing primary, conversation stayed stuck in a loop

Users saw the model "keep jumping" to gemini-flash on every turn.

### Fix

After the fallback loop resolves the actual model used, update the session pin:

```
Request 1: routes → kimi-k2.5 → rate-limited → gemini-flash responds
           session updated: kimi-k2.5 → gemini-flash
Request 2: session says gemini-flash → used directly, stable
Request 3: session says gemini-flash → stable
```

The conversation now stays on the working model for the full 30-minute session window instead of retrying the failing primary on every turn.

### Technical

- `effectiveSessionId` lifted to outer scope so the derived session ID (from first user message hash) is accessible after the fallback loop
- `sessionStore.setSession(effectiveSessionId, actualModelUsed, tier)` called after fallback resolves when `actualModelUsed !== routingDecision.model`
- `SessionStore.setSession` already handled model updates — this was a wiring fix in `proxy.ts`

### Upgrade

```bash
~/.blockrun/scripts/update.sh
```
