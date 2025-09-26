import re
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class RailwayError:
    """Represents a detected Railway deployment error"""
    error_type: str
    message: str
    severity: str
    line_number: int = None

class RailwayLogParser:
    """Parser for Railway deployment logs to detect common errors"""
    
    def __init__(self):
        # Define patterns for common Railway errors
        self.error_patterns = {
            "image_too_large": {
                "pattern": r"(?i)(image.*too large|size.*exceeded|build.*failed.*size|layer.*too large)",
                "severity": "high",
                "type": "Image Size Error"
            },
            "env_var_missing": {
                "pattern": r"(?i)(environment variable.*not found|env.*missing|undefined.*env|required.*env.*not set)",
                "severity": "high", 
                "type": "Environment Variable Error"
            },
            "port_binding": {
                "pattern": r"(?i)(port.*not.*bound|port.*binding.*failed|listen.*port.*failed|address.*already.*in.*use)",
                "severity": "high",
                "type": "Port Binding Error"
            },
            "timeout": {
                "pattern": r"(?i)(timeout|timed.*out|request.*timeout|build.*timeout|deployment.*timeout)",
                "severity": "medium",
                "type": "Timeout Error"
            },
            "build_failed": {
                "pattern": r"(?i)(build.*failed|compilation.*failed|npm.*install.*failed|pip.*install.*failed)",
                "severity": "high",
                "type": "Build Error"
            },
            "memory_limit": {
                "pattern": r"(?i)(memory.*limit|out.*of.*memory|memory.*exceeded|heap.*out.*of.*memory)",
                "severity": "high",
                "type": "Memory Limit Error"
            },
            "disk_space": {
                "pattern": r"(?i)(disk.*space|no.*space.*left|disk.*full|storage.*full)",
                "severity": "high",
                "type": "Disk Space Error"
            },
            "dependency_error": {
                "pattern": r"(?i)(dependency.*not.*found|module.*not.*found|package.*not.*found|import.*error)",
                "severity": "medium",
                "type": "Dependency Error"
            },
            "permission_error": {
                "pattern": r"(?i)(permission.*denied|access.*denied|unauthorized|forbidden)",
                "severity": "high",
                "type": "Permission Error"
            },
            "network_error": {
                "pattern": r"(?i)(network.*error|connection.*failed|dns.*error|unable.*to.*connect)",
                "severity": "medium",
                "type": "Network Error"
            }
        }
    
    def parse_logs(self, log_content: str) -> List[RailwayError]:
        """Parse log content and return detected errors"""
        errors = []
        lines = log_content.split('\n')
        
        # First, try pattern-based detection
        for line_num, line in enumerate(lines, 1):
            for error_key, error_config in self.error_patterns.items():
                if re.search(error_config["pattern"], line):
                    error = RailwayError(
                        error_type=error_config["type"],
                        message=line.strip(),
                        severity=error_config["severity"],
                        line_number=line_num
                    )
                    errors.append(error)
                    break  # Only match one error type per line
        
        # If no patterns matched, check for general error indicators
        if not errors:
            for line_num, line in enumerate(lines, 1):
                line_lower = line.lower().strip()
                if any(keyword in line_lower for keyword in ['error', 'failed', 'exception', 'timeout', 'denied', 'not found', 'unable', 'cannot']):
                    error = RailwayError(
                        error_type="Unknown Error",
                        message=line.strip(),
                        severity="medium",
                        line_number=line_num
                    )
                    errors.append(error)
        
        return errors
    
    def get_error_summary(self, errors: List[RailwayError]) -> Dict[str, Any]:
        """Get summary statistics of detected errors"""
        if not errors:
            return {"total": 0, "by_severity": {}, "by_type": {}}
        
        by_severity = {}
        by_type = {}
        
        for error in errors:
            by_severity[error.severity] = by_severity.get(error.severity, 0) + 1
            by_type[error.error_type] = by_type.get(error.error_type, 0) + 1
        
        return {
            "total": len(errors),
            "by_severity": by_severity,
            "by_type": by_type
        }
