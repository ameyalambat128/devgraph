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

const siteUrl = 'https://devgraph.ameyalambat.com';
const socialImage = `${siteUrl}/devgraph-social-card.png`;
const description =
  'DevGraph turns Markdown architecture notes into a graph your team, docs, and AI agents can actually use. Build graph.json, summary.md, Mermaid diagrams, and agent-ready context from one command.';

export const metadata: Metadata = {
  title: 'DevGraph | One graph. Every repo.',
  description,
  keywords: [
    'devgraph',
    'architecture graph',
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
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'DevGraph',
    title: 'DevGraph | One graph. Every repo.',
    description,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'DevGraph social card with product branding and graph output preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevGraph | One graph. Every repo.',
    description,
    creator: '@lambatameya',
    images: [socialImage],
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
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
