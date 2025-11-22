import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '48px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>DevGraph</h1>
      <p>A Turborepo + Next.js workspace for the DevGraph CLI and docs.</p>
      <ul>
        <li><Link href="/docs">Docs</Link></li>
      </ul>
    </main>
  );
}
