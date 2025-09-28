"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LogAnalyzerProps {
  onAnalyze?: (formData: FormData) => void;
}

export default function LogAnalyzer({ onAnalyze }: LogAnalyzerProps) {
  const [logText, setLogText] = useState("");
  const [logFile, setLogFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("No file selected");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogFile(file);
      setFileName(file.name);
    } else {
      setLogFile(null);
      setFileName("No file selected");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logText.trim() && !logFile) {
      setError("Please provide logs either by text input or file upload");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      if (logText.trim()) {
        formData.append("log_text", logText);
      }
      if (logFile) {
        formData.append("log_file", logFile);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze logs");
      }

      const data = await response.json();

      // Store results in sessionStorage for the results page
      sessionStorage.setItem("analysisResults", JSON.stringify(data));

      // Navigate to results page
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="text-3xl font-semibold text-gray-800 mb-3">
          Analyze Your Railway Logs
        </h2>
        <p className="text-lg text-gray-600">
          Paste your Railway deployment logs below or upload a log file to get
          AI-powered debugging insights.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg mb-8 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="log-form">
        <div className="input-group mb-8">
          <label
            htmlFor="log_text"
            className="block text-sm font-medium text-gray-800 mb-3"
          >
            Paste Logs Here
          </label>
          <textarea
            id="log_text"
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            className="w-full p-5 border-2 border-gray-200 rounded-xl font-mono text-sm leading-relaxed resize-y min-h-[200px] text-black focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-colors"
            placeholder="Paste your Railway deployment logs here..."
            rows={12}
            disabled={isAnalyzing}
          />
        </div>

        <div className="divider text-center my-8 relative text-gray-500 font-medium">
          <span className="bg-white px-5 relative z-10">OR</span>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 z-0"></div>
        </div>

        <div className="input-group mb-8">
          <label
            htmlFor="log_file"
            className="block text-sm font-medium text-gray-800 mb-3"
          >
            Upload Log File
          </label>
          <div className="file-upload flex items-center gap-4">
            <input
              type="file"
              id="log_file"
              onChange={handleFileChange}
              accept=".log,.txt"
              className="hidden"
              disabled={isAnalyzing}
            />
            <label
              htmlFor="log_file"
              className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all hover:bg-gray-100 hover:border-gray-400 font-medium text-gray-700"
            >
              <span className="text-xl">📁</span>
              Choose File
            </label>
            <span className="text-gray-500 italic">{fileName}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white border-none py-5 px-8 rounded-xl text-lg font-semibold cursor-pointer transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-300/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          <span className="text-xl">{isAnalyzing ? "⏳" : "🔍"}</span>
          <span>{isAnalyzing ? "Analyzing..." : "Analyze Logs"}</span>
        </button>
      </form>

      {isAnalyzing && (
        <div className="progress-container bg-white rounded-2xl p-10 mt-5 shadow-xl text-center">
          <div className="progress-header">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Analyzing Your Logs
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Processing your logs with AI-powered analysis...
            </p>
          </div>
          <div className="progress-bar w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-10">
            <div className="progress-fill h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full w-0 animate-pulse"></div>
          </div>
          <div className="progress-steps grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="step flex flex-col items-center p-5 rounded-xl bg-gray-50 border-2 border-primary-500 text-white bg-gradient-to-r from-primary-500 to-primary-700">
              <span className="text-2xl mb-3">📝</span>
              <span className="font-medium text-sm text-center">
                Parsing logs
              </span>
            </div>
            <div className="step flex flex-col items-center p-5 rounded-xl bg-gray-50 border-2 border-gray-200 opacity-50">
              <span className="text-2xl mb-3">🔍</span>
              <span className="font-medium text-sm text-center">
                Pattern matching
              </span>
            </div>
            <div className="step flex flex-col items-center p-5 rounded-xl bg-gray-50 border-2 border-gray-200 opacity-50">
              <span className="text-2xl mb-3">🤖</span>
              <span className="font-medium text-sm text-center">
                AI analysis
              </span>
            </div>
            <div className="step flex flex-col items-center p-5 rounded-xl bg-gray-50 border-2 border-gray-200 opacity-50">
              <span className="text-2xl mb-3">💡</span>
              <span className="font-medium text-sm text-center">
                Generating solutions
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="features mt-10 pt-10 border-t border-gray-200">
        <h3 className="text-center text-2xl font-semibold text-gray-800 mb-8">
          What We Detect
        </h3>
        <div className="feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="feature-item flex items-center gap-3 p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
            <span className="text-2xl">📦</span>
            <span>Image Size Issues</span>
          </div>
          <div className="feature-item flex items-center gap-3 p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
            <span className="text-2xl">🔧</span>
            <span>Environment Variables</span>
          </div>
          <div className="feature-item flex items-center gap-3 p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
            <span className="text-2xl">🔌</span>
            <span>Port Binding Problems</span>
          </div>
          <div className="feature-item flex items-center gap-3 p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
            <span className="text-2xl">⏱️</span>
            <span>Timeout Errors</span>
          </div>
          <div className="feature-item flex items-center gap-3 p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
            <span className="text-2xl">🏗️</span>
            <span>Build Failures</span>
          </div>
          <div className="feature-item flex items-center gap-3 p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
            <span className="text-2xl">💾</span>
            <span>Memory Issues</span>
          </div>
        </div>
      </div>
    </div>
  );
}
