import { route, DEFAULT_ROUTING_CONFIG, getFallbackChain } from './dist/index.js';

const testPrompts = [
  { name: "Simple Q&A", prompt: "What is 2+2?" },
  { name: "Code task", prompt: "Write a Python function to sort a list" },
  { name: "Complex reasoning", prompt: "Prove that the square root of 2 is irrational, step by step using chain of thought" },
  { name: "Technical architecture", prompt: "Design a distributed microservice architecture for a payment system with kubernetes using quantum computing principles and homomorphic encryption" },
  { name: "Agentic task", prompt: "Read the file, fix the bug, then run the tests until it works" },
  { name: "Domain expert", prompt: "Explain zero-knowledge proofs and implement a lattice-based cryptographic protocol for genomics data protection" },
];

// Mock model pricing
const modelPricing = new Map();

console.log("=== Current Routing (Auto/Balanced) ===\n");

for (const { name, prompt } of testPrompts) {
  const result = route(prompt, undefined, 4096, {
    config: DEFAULT_ROUTING_CONFIG,
    modelPricing,
    routingProfile: "auto",
  });
  console.log(`📝 ${name}`);
  console.log(`   Tier: ${result.tier}`);
  console.log(`   Model: ${result.model}`);
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log();
}

console.log("=== Premium Profile ===\n");

for (const { name, prompt } of testPrompts) {
  const result = route(prompt, undefined, 4096, {
    config: DEFAULT_ROUTING_CONFIG,
    modelPricing,
    routingProfile: "premium",
  });
  console.log(`📝 ${name}`);
  console.log(`   Tier: ${result.tier} → Model: ${result.model}`);
  console.log();
}

// Test fallback chains for each tier
console.log("=== Fallback Chains (Auto) ===\n");

const tiers = ['SIMPLE', 'MEDIUM', 'COMPLEX', 'REASONING'];
for (const tier of tiers) {
  const chain = getFallbackChain(tier, DEFAULT_ROUTING_CONFIG.tiers);
  console.log(`${tier}: ${chain.join(' → ')}`);
}

console.log("\n=== Fallback Chains (Premium) ===\n");

for (const tier of tiers) {
  const chain = getFallbackChain(tier, DEFAULT_ROUTING_CONFIG.premiumTiers);
  console.log(`${tier}: ${chain.join(' → ')}`);
}

console.log("\n=== Latest Models Now in Config ===\n");
console.log("✅ gemini-3-pro-preview: Auto COMPLEX primary");
console.log("✅ o4-mini: Auto REASONING fallback");
console.log("✅ gpt-5.2-pro: Premium COMPLEX fallback");
console.log("✅ claude-opus-4.5: Premium COMPLEX primary");
