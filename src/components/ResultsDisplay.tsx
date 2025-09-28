"use client";

import { useState, useEffect } from "react";
import { AnalysisResult } from "@/types";

interface ResultsDisplayProps {
  results: AnalysisResult[];
  logContent: string;
}

export default function ResultsDisplay({
  results,
  logContent,
}: ResultsDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-black";
    }
  };

  const formatSuggestion = (suggestion: string) => {
    // Convert markdown-like formatting to HTML
    let formatted = suggestion
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>")
      .replace(
        /```([^`]*?)```/g,
        '<pre class="bg-gray-100 p-2 rounded text-sm overflow-x-auto"><code>$1</code></pre>'
      );

    return { __html: formatted };
  };

  return (
    <div className="results-container p-10">
      <div className="results-header flex justify-between items-center mb-8 pb-5 border-b-2 border-gray-200">
        <h2 className="text-3xl font-semibold text-black">Analysis Results</h2>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 text-black no-underline rounded-lg font-medium transition-colors hover:bg-gray-100"
        >
          <span className="text-lg">←</span>
          Analyze New Logs
        </a>
      </div>

      {results.length > 0 ? (
        <>
          <div className="summary mb-10">
            <div className="summary-card inline-flex flex-col items-center p-8 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-2xl shadow-lg shadow-primary-200">
              <span className="text-5xl font-bold leading-none">
                {results.length}
              </span>
              <span className="text-lg opacity-90 mt-2">Issues Found</span>
            </div>
          </div>

          <div className="errors-section mb-10">
            <h3 className="text-2xl font-semibold text-black mb-6">
              Detected Issues & Solutions
            </h3>
            {results.map((result, index) => (
              <div
                key={index}
                className="error-card bg-gray-50 rounded-2xl p-6 mb-5 border-l-4 border-gray-300 hover:shadow-lg transition-shadow"
              >
                <div className="error-header flex justify-between items-center mb-4">
                  <div className="error-type flex items-center gap-3">
                    <span className="text-xl">
                      {getSeverityIcon(result.error.severity)}
                    </span>
                    <span className="font-semibold text-lg text-black flex items-center gap-3">
                      {result.error.error_type}
                      {result.source === "ai_analysis" && (
                        <span className="bg-gradient-to-r from-primary-500 to-primary-700 text-black px-2 py-1 rounded-xl text-xs font-medium uppercase tracking-wide">
                          🤖 AI Detected
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className={`error-severity px-3 py-1 rounded-full text-sm font-semibold uppercase ${getSeverityClass(
                      result.error.severity
                    )}`}
                  >
                    {result.error.severity}
                  </div>
                </div>

                <div className="error-message bg-white p-4 rounded-lg mb-5 font-mono text-sm leading-relaxed border border-gray-200 text-red-700">
                  <strong>Error:</strong> {result.error.message}
                  {result.error.line_number && (
                    <span className="text-black text-sm ml-2">
                      (Line {result.error.line_number})
                    </span>
                  )}
                </div>

                <div className="suggestion bg-white rounded-xl p-5 border border-gray-200">
                  <div className="suggestion-header flex items-center gap-3 mb-4">
                    <span className="text-xl">💡</span>
                    <span className="font-semibold text-lg text-black">
                      AI-Powered Solution
                    </span>
                  </div>
                  <div
                    className="suggestion-content text-black leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={formatSuggestion(
                      result.suggestion
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-errors text-center py-16 px-10 bg-green-50 rounded-2xl border-2 border-green-200">
          <div className="text-6xl mb-5">✅</div>
          <h3 className="text-3xl font-semibold text-black mb-4">
            No Issues Detected!
          </h3>
          <p className="text-lg text-black mb-5">
            Great news! We didn't find any common Railway deployment errors in
            your logs.
          </p>
          <p className="text-lg text-black mb-5">
            If you're still experiencing issues, try:
          </p>
          <ul className="text-left inline-block text-black">
            <li className="mb-2">Checking Railway's status page</li>
            <li className="mb-2">
              Reviewing your application logs more thoroughly
            </li>
            <li>Contacting Railway support</li>
          </ul>
        </div>
      )}

      <div className="log-preview mt-10 pt-10 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-black mb-5">Log Preview</h3>
        <div className="log-content bg-gray-900 text-black-100 p-5 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed">
          <pre className="m-0 whitespace-pre-wrap break-words">
            {logContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
