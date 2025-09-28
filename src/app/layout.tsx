import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Railway Deployment Debugger",
  description: "AI-powered Railway deployment log analysis tool",
  icons: {
    icon: "/railway.png",
    shortcut: "/favicon.ico",
    apple: "/railway.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
          <div className="container max-w-6xl mx-auto px-5 py-5 min-h-screen flex flex-col">
            {/* Header */}
            <header className="text-center mb-10 text-white">
              <div className="logo text-4xl font-bold mb-3 flex items-center justify-center gap-4">
                <img
                  src="/railway.png"
                  alt="Railway Logo"
                  className="h-12 w-auto object-contain"
                />
                Railway Deployment Debugger
              </div>
              <p className="text-lg opacity-90 font-light">
                AI-powered log analysis for Railway deployments
              </p>
            </header>

            {/* Main Content */}
            <main className="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden">
              {children}
            </main>

            {/* Footer */}
            <footer className="text-center py-5 text-white opacity-80 text-sm">
              <p>
                &copy; 2024 Railway Deployment Debugger. Built with Next.js and
                AI.
              </p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
