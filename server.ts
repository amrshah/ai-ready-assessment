import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { getAIAnalysis } from "./src/lib/bridge/providers";

import fs from "fs";
import path from "path";

dotenv.config();

const DB_PATH = process.env.DATABASE_URL || "leads.db";

// Ensure data directory exists if path includes subdirectories
const dbDir = path.dirname(DB_PATH);
if (dbDir !== "." && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

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

// Authentication Middleware
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const ADMIN_SECRET = process.env.ADMIN_SECRET || "AlamiaAdmin2026";
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_SECRET}`) {
    next();
  } else {
    console.warn(`[Security] Unauthorized access blocked for ${req.path}`);
    res.status(401).json({ 
      success: false, 
      error: { code: "UNAUTHORIZED", message: "Invalid credentials" } 
    });
  }
};

// Rate Limiters
const assessmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 assessment submissions per window
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many assessments. Please try again later." } }
});

const aiAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 AI diagnostic requests per hour
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "AI diagnostic limit reached. Please try again in an hour." } }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? true : false,
  }));
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_ORIGIN : true,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  // API Routes
  app.post("/api/leads", assessmentLimiter, (req, res) => {
    const { name, email, role, industry, scores, sendReport } = req.body;
    try {
      const stmt = db.prepare(
        "INSERT OR REPLACE INTO leads (name, email, role, industry, scores, send_report) VALUES (?, ?, ?, ?, ?, ?)"
      );
      const result = stmt.run(name, email, role, industry, JSON.stringify(scores), sendReport ? 1 : 0);
      res.json({ 
        success: true, 
        data: { id: result.lastInsertRowid, email } 
      });
    } catch (error: any) {
      console.error("[DB Error] Lead submission failed:", error.message);
      res.status(500).json({ 
        success: false, 
        error: { code: "DB_ERROR", message: "System failed to save your assessment data." } 
      });
    }
  });

  app.get("/api/admin/leads", adminAuth, (req, res) => {
    try {
      const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all() as any[];
      const formattedLeads = leads.map(l => ({
        ...l,
        scores: JSON.parse(l.scores)
      }));
      res.json({ success: true, data: formattedLeads });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: "DB_READ_ERROR", message: "Database retrieval failed" } 
      });
    }
  });

  app.delete("/api/admin/leads/:id", adminAuth, (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare("DELETE FROM leads WHERE id = ?");
      const result = stmt.run(id);
      if (result.changes > 0) {
        res.json({ success: true, data: { deleted_id: id } });
      } else {
        res.status(404).json({ 
          success: false, 
          error: { code: "NOT_FOUND", message: "Lead record not found" } 
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: "DB_DELETE_ERROR", message: "Failed to remove lead record" } 
      });
    }
  });

  app.post("/api/analyze", aiAnalysisLimiter, async (req, res) => {
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
      - Strategy: ${pillarScores.Strategy}%
      - Skills: ${pillarScores.Skills}%
      - Workflows: ${pillarScores.Workflows}%
      - Systems: ${pillarScores.Systems}%

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
      const text = await getAIAnalysis(prompt);
      if (!text) throw new Error("AI bridge provided empty pulse.");

      let jsonContent = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonContent = jsonMatch[0];

      const parsedData = JSON.parse(jsonContent);
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("[AI Error]", error.message);
      res.status(500).json({ 
        success: false, 
        error: { code: "AI_FAILURE", message: "AI diagnostic generation interrupted", details: error.message } 
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
