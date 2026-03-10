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
      You are an Expert AI Product Architect and Productivity Specialist. Analyze the following AI Readiness Assessment results for a professional:
      
      Total Score: ${totalScore}%
      Readiness Level: ${readinessLevel}
      
      Pillar Scores:
      - Strategy: ${pillarScores.Strategy}%
      - Skills: ${pillarScores.Skills}%
      - Workflows: ${pillarScores.Workflows}%
      - Systems: ${pillarScores.Systems}%
      
      Context:
      - Role: ${context.role || 'Not specified'}
      - Industry: ${context.industry || 'Not specified'}
      
      Provide a professional diagnostic report focused on productivity.
      
      RETURN THE RESPONSE STRICTLY AS A JSON OBJECT with the following structure:
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
      console.log("Sending prompt to Alamia AI...");
      const text = await getAIAnalysis(prompt);
      console.log("AI raw response:", text);
      
      if (!text) {
        throw new Error("Empty response from AI engine");
      }

      try {
        const cleanedText = text.replace(/```json\n?|```/g, "").trim();
        res.json(JSON.parse(cleanedText));
      } catch (parseError: any) {
        console.error("JSON Parse Error:", parseError, "Raw text:", text);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
    } catch (error: any) {
      console.error("AI API error details:", error);
      res.status(500).json({ 
        error: "Failed to generate AI insights",
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
