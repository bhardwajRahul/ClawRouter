import { describe, expect, it } from "vitest";

import { deriveSessionId, DEFAULT_SESSION_CONFIG } from "./session.js";

describe("deriveSessionId", () => {
  it("returns same ID for same first user message", () => {
    const messages = [{ role: "user", content: "hello world" }];
    const id1 = deriveSessionId(messages);
    const id2 = deriveSessionId(messages);
    expect(id1).toBe(id2);
  });

  it("returns different IDs for different first user messages", () => {
    const a = deriveSessionId([{ role: "user", content: "first conversation" }]);
    const b = deriveSessionId([{ role: "user", content: "second conversation" }]);
    expect(a).not.toBe(b);
  });

  it("is stable regardless of subsequent messages", () => {
    const firstMsg = { role: "user", content: "what is the capital of France?" };
    const id1 = deriveSessionId([firstMsg]);
    const id2 = deriveSessionId([
      firstMsg,
      { role: "assistant", content: "Paris" },
      { role: "user", content: "and Germany?" },
    ]);
    expect(id1).toBe(id2);
  });

  it("skips system messages and uses first user message", () => {
    const withSystem = [
      { role: "system", content: "you are a helpful assistant" },
      { role: "user", content: "my question" },
    ];
    const withoutSystem = [{ role: "user", content: "my question" }];
    expect(deriveSessionId(withSystem)).toBe(deriveSessionId(withoutSystem));
  });

  it("returns undefined when no user messages exist", () => {
    expect(deriveSessionId([])).toBeUndefined();
    expect(deriveSessionId([{ role: "system", content: "only system" }])).toBeUndefined();
  });

  it("returns a short hex string (8 chars)", () => {
    const id = deriveSessionId([{ role: "user", content: "test" }]);
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("DEFAULT_SESSION_CONFIG", () => {
  it("has session persistence enabled by default", () => {
    expect(DEFAULT_SESSION_CONFIG.enabled).toBe(true);
  });
});
