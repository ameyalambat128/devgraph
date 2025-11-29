import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'DevGraph — One graph. Every repo.',
  description:
    'A universal context layer for codebases. Human-readable documentation that AI agents can navigate. One command to map your entire architecture.',
  keywords: [
    'devgraph',
    'codebase',
    'documentation',
    'ai',
    'llm',
    'context',
    'architecture',
    'monorepo',
    'developer tools',
  ],
  authors: [{ name: 'Ameya Lambat', url: 'https://x.com/lambatameya' }],
  creator: 'Ameya Lambat',
  metadataBase: new URL('https://devgraph.ameyalambat.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devgraph.ameyalambat.com',
    siteName: 'DevGraph',
    title: 'DevGraph — One graph. Every repo.',
    description:
      'A universal context layer for codebases. Human-readable documentation that AI agents can navigate.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevGraph — One graph. Every repo.',
    description:
      'A universal context layer for codebases. Human-readable documentation that AI agents can navigate.',
    creator: '@lambatameya',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
