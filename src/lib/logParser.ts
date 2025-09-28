import { RailwayError } from "@/types";

export class RailwayLogParser {
  private errorPatterns = {
    image_too_large: {
      pattern:
        /(image.*too large|size.*exceeded|build.*failed.*size|layer.*too large)/i,
      severity: "high" as const,
      type: "Image Size Error",
    },
    env_var_missing: {
      pattern:
        /(environment variable.*not found|env.*missing|undefined.*env|required.*env.*not set)/i,
      severity: "high" as const,
      type: "Environment Variable Error",
    },
    port_binding: {
      pattern:
        /(port.*not.*bound|port.*binding.*failed|listen.*port.*failed|address.*already.*in.*use)/i,
      severity: "high" as const,
      type: "Port Binding Error",
    },
    timeout: {
      pattern:
        /(timeout|timed.*out|request.*timeout|build.*timeout|deployment.*timeout)/i,
      severity: "medium" as const,
      type: "Timeout Error",
    },
    build_failed: {
      pattern:
        /(build.*failed|compilation.*failed|npm.*install.*failed|pip.*install.*failed)/i,
      severity: "high" as const,
      type: "Build Error",
    },
    memory_limit: {
      pattern:
        /(memory.*limit|out.*of.*memory|memory.*exceeded|heap.*out.*of.*memory)/i,
      severity: "high" as const,
      type: "Memory Limit Error",
    },
    disk_space: {
      pattern: /(disk.*space|no.*space.*left|disk.*full|storage.*full)/i,
      severity: "high" as const,
      type: "Disk Space Error",
    },
    dependency_error: {
      pattern:
        /(dependency.*not.*found|module.*not.*found|package.*not.*found|import.*error)/i,
      severity: "medium" as const,
      type: "Dependency Error",
    },
    permission_error: {
      pattern: /(permission.*denied|access.*denied|unauthorized|forbidden)/i,
      severity: "high" as const,
      type: "Permission Error",
    },
    network_error: {
      pattern:
        /(network.*error|connection.*failed|dns.*error|unable.*to.*connect)/i,
      severity: "medium" as const,
      type: "Network Error",
    },
  };

  parseLogs(logContent: string): RailwayError[] {
    const errors: RailwayError[] = [];
    const lines = logContent.split("\n");

    // First, try pattern-based detection
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      for (const [errorKey, errorConfig] of Object.entries(
        this.errorPatterns
      )) {
        if (errorConfig.pattern.test(line)) {
          const error: RailwayError = {
            error_type: errorConfig.type,
            message: line.trim(),
            severity: errorConfig.severity,
            line_number: lineNum + 1,
          };
          errors.push(error);
          break; // Only match one error type per line
        }
      }
    }

    // If no patterns matched, check for general error indicators
    if (errors.length === 0) {
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const lineLower = line.toLowerCase().trim();
        if (
          [
            "error",
            "failed",
            "exception",
            "timeout",
            "denied",
            "not found",
            "unable",
            "cannot",
          ].some((keyword) => lineLower.includes(keyword))
        ) {
          const error: RailwayError = {
            error_type: "Unknown Error",
            message: line.trim(),
            severity: "medium",
            line_number: lineNum + 1,
          };
          errors.push(error);
        }
      }
    }

    return errors;
  }

  getErrorSummary(errors: RailwayError[]) {
    if (errors.length === 0) {
      return { total: 0, by_severity: {}, by_type: {} };
    }

    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const error of errors) {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      byType[error.error_type] = (byType[error.error_type] || 0) + 1;
    }

    return {
      total: errors.length,
      by_severity: bySeverity,
      by_type: byType,
    };
  }
}
