# ClawRouter v0.11.0 — Feb 28, 2026

## Feature 1: Three-Strike Escalation — auto-upgrade on repetitive loops

Kimi K2.5 (the default SIMPLE/MEDIUM model in auto mode) sometimes gets stuck in agentic loops — calling the same tool or generating the same content repeatedly. Previously, users had to manually switch to a higher-tier model to break out.

Now ClawRouter tracks request fingerprints per session. When **3 consecutive requests produce the same hash** (same user content + same tool calls), the session is automatically escalated to the next tier.

```
Request 1: hash=abc123  → strikes: 0
Request 2: hash=abc123  → strikes: 1
Request 3: hash=abc123  → strikes: 2 → ESCALATE!

[ClawRouter] ⚡ 3-strike escalation: moonshot/kimi-k2.5 → anthropic/claude-sonnet-4 (MEDIUM → COMPLEX)
```

### How it works

- **Fingerprint**: SHA-256 of normalized user message + sorted tool call names (12-char hex)
- **Sliding window**: Last 3 request hashes tracked per session
- **One-shot**: Escalation fires once per session (`escalated` flag prevents re-triggering)
- **Tier progression**: SIMPLE → MEDIUM → COMPLEX → REASONING (stops at max)

### Files changed

- `src/session.ts` — new `recordRequestHash()`, `escalateSession()`, `hashRequestContent()`
- `src/proxy.ts` — detection logic in session routing block

---

## Feature 2: `/image` command — generate images from chat

Users can now generate images directly from the chat interface using the `/image` command. Powered by BlockRun's image generation API with x402 micropayments.

### Usage

```
/image a cat wearing sunglasses
/image --model dall-e-3 a futuristic city at sunset
/image --model banana-pro --size 2048x2048 mountain landscape
```

### Available models & pricing

| Model | Shorthand | Price |
|-------|-----------|-------|
| Google Nano Banana (default) | `nano-banana`, `banana` | $0.05/image |
| Google Nano Banana Pro | `banana-pro` | $0.10/image (up to 4K) |
| OpenAI DALL-E 3 | `dall-e-3`, `dalle` | $0.04/image |
| OpenAI GPT Image 1 | `gpt-image` | $0.02/image |
| Black Forest Flux 1.1 Pro | `flux` | $0.04/image |

### How it works

1. User sends `/image <prompt>` as a chat message
2. ClawRouter intercepts it in the proxy (same pattern as `/debug`)
3. Calls `POST /v1/images/generations` upstream with x402 payment
4. Returns the image URL as a markdown image in a synthetic chat completion

Running `/image` with no prompt shows full usage help with all models and pricing.

---

### Upgrade

```bash
curl -fsSL https://blockrun.ai/ClawRouter-update | bash
```
