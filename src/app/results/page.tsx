"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ResultsDisplay from "@/components/ResultsDisplay";
import { AnalysisResult } from "@/types";

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [logContent, setLogContent] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedResults = sessionStorage.getItem("analysisResults");
    if (storedResults) {
      try {
        const data = JSON.parse(storedResults);
        setResults(data.analysis_results || []);
        setLogContent(data.log_content || "");
      } catch (error) {
        console.error("Error parsing stored results:", error);
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-black">Loading results...</p>
        </div>
      </div>
    );
  }

  return <ResultsDisplay results={results} logContent={logContent} />;
}
