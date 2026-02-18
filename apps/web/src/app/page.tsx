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
    <div className="min-h-screen bg-black text-white selection:bg-accent/20">
      <Navbar />

      <main className="pt-32">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-accent backdrop-blur-sm">
                <Sparkles className="mr-1.5 h-3 w-3" />
                v0.1 Public Alpha
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tighter sm:text-7xl">
              Know your codebase
              <br />
              before you prompt.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-400">
              DevGraph turns architecture notes into a graph your team and AI agents can actually
              use. Map your repo in minutes.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200"
              >
                Read the docs
                <Sparkles className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/ameyalambat128/devgraph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                View on GitHub
                <IconGithub className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-20">
            <div className="relative mx-auto max-w-5xl rounded-xl bg-gradient-to-b from-white/10 to-transparent p-1 backdrop-blur-2xl">
              <CodeWindow
                title="ecommerce.md (architecture definition)"
                className="shadow-2xl"
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
          actionLink={{ text: 'Get Started', url: '/docs' }}
          items={[
            {
              icon: <GitBranch className="h-6 w-6" />,
              title: 'Git & CI/CD',
              description:
                'Integrate repository context, code owners, and pipeline status directly into your graph.',
              linkText: 'Learn more',
              linkUrl: '#',
            },
            {
              icon: <Activity className="h-6 w-6" />,
              title: 'API & Packages',
              description:
                'Track OpenAPI specs, internal packages, and third-party dependencies automatically.',
              linkText: 'Learn more',
              linkUrl: '#',
            },
            {
              icon: <Database className="h-6 w-6" />,
              title: 'Infra & Observability',
              description:
                'Link Terraform resources, Kubernetes manifests, and observability signals.',
              linkText: 'Learn more',
              linkUrl: '#',
            },
            {
              icon: <Terminal className="h-6 w-6" />,
              title: 'Docs & Decisions',
              description:
                'Treat ADRs, product specs, and technical documentation as first-class graph citizens.',
              linkText: 'Learn more',
              linkUrl: '#',
            },
          ]}
        />

        {/* Bottom CTA */}
        <section className="border-t border-white/10 bg-gradient-to-b from-white/5 to-black py-24 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
              Map your repo in minutes, not meetings.
            </h2>
            <p className="mb-10 text-lg text-gray-400">
              Stop guessing how your services fit together. Start building with a shared
              understanding.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200"
              >
                Get Started
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Open Studio
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
