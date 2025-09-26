#!/usr/bin/env python3
"""
Test the enhanced AI-powered error detection
"""

import asyncio
from ai_integration import DeepSeekAI

# Your specific error case
sample_logs = """
Details:
    {
      "$schema": "https://railway.app/railway.schema.json",
      "build": {
        "builder": "NIXPACKS"
      },
      "deploy": {
        "runtime": "UNSPECIFIED",
        "numReplicas": 1,
        "sleepApplication": false,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
      }
    }

Build logs:
    activity error

Deploy Logs:
    No deployment logs. All output sent to stdout will be displayed here
"""

async def test_enhanced_ai():
    """Test the enhanced AI analysis"""
    print("🤖 Testing Enhanced AI Error Detection")
    print("=" * 50)
    
    ai_service = DeepSeekAI()
    
    # Test AI analysis
    ai_errors = await ai_service.analyze_logs_with_ai(sample_logs)
    
    print(f"📊 AI detected {len(ai_errors)} errors:")
    print()
    
    for i, error in enumerate(ai_errors, 1):
        print(f"{i}. {error.get('error_type', 'Unknown')}")
        print(f"   Severity: {error.get('severity', 'unknown')}")
        print(f"   Message: {error.get('message', 'No message')}")
        print(f"   Explanation: {error.get('explanation', 'No explanation')}")
        print(f"   Suggestion: {error.get('suggestion', 'No suggestion')}")
        print()

if __name__ == "__main__":
    asyncio.run(test_enhanced_ai())
