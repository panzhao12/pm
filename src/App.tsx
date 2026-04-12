/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { BookOpen, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Initialize the Gemini API client
// Note: We use process.env.GEMINI_API_KEY as per the guidelines
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [caseStudy, setCaseStudy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingForStream, setIsWaitingForStream] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const generateCaseStudy = async () => {
    setIsGenerating(true);
    setIsWaitingForStream(true);
    setError(null);
    setCaseStudy(null);

    try {
      const randomIndustry =
        INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];

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

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
          temperature: 1.0,
        },
      });

      setIsWaitingForStream(false);
      setCaseStudy(""); // Initialize to empty string to show the content area

      for await (const chunk of responseStream) {
        if (chunk.text) {
          setCaseStudy((prev) => (prev || "") + chunk.text);
        }
      }
    } catch (err) {
      console.error("Error generating case study:", err);
      setError(
        "An error occurred while generating the case study. Please try again.",
      );
      setIsWaitingForStream(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-black/10 py-6 px-8 flex justify-between items-center sticky top-0 bg-[#fdfbf7]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="serif text-xl font-bold leading-none tracking-tight">
              The PM Daily
            </h1>
            <p className="text-xs uppercase tracking-widest text-black/50 mt-1 font-semibold">
              Curated Case Studies
            </p>
          </div>
        </div>

        <button
          onClick={generateCaseStudy}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/20 hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Researching...</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              <span>New Case Study</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {caseStudy === null && !isWaitingForStream && !error && (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full text-center mt-20"
            >
              <div className="w-24 h-24 mx-auto mb-8 rounded-full border border-black/10 flex items-center justify-center bg-white shadow-sm">
                <Sparkles size={32} className="text-[#d94f04]" />
              </div>
              <h2 className="serif text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Master the Craft of Product
              </h2>
              <p className="text-lg text-black/60 mb-10 max-w-lg mx-auto leading-relaxed">
                Explore profound, real-world case studies from top tech
                companies. Learn from their triumphs, pivots, and failures.
              </p>
              <button
                onClick={generateCaseStudy}
                className="bg-[#d94f04] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#b84303] transition-colors shadow-lg shadow-[#d94f04]/20"
              >
                Generate First Case Study
              </button>
            </motion.div>
          )}

          {isWaitingForStream && (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl w-full flex flex-col items-center justify-center mt-32"
            >
              <Loader2 size={48} className="animate-spin text-[#d94f04] mb-6" />
              <p className="serif text-2xl animate-pulse">
                Unearthing product insights...
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl w-full bg-red-50 text-red-800 p-6 rounded-2xl border border-red-100 text-center mt-20"
            >
              <p>{error}</p>
              <button
                onClick={generateCaseStudy}
                className="mt-4 underline font-medium"
              >
                Try again
              </button>
            </motion.div>
          )}

          {caseStudy !== null && (
            <motion.div
              key="content-state"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl w-full bg-white p-8 md:p-16 rounded-[2rem] shadow-sm border border-black/5"
            >
              <div className="markdown-body">
                <Markdown>{caseStudy}</Markdown>
              </div>

              {!isGenerating && (
                <div className="mt-16 pt-8 border-t border-black/10 flex justify-center">
                  <button
                    onClick={generateCaseStudy}
                    className="flex items-center gap-2 text-[#d94f04] font-medium hover:text-[#b84303] transition-colors"
                  >
                    <RefreshCw size={18} />
                    <span>Read another case study</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-black/40 font-medium uppercase tracking-widest border-t border-black/5">
        Powered by Gemini 3 Flash
      </footer>
    </div>
  );
}
