export type { AIAdvisorProvider, AIMessage, AIProviderResponse } from "./provider";
export { OpenAIProvider } from "./openai";
export {
  createProviderFromConfig,
  getAIConfig,
  encryptApiKey,
  decryptApiKey,
  getGoalCoachSystemPrompt,
  getWeeklyReviewSystemPrompt,
  type StoredAIConfig,
} from "./key-store";
