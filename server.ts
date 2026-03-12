import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { getAIAnalysis } from "./src/lib/bridge/providers";

dotenv.config();

const DB_PATH = process.env.DATABASE_URL || "leads.db";
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT,
    industry TEXT,
    scores TEXT,
    send_report INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/leads", (req, res) => {
    const { name, email, role, industry, scores, sendReport } = req.body;
    try {
      const stmt = db.prepare(
        "INSERT OR REPLACE INTO leads (name, email, role, industry, scores, send_report) VALUES (?, ?, ?, ?, ?, ?)"
      );
      stmt.run(name, email, role, industry, JSON.stringify(scores), sendReport ? 1 : 0);
      res.json({ success: true });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    const { pillarScores, totalScore, readinessLevel, context } = req.body;
    
    const prompt = `
      You are the Lead AI Strategist at Alamia. Analyze this professional's AI Readiness Assessment based on the Alamia AI Maturity Framework.

      USER PROFILE:
      - Role: ${context.role || 'Professional'}
      - Industry: ${context.industry || 'Not specified'}

      PERFORMANCE DATA:
      - Total Score: ${totalScore}%
      - Maturity Tier: ${readinessLevel}
      
      PILLAR BREAKDOWN:
      - Strategy (Alignment & Use Case Clarity): ${pillarScores.Strategy}%
      - Skills (Prompting & Output Evaluation): ${pillarScores.Skills}%
      - Workflows (Daily Integration & Repeatability): ${pillarScores.Workflows}%
      - Systems (Tools, Governance & Infrastructure): ${pillarScores.Systems}%

      DIAGNOSTIC REQUIREMENTS:
      1. Provide a concise maturity summary (2-3 sentences).
      2. Identify 3 specific strengths based on their highest pillars.
      3. Identify 2 critical "Technical & Strategy Gaps" where they are losing productivity.
      4. List 3 high-impact "Next Actions" that can be automated within 24 hours.
      5. Recommend a product from the Alamia Ecosystem (e.g., AI Workflow Library, Prompt Engineering Playbook, or Startup Idea Validation Kit) that matches their specific gaps.

      RETURN THE RESPONSE STRICTLY AS A VALID JSON OBJECT:
      {
        "readiness_level": "string",
        "summary": "string",
        "strengths": ["string"],
        "capability_gaps": ["string"],
        "recommended_actions": ["string"],
        "product_recommendation": {
          "name": "string",
          "description": "string",
          "price": "string",
          "benefits": ["string"]
        }
      }
    `;

    try {
      console.log(`[Alamia AI] Analyzing assessment for ${context.role || 'User'}...`);
      const text = await getAIAnalysis(prompt);
      
      if (!text) {
        throw new Error("Empty response from AI bridge");
      }

      // Robust JSON extraction
      let jsonContent = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      try {
        const parsedData = JSON.parse(jsonContent);
        res.json(parsedData);
      } catch (parseError: any) {
        console.error("JSON Parse Error. Raw response:", text);
        throw new Error("AI generated an invalid report format. Please retry.");
      }
    } catch (error: any) {
      console.error("[Internal Error] AI Analysis failed:", error.message);
      res.status(500).json({ 
        error: "Diagnostic failed",
        details: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
