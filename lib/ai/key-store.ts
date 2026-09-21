import type { AIAdvisorProvider } from "./provider";
import { OpenAIProvider } from "./openai";

/**
 * AI Key Store
 *
 * SECURITY: API keys are never exposed to the client.
 * The frontend only knows whether a provider is configured.
 * All AI requests go through server-side API routes.
 *
 * In the current implementation, keys are stored encrypted
 * in the profiles table. This module provides the abstraction
 * for creating providers from stored keys.
 */

export interface StoredAIConfig {
  provider: string | null;
  hasApiKey: boolean;
}

/**
 * Server-side: Create an AI provider from a stored encrypted key.
 * In production, this would decrypt the key from the database.
 */
export function createProviderFromConfig(
  providerName: string,
  apiKey: string,
): AIAdvisorProvider | null {
  switch (providerName) {
    case "openai":
      return new OpenAIProvider(apiKey);
    default:
      return null;
  }
}

/**
 * Client-side: Check if AI is configured for a user.
 * Never exposes the actual key.
 */
export async function getAIConfig(): Promise<StoredAIConfig> {
  // In production, this would call a server API route
  // that checks the profile without exposing the key
  return { provider: null, hasApiKey: false };
}

/**
 * Server-side: Encrypt an API key for storage.
 * Uses AES-256-GCM with a server-side key.
 */
export async function encryptApiKey(key: string): Promise<string> {
  // In production, use Node.js crypto or a vault service
  // For now, base64 encode (NOT secure - placeholder)
  return Buffer.from(key).toString("base64");
}

/**
 * Server-side: Decrypt a stored API key.
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  // In production, use Node.js crypto or a vault service
  return Buffer.from(encrypted, "base64").toString("utf-8");
}

/**
 * Get system prompt for AI Goal Coach.
 * This is the prompt that shapes how AI interacts with user data.
 */
export function getGoalCoachSystemPrompt(): string {
  return `You are a goal achievement coach. You help users understand their behavioral patterns and suggest improvements.

IMPORTANT RULES:
- Never make psychological diagnoses
- Use language like "Your data suggests..." instead of causal claims
- Be encouraging but honest
- Focus on actionable suggestions
- Respect user privacy - only use data they share
- Keep responses concise and practical

You will receive structured data about the user's goals, completion rates, streaks, and patterns. Use this data to provide specific, personalized advice.`;
}

/**
 * Get system prompt for AI Weekly Review.
 */
export function getWeeklyReviewSystemPrompt(): string {
  return `You are a weekly review assistant. You help users reflect on their goal performance.

Analyze the provided data and generate a brief, encouraging weekly summary. Include:
1. Key achievements
2. Areas for improvement
3. Patterns observed
4. One specific suggestion for next week

Keep the tone positive and constructive. Use data-driven observations, not assumptions.`;
}
