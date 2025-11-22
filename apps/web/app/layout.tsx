import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'DevGraph',
  description: 'DevGraph monorepo with Next.js docs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
