/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Markdown from "react-markdown";
import { BookOpen, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [caseStudy, setCaseStudy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingForStream, setIsWaitingForStream] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaseStudy = async () => {
    setIsGenerating(true);
    setIsWaitingForStream(true);
    setError(null);
    setCaseStudy(null);

    try {
      // API is hosted on Vercel — replace this URL with your actual Vercel project URL
      // e.g. "https://pm-api.vercel.app/api/generate"
      const API_URL = import.meta.env.VITE_API_URL ?? "/api/generate";
      const response = await fetch(API_URL, { method: "POST" });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

      setIsWaitingForStream(false);
      setCaseStudy(""); // Initialize to show content area immediately

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setCaseStudy((prev) => (prev || "") + chunk);
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
