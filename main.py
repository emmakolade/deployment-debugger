from fastapi import FastAPI, Request, Form, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import os
from dotenv import load_dotenv
from log_parser import RailwayLogParser
from ai_integration import DeepSeekAI

# Load environment variables
load_dotenv("config.env")

app = FastAPI(title="Railway Deployment Debugger", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="templates")

# Add custom filter for markdown formatting
def markdown_to_html(text):
    """Convert basic markdown formatting to HTML"""
    if not text:
        return ""
    
    import re
    
    # Convert section headers that end with colon to bold
    # Patterns like "Error Meaning:", "Step-by-Step Solution:", "Prevention Tips:", etc.
    section_headers = [
        "Error Meaning:", "Error Explanation:", "What this means:",
        "Step-by-Step Solution:", "Solution:", "Fix:",
        "Prevention Tips:", "Prevention:", "How to prevent:",
        "Railway-Specific Config:", "Configuration:", "Config:",
        "Common causes:", "Root cause:", "Why this happens:"
    ]
    
    # Make section headers bold
    for header in section_headers:
        text = text.replace(header, f'<strong>{header}</strong>')
    
    # Convert **text** patterns to <strong>text</strong> (but only if they're not already processed)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    
    # Convert newlines to <br>
    text = text.replace('\n', '<br>')
    
    return text

# Register the custom filter
templates.env.filters["markdown"] = markdown_to_html

# Initialize services
log_parser = RailwayLogParser()
ai_service = DeepSeekAI()

@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    """Homepage with log input form"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/analyze")
async def analyze_logs(
    request: Request,
    log_text: str = Form(None),
    log_file: UploadFile = File(None)
):
    """Process logs and return analysis with AI suggestions"""
    
    # Get log content from either text input or file upload
    if log_file and log_file.filename:
        log_content = (await log_file.read()).decode('utf-8')
    elif log_text:
        log_content = log_text
    else:
        return templates.TemplateResponse("index.html", {
            "request": request,
            "error": "Please provide logs either by text input or file upload"
        })
    
    # Parse logs for errors using pattern matching
    detected_errors = log_parser.parse_logs(log_content)
    
    # Also use AI to analyze logs for errors that pattern matching might miss
    ai_errors = await ai_service.analyze_logs_with_ai(log_content)
    
    # Combine both approaches
    analysis_results = []
    
    # Add pattern-matched errors
    for error in detected_errors:
        suggestion = await ai_service.generate_suggestion(error)
        analysis_results.append({
            "error": error,
            "suggestion": suggestion,
            "source": "pattern_matching"
        })
    
    # Add AI-detected errors (avoid duplicates)
    for ai_error in ai_errors:
        # Check if this error is already detected by pattern matching
        is_duplicate = any(
            ai_error.get("message", "").lower() in error.message.lower() or
            error.message.lower() in ai_error.get("message", "").lower()
            for error in detected_errors
        )
        
        if not is_duplicate:
            # Create a RailwayError object for AI-detected errors
            from log_parser import RailwayError
            ai_error_obj = RailwayError(
                error_type=ai_error.get("error_type", "AI Detected Error"),
                message=ai_error.get("message", ""),
                severity=ai_error.get("severity", "medium")
            )
            
            analysis_results.append({
                "error": ai_error_obj,
                "suggestion": ai_error.get("suggestion", "No specific suggestion available."),
                "source": "ai_analysis"
            })
    
    return templates.TemplateResponse("results.html", {
        "request": request,
        "analysis_results": analysis_results,
        "log_content": log_content[:1000] + "..." if len(log_content) > 1000 else log_content
    })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
