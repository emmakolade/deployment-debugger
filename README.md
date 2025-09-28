# Railway Deployment Debugger (Next.js)

A modern Next.js-based web application that helps Railway users debug deployment issues by analyzing logs and providing AI-powered fix suggestions.

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
- **Modern UI**: Beautiful, responsive interface built with Next.js, React, and Tailwind CSS
- **File Upload Support**: Accept logs via text input or file upload
- **Real-time Progress**: Animated progress indicators during analysis
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: DeepSeek API
- **File Handling**: FormData API with multipart support

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment**

   ```bash
   cp env.example .env.local
   # Edit .env.local and add your DeepSeek API key
   ```

3. **Run the Application**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Usage

1. **Submit Logs**: Paste your Railway deployment logs in the text area or upload a log file
2. **Get Analysis**: The app will parse your logs and detect common errors
3. **Review Solutions**: Get AI-powered suggestions for fixing each detected issue

## API Endpoints

- `GET /` - Homepage with log input form
- `POST /api/analyze` - Process logs and return analysis results

## Configuration

### DeepSeek AI Integration

To enable AI-powered suggestions, you need a DeepSeek API key:

1. Sign up at [DeepSeek](https://platform.deepseek.com/)
2. Get your API key
3. Add it to your `.env.local` file:
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```

Without an API key, the app will still work but will show fallback suggestions instead of AI-generated ones.

## Project Structure

```
railway-debugger-nextjs/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   └── analyze/    # Log analysis endpoint
│   │   ├── results/        # Results page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── LogAnalyzer.tsx # Main form component
│   │   └── ResultsDisplay.tsx # Results display
│   ├── lib/               # Utility libraries
│   │   ├── logParser.ts   # Log parsing logic
│   │   └── aiIntegration.ts # AI integration
│   └── types/             # TypeScript types
│       └── index.ts       # Type definitions
├── public/                # Static assets
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
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

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Railway**
- **Netlify**
- **Docker**

For Railway deployment, create a `railway.json` file:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
