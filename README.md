# Railway Deployment Debugger

A FastAPI-based web application that helps Railway users debug deployment issues by analyzing logs and providing AI-powered fix suggestions.

## Features

- **Log Analysis**: Detects common Railway deployment errors including:
  - Image size issues
  - Missing environment variables
  - Port binding problems
  - Timeout errors
  - Build failures
  - Memory and disk space issues
  - Dependency errors
  - Permission and network issues

- **AI-Powered Solutions**: Uses DeepSeek AI to generate actionable fix suggestions
- **Clean UI**: Modern, responsive interface built with HTML/CSS and Jinja2 templates
- **File Upload Support**: Accept logs via text input or file upload

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env and add your DeepSeek API key
   ```

3. **Run the Application**
   ```bash
   python main.py
   ```

   The app will be available at `http://localhost:8000`

## Usage

1. **Submit Logs**: Paste your Railway deployment logs in the text area or upload a log file
2. **Get Analysis**: The app will parse your logs and detect common errors
3. **Review Solutions**: Get AI-powered suggestions for fixing each detected issue

## API Endpoints

- `GET /` - Homepage with log input form
- `POST /analyze` - Process logs and return analysis results

## Configuration

### DeepSeek AI Integration

To enable AI-powered suggestions, you need a DeepSeek API key:

1. Sign up at [DeepSeek](https://platform.deepseek.com/)
2. Get your API key
3. Add it to your `.env` file:
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```

Without an API key, the app will still work but will show fallback suggestions instead of AI-generated ones.

## Project Structure

```
railway3/
├── main.py              # FastAPI application
├── log_parser.py        # Log parsing logic
├── ai_integration.py    # DeepSeek AI integration
├── requirements.txt     # Python dependencies
├── env.example         # Environment variables template
├── templates/          # Jinja2 HTML templates
│   ├── base.html
│   ├── index.html
│   └── results.html
└── static/            # CSS and static files
    └── style.css
```

## Error Detection

The parser detects these common Railway errors:

- **Image Size Error**: Docker images exceeding size limits
- **Environment Variable Error**: Missing or undefined environment variables
- **Port Binding Error**: Port binding failures
- **Timeout Error**: Build or deployment timeouts
- **Build Error**: Compilation and build failures
- **Memory Limit Error**: Memory usage exceeding limits
- **Disk Space Error**: Insufficient disk space
- **Dependency Error**: Missing packages or modules
- **Permission Error**: File permission issues
- **Network Error**: Connection and network problems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
