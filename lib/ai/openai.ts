import type { AIAdvisorProvider, AIMessage, AIProviderResponse } from "./provider";

export class OpenAIProvider implements AIAdvisorProvider {
  readonly name = "openai";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith("sk-"));
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async chat(messages: AIMessage[]): Promise<AIProviderResponse> {
    if (!this.isAvailable()) {
      return { content: "", error: "Invalid API key" };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          content: "",
          error: errorData.error?.message ?? `API error: ${response.status}`,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      return { content };
    } catch (error) {
      return {
        content: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
