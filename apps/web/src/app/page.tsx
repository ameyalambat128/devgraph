import { Navbar } from '@/components/navbar';
import { FeatureSection } from '@/components/feature-section';
import { FeatureGrid } from '@/components/feature-grid';
import { Footer } from '@/components/footer';
import { CodeWindow } from '@/components/code-window';
import { ArrowRight, Terminal, Database, Activity, GitBranch } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-accent/30 font-sans">
      {/* Global Guide Lines - Running through header and footer */}
      <div
        className="pointer-events-none fixed inset-0 z-50 mx-auto max-w-7xl px-6"
        aria-hidden="true"
      >
        <div className="absolute top-0 bottom-0 left-6 w-px bg-white/10 hidden lg:block" />
        <div className="absolute top-0 bottom-0 right-6 w-px bg-white/10 hidden lg:block" />
      </div>

      <Navbar />

      <main className="pt-32 pb-0 relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 mb-32 relative">
          {/* Hero Content - Left Aligned */}
          <div className="max-w-4xl mb-24 pl-0 lg:pl-12">
            <div className="mb-8 flex items-center gap-2">
              <span className="h-px w-8 bg-accent/50" />
              <span className="text-xs font-mono text-accent uppercase tracking-widest">
                Public Alpha
              </span>
            </div>
            <h1 className="mb-8 text-6xl font-bold tracking-[-0.04em] leading-[0.95] text-white sm:text-7xl lg:text-[5.5rem]">
              Know your codebase
              <br />
              before you prompt.
            </h1>
            <p className="mb-12 text-xl text-gray-400 max-w-xl leading-relaxed font-light">
              DevGraph turns architecture notes into a graph your team and AI agents can actually
              use. Map your repo in minutes.
            </p>

            <Link
              href="/docs"
              className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white"
            >
              Start Here
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Hero Visual - Massive Code Window */}
          <div
            className="relative w-full rounded-sm bg-[#1A1A1A] p-3 sm:p-6 shadow-2xl border border-white/10 animate-fade-in-up opacity-0"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                {'session: local  //  graph  //'}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500/50" />
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  stable
                </span>
              </div>
            </div>

            <div className="bg-black rounded-sm overflow-hidden border border-white/5">
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
                className="bg-black border-none shadow-none text-base sm:text-lg leading-loose py-8"
              />

              {/* Footer Bar inside terminal */}
              <div className="flex items-center gap-4 px-6 py-3 border-t border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-mono text-gray-600 uppercase">
                  1: architecture
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase bg-white/10 px-1.5 py-0.5 rounded-sm">
                  +2: graph
                </span>
                <span className="text-[10px] font-mono text-gray-600 uppercase">3: context</span>
              </div>
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
          linkText="Explore service blocks"
          linkUrl="/docs"
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
          linkText="See the CLI workflow"
          linkUrl="/docs"
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
          linkText="View graph schema"
          linkUrl="/docs"
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
      </main>

      <Footer />
    </div>
  );
}
