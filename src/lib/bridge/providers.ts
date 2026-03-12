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
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Masking details if it's a 503 or 404 to avoid confusing the end user
      if (response.status === 404) throw new Error("Model temporarily unavailable");
      throw new Error(`OpenRouter API error: ${response.status}`);
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
    
    const genAI = new GoogleGenAI(this.apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    
    return result.response.text() || "";
  }
}

export class OllamaProvider implements AIProvider {
  name = "Ollama";
  private host = process.env.OLLAMA_HOST || "http://localhost:11434";
  private model = process.env.OLLAMA_MODEL || "deepseek-r1:1.5b";

  async analyze(prompt: string): Promise<string> {
    // For Docker environments to reach host Ollama, use host.docker.internal if not specified
    let targetHost = this.host;
    if (process.env.NODE_ENV === "production" && targetHost.includes("localhost")) {
      targetHost = targetHost.replace("localhost", "host.docker.internal");
    }

    const response = await fetch(`${targetHost}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.response || "";
  }
}

export async function getAIAnalysis(prompt: string): Promise<string> {
  const providers: AIProvider[] = [
    new OllamaProvider(),
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
