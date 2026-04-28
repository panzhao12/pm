import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const INDUSTRIES = [
  "fintech or banking",
  "healthcare or biotech",
  "e-commerce or retail",
  "enterprise SaaS or B2B software",
  "gaming",
  "edtech or online learning",
  "logistics or supply chain",
  "social media or creator economy",
  "travel or hospitality",
  "food delivery or restaurant tech",
  "hardware or consumer electronics",
  "marketplace or platform business",
  "media or streaming",
  "automotive or mobility",
  "climate tech or clean energy",
  "cybersecurity",
  "developer tools or infrastructure",
  "proptech or real estate tech",
  "insurtech",
  "legaltech or regtech",
  "mental health or wellness tech",
  "sports tech or fan engagement",
  "agriculture tech",
  "space tech or deep tech",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow requests from your GitHub Pages domain
  res.setHeader("Access-Control-Allow-Origin", "https://olgapan.de");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server." });
  }

  const randomIndustry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];

  const prompt = `
    Act as a senior Product Management researcher and professor at a world-class business school (HBS, Stanford GSB, or INSEAD).
    Your task is to generate a rigorous, publication-quality product management case study suitable for professional study, MBA curricula, and industry research.
    
    STRICT CONSTRAINTS — you MUST follow all of these:
    1. Only write about real events that genuinely happened between 2015 and 2025 (the last 10 years). All facts, data points, and metrics must be accurate and verifiable.
    2. Focus on the "${randomIndustry}" industry.
    3. The company can be any size — startup, scale-up, or global enterprise. Do not limit to obvious choices; choose the most instructive example for the industry.
    4. Every numbered statistic or claim should be something a professional researcher could verify. If uncertain, omit it rather than guess.
    5. Generate a completely different case study each time — vary the company, the challenge type, and the geographic market.
    
    The case study must be deeply analytical, not surface-level. Include strategic context, organizational dynamics, and the trade-offs the product team faced.
    
    Format the output in Markdown with the following sections:
    
    # [Compelling, Specific Title — e.g. "How Duolingo Engineered Habit Loops to Survive the Post-Pandemic Retention Cliff"]
    **Company:** [Company Name]
    **Industry:** [Specific sector]
    **Headquarters:** [City, Country]
    **Era:** [Specific year or narrow range, e.g. 2021–2023]
    **Difficulty Level:** [Beginner / Intermediate / Advanced] *(for study purposes)*
    
    ## Executive Summary
    [2–3 sentences summarizing the case for busy professionals. What happened, what decision was made, and what can be learned.]
    
    ## The Background
    [Comprehensive context: company history, competitive landscape, market conditions, team structure, and the strategic pressures at play. Write for a reader who is unfamiliar with the company.]
    
    ## The Challenge
    [The core product management dilemma. What was the problem? Why was it hard? What were the competing priorities, stakeholder pressures, and constraints? What were the stakes if they got it wrong?]
    
    ## The Solution (or The Pivot)
    [Detail the product strategy, the hypothesis behind their approach, how they prioritized, how they validated assumptions, and how they executed. Include any frameworks or methodologies they used.]
    
    ## The Results
    [Quantified outcomes where verifiable — user growth, revenue impact, retention changes, market share shifts. Also cover second-order effects and unintended consequences.]
    
    ## Key Takeaways for Product Managers
    [Provide 4–5 deep, actionable lessons. Go far beyond surface-level advice. Each lesson should be a principle a senior PM or CPO could apply immediately, with reasoning grounded in the case.]
    
    ## Discussion Questions
    [3 thought-provoking questions suitable for an MBA seminar or team retrospective, designed to spark debate about the decisions made.]
    
    ## References & Further Reading
    [List 4–6 real, verifiable sources. Include a mix of:
    - Books (author, title, publisher, year)
    - Long-form journalism (publication, author, headline, year)
    - Academic or business school case studies (institution, author, year)
    - Official sources: earnings calls, investor letters, company blogs, executive interviews
    - Podcasts or documentaries if directly relevant
    
    Format each as: **[Source Type]** — [Full citation]
    Only include sources you are confident genuinely exist. Omit any you are uncertain about.]
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        temperature: 1.0,
      },
    });

    // Stream plain text chunks back to the browser
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }

    res.end();
  } catch (err) {
    console.error("Gemini API error:", err);
    // Only send error header if we haven't started streaming yet
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate case study." });
    } else {
      res.end();
    }
  }
}
