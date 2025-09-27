import httpx
import os
import json
from typing import Dict, Any

class DeepSeekAI:
    """Integration with DeepSeek AI for generating fix suggestions"""
    
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.base_url = "https://api.deepseek.com"
        self.model = "deepseek-chat"
        
        if not self.api_key:
            print("Warning: DEEPSEEK_API_KEY not found. AI suggestions will be disabled.")
    
    async def generate_suggestion(self, error) -> str:
        """Generate actionable fix suggestion for a Railway error"""
        
        if not self.api_key:
            return self._get_fallback_suggestion(error)
        
        prompt = self._build_prompt(error)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a Railway deployment expert. Provide concise, actionable fix suggestions for deployment errors. Focus on practical solutions that users can implement immediately."
                            },
                            {
                                "role": "user", 
                                "content": prompt
                            }
                        ],
                        "stream": False,
                        "max_tokens": 500,
                        "temperature": 0.7
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"].strip()
                else:
                    print(f"DeepSeek API error: {response.status_code}")
                    return self._get_fallback_suggestion(error)
                    
        except Exception as e:
            print(f"Error calling DeepSeek API: {e}")
            return self._get_fallback_suggestion(error)
    
    async def analyze_logs_with_ai(self, log_content: str):
        """Use AI to analyze logs and detect errors that pattern matching might miss"""
        
        if not self.api_key:
            return []
        
        prompt = f"""
Analyze these Railway deployment logs and identify any errors, issues, or problems:

Logs:
{log_content}

Please identify:
1. Any errors or issues (even subtle ones)
2. The type/category of each error
3. The severity level (high/medium/low)
4. A brief explanation of what's wrong
5. Specific actionable steps to fix each issue

Format your response as JSON with this structure:
[
  {{
    "error_type": "Error Category",
    "message": "Specific error message",
    "severity": "high/medium/low",
    "explanation": "What this error means",
    "suggestion": "Step-by-step fix instructions"
  }}
]

If no errors are found, return an empty array [].
"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a Railway deployment expert. Analyze logs and identify errors. Always respond with valid JSON format as requested."
                            },
                            {
                                "role": "user", 
                                "content": prompt
                            }
                        ],
                        "stream": False,
                        "max_tokens": 1000,
                        "temperature": 0.3
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"].strip()
                    
                    # Try to parse JSON response
                    try:
                        import json
                        ai_errors = json.loads(content)
                        return ai_errors if isinstance(ai_errors, list) else []
                    except json.JSONDecodeError:
                        # If JSON parsing fails, return empty list
                        return []
                else:
                    print(f"DeepSeek API error: {response.status_code}")
                    return []
                    
        except Exception as e:
            print(f"Error calling DeepSeek API: {e}")
            return []
    
    def _build_prompt(self, error) -> str:
        """Build prompt for DeepSeek AI based on error type"""
        base_prompt = f"""
Railway Deployment Error Detected:
- Type: {error.error_type}
- Message: {error.message}
- Severity: {error.severity}

Please provide a specific, actionable fix suggestion for this Railway deployment error. Include:
1. What the error means
2. Step-by-step solution
3. Prevention tips
4. Any relevant Railway-specific configuration changes

Keep the response concise and practical.
"""
        return base_prompt
    
    def _get_fallback_suggestion(self, error) -> str:
        """Fallback suggestions when AI is not available"""
        fallback_suggestions = {
            "Image Size Error": """
🔧 **Fix for Image Size Error:**
1. Add a `.dockerignore` file to exclude large directories:
   ```
   node_modules
   .git
   .next
   dist
   build
   *.log
   ```
2. Use multi-stage Docker builds to reduce final image size
3. Consider using Railway's built-in buildpacks instead of Docker
4. Check your Dockerfile for unnecessary layers

**Prevention:** Regularly monitor image size and optimize dependencies.
""",
            "Environment Variable Error": """
🔧 **Fix for Missing Environment Variable:**
1. Check your Railway project settings → Variables tab
2. Add the missing environment variable with the correct value
3. Ensure variable names match exactly (case-sensitive)
4. Redeploy your application after adding variables

**Common variables:** DATABASE_URL, API_KEY, NODE_ENV, PORT
**Prevention:** Document all required environment variables in your README.
""",
            "Port Binding Error": """
🔧 **Fix for Port Binding Error:**
1. Ensure your app binds to `0.0.0.0` and the PORT environment variable:
   ```javascript
   app.listen(process.env.PORT || 3000, '0.0.0.0')
   ```
2. Check if another process is using the port
3. Verify your start script in package.json
4. For Docker, expose the correct port in Dockerfile

**Prevention:** Always use `process.env.PORT` and bind to `0.0.0.0`.
""",
            "Timeout Error": """
🔧 **Fix for Timeout Error:**
1. Increase build timeout in Railway settings
2. Optimize your build process (reduce dependencies, use caching)
3. Check for infinite loops or long-running processes
4. Consider using Railway's build cache

**Prevention:** Monitor build times and optimize slow operations.
""",
            "Build Error": """
🔧 **Fix for Build Error:**
1. Check your package.json or requirements.txt for correct versions
2. Ensure all dependencies are compatible
3. Clear build cache and try again
4. Check for syntax errors in your code
5. Verify Node.js/Python version compatibility

**Prevention:** Test builds locally before deploying.
""",
            "Memory Limit Error": """
🔧 **Fix for Memory Limit Error:**
1. Upgrade to a higher Railway plan with more memory
2. Optimize your application to use less memory
3. Check for memory leaks in your code
4. Reduce the number of concurrent processes

**Prevention:** Profile your app's memory usage and optimize accordingly.
""",
            "Disk Space Error": """
🔧 **Fix for Disk Space Error:**
1. Clean up unnecessary files and dependencies
2. Use `.dockerignore` to exclude large directories
3. Optimize your Docker image layers
4. Consider upgrading your Railway plan

**Prevention:** Regularly clean up build artifacts and unused files.
""",
            "Dependency Error": """
🔧 **Fix for Dependency Error:**
1. Check if the package is listed in package.json/requirements.txt
2. Run `npm install` or `pip install -r requirements.txt` locally
3. Verify package names and versions are correct
4. Clear node_modules and reinstall

**Prevention:** Keep dependencies up to date and test locally first.
""",
            "Permission Error": """
🔧 **Fix for Permission Error:**
1. Check file permissions in your repository
2. Ensure your Dockerfile doesn't run as root unnecessarily
3. Verify Railway has access to your repository
4. Check if any files are marked as executable

**Prevention:** Use proper file permissions and avoid running as root.
""",
            "Network Error": """
🔧 **Fix for Network Error:**
1. Check your internet connection
2. Verify external service URLs are correct
3. Check if the service you're trying to reach is available
4. Review firewall or proxy settings

**Prevention:** Add proper error handling for network requests.
"""
        }
        
        return fallback_suggestions.get(error.error_type, """
🔧 **General Fix Suggestion:**
1. Check the Railway deployment logs for more details
2. Verify your application configuration
3. Test the deployment locally first
4. Check Railway's status page for service issues
5. Review Railway documentation for your specific use case

**Need help?** Check Railway's support documentation or community forums.
""")
