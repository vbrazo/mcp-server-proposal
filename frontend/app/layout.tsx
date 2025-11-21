import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Compliance Copilot - Automated Code Compliance',
  description: 'AI-powered compliance assistant for GitHub PRs using E2B, MCP, and Groq',
  keywords: ['compliance', 'security', 'code-review', 'ai', 'github'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'antialiased')}>{children}</body>
    </html>
  );
}

