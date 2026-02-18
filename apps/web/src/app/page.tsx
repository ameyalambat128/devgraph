import { Navbar } from '@/components/navbar';
import { FeatureSection } from '@/components/feature-section';
import { FeatureGrid } from '@/components/feature-grid';
import { Footer } from '@/components/footer';
import { CodeWindow } from '@/components/code-window';
import { Sparkles, Terminal, Database, Activity, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { IconGithub } from '@/components/icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent/30">
      <Navbar />

      <main className="pt-40 pb-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 mb-32">
          {/* Hero Content - Left Aligned */}
          <div className="max-w-3xl mb-16">
            <h1 className="mb-6 text-6xl font-bold tracking-tighter text-white sm:text-7xl lg:text-8xl">
              Know your codebase before you prompt.
            </h1>
            <p className="mb-10 text-xl text-gray-400 max-w-xl leading-relaxed">
              DevGraph turns architecture notes into a graph your team and AI agents can actually
              use.
            </p>

            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-sm bg-white/10 border border-white/10 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black"
            >
              Start Here
              <Sparkles className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Hero Visual - Massive Code Window */}
          <div className="relative w-full rounded-sm bg-[#111] p-2 sm:p-4 shadow-2xl ring-1 ring-white/10">
            {/* Window Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <div className="absolute top-4 left-6 text-xs text-gray-500 font-mono">
              session: devgraph-core // seed //
            </div>

            <div className="mt-8">
              <CodeWindow
                code={`# E-commerce Platform Architecture

\`\`\`devgraph-service
name: api-gateway
type: node
depends:
  - order-service
  - product-service
  - user-service
ports:
  - 4000
healthcheck:
  http: http://localhost:4000/health
\`\`\``}
                className="bg-transparent border-none shadow-none text-base sm:text-lg"
              />
            </div>
          </div>
        </section>

        {/* Feature 1: Architecture */}
        <FeatureSection
          title="Your architecture, structured."
          description="DevGraph parses simple markdown blocks to map services, APIs, and dependencies. No complex YAML hell, just documentation that works."
          bullets={[
            'Define service boundaries and types',
            'Map API surface area and routes',
            'Track environment variables across services',
          ]}
          codeTitle="service-definition.md"
          code={`\`\`\`devgraph-service
name: order-service
type: node
commands:
  dev: pnpm dev --filter order-service
depends:
  - product-service
  - payment-service
ports:
  - 4001
\`\`\``}
        />

        {/* Feature 2: Map Repo */}
        <FeatureSection
          align="right"
          title="Map your repo in minutes."
          description="Just add markdown blocks to your existing docs. Run the build command. Get usable artifacts for your team and AI agents immediately."
          bullets={[
            'Add devgraph blocks to markdown',
            "Run 'devgraph build' in your terminal",
            'Visualize instantly in the local Studio',
          ]}
          codeTitle="terminal"
          code={`$ devgraph build

> Found 12 devgraph blocks in 4 files.
> Building graph...
> distinct nodes: 15
> edges: 24
> Generated .devgraph/graph.json
> Generated .devgraph/summary.md for agents

✨ Done in 0.4s.`}
        />

        {/* Feature 3: Context Graph */}
        <FeatureSection
          title="From architecture to context."
          description="Start with a clean architecture graph today. Evolve into a full context graph that tracks decisions, provenance, and operational history."
          bullets={[
            'Today: Structure, relationships, and dependencies',
            'Next: History, decisions (ADRs), and incidents',
            'A graph you can query like a database',
          ]}
          codeTitle="graph.json (preview)"
          code={`{
  "nodes": [
    {
      "id": "api-gateway",
      "type": "service",
      "metadata": {
        "language": "typescript",
        "framework": "express",
        "owner": "@platform-team"
      },
      "relationships": [
        { "target": "order-service", "type": "depends_on" }
      ]
    }
  ]
}`}
        />

        {/* Grid Section: Connect Sources */}
        <FeatureGrid
          title="Connect your reality."
          description="DevGraph connects the sources that matter to your daily engineering work, creating a unified view of your system."
          actionLink={{ text: 'Open workflow', url: '/docs' }}
          items={[
            {
              icon: <GitBranch className="h-6 w-6" />,
              title: 'Git & CI/CD',
              description:
                'Integrate repository context, code owners, and pipeline status directly into your graph.',
              linkText: 'Read Git integration',
              linkUrl: '#',
            },
            {
              icon: <Activity className="h-6 w-6" />,
              title: 'API & Packages',
              description:
                'Track OpenAPI specs, internal packages, and third-party dependencies automatically.',
              linkText: 'Read API docs',
              linkUrl: '#',
            },
            {
              icon: <Database className="h-6 w-6" />,
              title: 'Infra & Observability',
              description:
                'Link Terraform resources, Kubernetes manifests, and observability signals.',
              linkText: 'Read Infra specs',
              linkUrl: '#',
            },
            {
              icon: <Terminal className="h-6 w-6" />,
              title: 'Docs & Decisions',
              description:
                'Treat ADRs, product specs, and technical documentation as first-class graph citizens.',
              linkText: 'Read Docs pattern',
              linkUrl: '#',
            },
          ]}
        />

        {/* Bottom CTA */}
        {/* Note: Reference doesn't emphasize a huge bottom CTA, but keeping a minimal one is good practice. 
            I'll keep it minimal to match the footer vibe. */}
      </main>

      <Footer />
    </div>
  );
}
