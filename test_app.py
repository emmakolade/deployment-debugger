#!/usr/bin/env python3
"""
Test script for Railway Deployment Debugger
"""

from log_parser import RailwayLogParser

# Sample Railway logs with various errors
sample_logs = """
[2024-01-15 10:30:15] Building Docker image...
[2024-01-15 10:30:20] Step 1/10 : FROM node:18-alpine
[2024-01-15 10:30:25] Step 2/10 : WORKDIR /app
[2024-01-15 10:30:30] Step 3/10 : COPY package*.json ./
[2024-01-15 10:30:35] Step 4/10 : RUN npm install
[2024-01-15 10:30:40] ERROR: image size exceeded (7.5GB)
[2024-01-15 10:30:45] Build failed: image too large
[2024-01-15 10:31:00] Starting deployment...
[2024-01-15 10:31:05] ERROR: environment variable DATABASE_URL not found
[2024-01-15 10:31:10] ERROR: port not bound to 0.0.0.0
[2024-01-15 10:31:15] ERROR: request timeout after 30 seconds
[2024-01-15 10:31:20] ERROR: build failed due to compilation errors
[2024-01-15 10:31:25] ERROR: out of memory during build process
[2024-01-15 10:31:30] ERROR: no space left on device
[2024-01-15 10:31:35] ERROR: module 'express' not found
[2024-01-15 10:31:40] ERROR: permission denied when accessing /app
[2024-01-15 10:31:45] ERROR: network error - unable to connect to database
[2024-01-15 10:31:50] Deployment failed
"""

def test_log_parser():
    """Test the log parser with sample data"""
    print("🧪 Testing Railway Log Parser")
    print("=" * 50)
    
    parser = RailwayLogParser()
    errors = parser.parse_logs(sample_logs)
    
    print(f"📊 Found {len(errors)} errors:")
    print()
    
    for i, error in enumerate(errors, 1):
        print(f"{i}. {error.error_type}")
        print(f"   Severity: {error.severity}")
        print(f"   Message: {error.message}")
        print(f"   Line: {error.line_number}")
        print()
    
    # Test summary
    summary = parser.get_error_summary(errors)
    print("📈 Error Summary:")
    print(f"   Total: {summary['total']}")
    print(f"   By Severity: {summary['by_severity']}")
    print(f"   By Type: {summary['by_type']}")
    print()
    
    return errors

def test_ai_integration():
    """Test AI integration (without API key)"""
    print("🤖 Testing AI Integration (Fallback Mode)")
    print("=" * 50)
    
    from ai_integration import DeepSeekAI
    
    ai_service = DeepSeekAI()
    
    # Create a sample error
    from log_parser import RailwayError
    sample_error = RailwayError(
        error_type="Image Size Error",
        message="ERROR: image size exceeded (7.5GB)",
        severity="high",
        line_number=6
    )
    
    # This will use fallback suggestions since no API key is set
    suggestion = ai_service._get_fallback_suggestion(sample_error)
    print("Sample suggestion for Image Size Error:")
    print(suggestion)
    print()

if __name__ == "__main__":
    print("🚂 Railway Deployment Debugger - Test Suite")
    print("=" * 60)
    print()
    
    # Test log parser
    errors = test_log_parser()
    
    # Test AI integration
    test_ai_integration()
    
    print("✅ All tests completed!")
    print()
    print("To run the full application:")
    print("1. Set DEEPSEEK_API_KEY in .env file (optional)")
    print("2. Run: python main.py")
    print("3. Open: http://localhost:8000")
