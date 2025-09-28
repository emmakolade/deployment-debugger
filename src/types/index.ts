export interface RailwayError {
  error_type: string;
  message: string;
  severity: "high" | "medium" | "low";
  line_number?: number;
}

export interface AnalysisResult {
  error: RailwayError;
  suggestion: string;
  source: "pattern_matching" | "ai_analysis";
}

export interface LogAnalysisResponse {
  analysis_results: AnalysisResult[];
  log_content: string;
}

export interface AIError {
  error_type: string;
  message: string;
  severity: "high" | "medium" | "low";
  explanation: string;
  suggestion: string;
}
