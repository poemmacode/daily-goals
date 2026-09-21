export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProviderResponse {
  content: string;
  error?: string;
}

export interface AIAdvisorProvider {
  readonly name: string;
  chat(messages: AIMessage[]): Promise<AIProviderResponse>;
  isAvailable(): boolean;
  validateKey(apiKey: string): Promise<boolean>;
}
