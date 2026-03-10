import { GoogleGenAI } from "@google/genai";

export interface AIProvider {
  name: string;
  analyze(prompt: string): Promise<string>;
}

export class SambaNovaProvider implements AIProvider {
  name = "SambaNova";
  private apiKey = process.env.SAMBANOVA_API_KEY;

  async analyze(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error("SAMBANOVA_API_KEY missing");
    
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.3-70B-Instruct",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SambaNova API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

export class OpenRouterProvider implements AIProvider {
  name = "OpenRouter";
  private apiKey = process.env.OPENROUTER_API_KEY;

  async analyze(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error("OPENROUTER_API_KEY missing");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://github.com/antigravity",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-405b:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

export class GeminiProvider implements AIProvider {
  name = "Gemini";
  private apiKey = process.env.GEMINI_API_KEY;

  async analyze(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error("GEMINI_API_KEY missing");
    
    const genAI = new GoogleGenAI(this.apiKey) as any;
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export async function getAIAnalysis(prompt: string): Promise<string> {
  const providers: AIProvider[] = [
    new SambaNovaProvider(),
    new OpenRouterProvider(),
    new GeminiProvider()
  ];

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      console.log(`[Bridge] Trying provider: ${provider.name}...`);
      const result = await provider.analyze(prompt);
      if (result) {
        console.log(`[Bridge] Success with ${provider.name}`);
        return result;
      }
    } catch (e: any) {
      console.warn(`[Bridge] Provider ${provider.name} failed: ${e.message}`);
      errors.push(`${provider.name}: ${e.message}`);
    }
  }

  throw new Error(`AI Analysis failed across all providers: ${errors.join("; ")}`);
}
