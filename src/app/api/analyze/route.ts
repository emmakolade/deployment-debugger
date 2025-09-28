import { NextRequest, NextResponse } from "next/server";
import { RailwayLogParser } from "@/lib/logParser";
import { DeepSeekAI } from "@/lib/aiIntegration";
import { AnalysisResult, RailwayError } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const logText = formData.get("log_text") as string;
    const logFile = formData.get("log_file") as File;

    let logContent = "";

    if (logFile && logFile.size > 0) {
      logContent = await logFile.text();
    } else if (logText) {
      logContent = logText;
    } else {
      return NextResponse.json(
        { error: "Please provide logs either by text input or file upload" },
        { status: 400 }
      );
    }

    // Initialize services
    const logParser = new RailwayLogParser();
    const aiService = new DeepSeekAI();

    // Parse logs for errors using pattern matching
    const detectedErrors = logParser.parseLogs(logContent);

    // Also use AI to analyze logs for errors that pattern matching might miss
    const aiErrors = await aiService.analyzeLogsWithAI(logContent);

    // Combine both approaches
    const analysisResults: AnalysisResult[] = [];

    // Add pattern-matched errors
    for (const error of detectedErrors) {
      const suggestion = await aiService.generateSuggestion(error);
      analysisResults.push({
        error,
        suggestion,
        source: "pattern_matching",
      });
    }

    // Add AI-detected errors (avoid duplicates)
    for (const aiError of aiErrors) {
      // Check if this error is already detected by pattern matching
      const isDuplicate = detectedErrors.some(
        (error) =>
          aiError.message.toLowerCase().includes(error.message.toLowerCase()) ||
          error.message.toLowerCase().includes(aiError.message.toLowerCase())
      );

      if (!isDuplicate) {
        // Create a RailwayError object for AI-detected errors
        const aiErrorObj: RailwayError = {
          error_type: aiError.error_type,
          message: aiError.message,
          severity: aiError.severity,
        };

        analysisResults.push({
          error: aiErrorObj,
          suggestion: aiError.suggestion,
          source: "ai_analysis",
        });
      }
    }

    return NextResponse.json({
      analysis_results: analysisResults,
      log_content:
        logContent.length > 1000
          ? logContent.substring(0, 1000) + "..."
          : logContent,
    });
  } catch (error) {
    console.error("Error analyzing logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
