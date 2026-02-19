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
        className="pointer-events-none fixed inset-0 z-[60] mx-auto max-w-7xl"
        aria-hidden="true"
      >
        <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10 hidden lg:block" />
        <div className="absolute top-0 bottom-0 right-0 w-px bg-white/10 hidden lg:block" />
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
              Start from existing READMEs across repos. Generate one architecture graph for the
              whole project.
            </p>

            <Link
              href="/docs"
              className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white"
            >
              Read docs
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
                code={`# Multi-Repo Project Architecture

\`\`\`devgraph-service
# story placeholder:
#   title: Cleft Care Research Platform
#   repos:
#     - github.com/ameyalambat128/cleftcare
#     - github.com/ameyalambat128/cleftcare-dashboard
#     - github.com/ameyalambat128/cleftcare-api
#     - github.com/ameyalambat128/cleftcare-ohm-api
name: mobile-app
type: react-native
repo: github.com/acme/mobile-app
depends:
  - backend-api
  - inference-api
links:
  web: github.com/acme/web-dashboard
  api: github.com/acme/backend-api
  inference: github.com/acme/inference-api
dataflow:
  - record audio in app
  - upload samples via backend-api
  - run analysis via inference-api
\`\`\`

$ devgraph build docs/architecture.md

> Found services across 3 repositories
> Wrote .devgraph/graph.json
> Wrote .devgraph/summary.md and .devgraph/system.mmd`}
                className="bg-black border-none shadow-none text-base sm:text-lg leading-loose py-8"
              />

              {/* Footer Bar inside terminal */}
              <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02]">
                <span className="text-[10px] font-mono text-gray-600 uppercase">1: input</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase bg-white/10 px-1.5 py-0.5 rounded-sm">
                  +2: build
                </span>
                <span className="text-[10px] font-mono text-gray-600 uppercase">3: outputs</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1: Architecture */}
        <FeatureSection
          title="What DevGraph knows right now."
          description="DevGraph turns architecture notes into a deterministic graph with outputs for humans and AI workflows."
          bullets={[
            'Service boundaries and cross-repo dependencies',
            'API routes and environment variables',
            'Generated artifacts for onboarding and automation',
          ]}
          codeTitle="summary.md (preview)"
          code={`# Project Summary

| Service | Repo | Depends On |
| --- | --- | --- |
| mobile-app | mobile-app | backend-api, inference-api |
| web-dashboard | web-dashboard | backend-api |
| backend-api | backend-api | postgres, s3 |
| inference-api | inference-api | model-runtime |

Generated files:
- .devgraph/graph.json
- .devgraph/summary.md
- .devgraph/system.mmd
- .devgraph/agents/*.md`}
          linkText="See generated outputs"
          linkUrl="/docs"
        />

        {/* Feature 2: How It Works */}
        <FeatureSection
          align="right"
          title="How it works in practice."
          description="Annotate key services in existing READMEs, run one command, and use outputs in docs, Studio, and agent workflows."
          bullets={[
            'Add devgraph blocks in Markdown docs',
            "Run 'devgraph build docs/architecture.md'",
            'Use outputs in .devgraph and open Studio',
          ]}
          codeTitle="terminal"
          code={`$ devgraph build docs/architecture.md

> Found 18 devgraph blocks in 6 files.
> Building graph...
> services: 14
> dependencies: 32
> Wrote .devgraph/graph.json
> Wrote .devgraph/summary.md
> Wrote .devgraph/system.mmd
> Wrote .devgraph/agents/mobile-app.md

✨ Done in 0.4s.`}
          linkText="See the build workflow"
          linkUrl="/docs"
        />

        {/* Feature 3: Context Graphs */}
        <FeatureSection
          title="DevGraph and context graphs."
          description="DevGraph gives you the architecture layer now. Context graph workflows extend it with decision history and operational provenance."
          bullets={[
            'Today: Structure, relationships, and dependencies',
            'Next: Decisions, incidents, and provenance',
            'Build trustworthy context in layers',
          ]}
          codeTitle="graph.json (context-ready preview)"
          code={`{
  "nodes": [
    {
      "id": "mobile-app",
      "type": "service",
      "metadata": {
        "framework": "react-native",
        "repo": "github.com/acme/mobile-app"
      },
      "relationships": [
        { "target": "backend-api", "type": "depends_on" },
        { "target": "inference-api", "type": "depends_on" }
      ],
      "context": {
        "adrs": [],
        "incidents": [],
        "provenance": "planned"
      }
    }
  ]
}`}
          linkText="Read context graph direction"
          linkUrl="/docs"
        />

        {/* Grid Section: Connect Sources */}
        <FeatureGrid
          title="Connectable sources."
          description="Connect the sources developers already use and unify them into one graph that is easier to navigate and query."
          actionLink={{ text: 'See integration roadmap', url: '/docs' }}
          items={[
            {
              icon: <GitBranch className="h-6 w-6" />,
              title: 'Git & CODEOWNERS',
              description:
                'Link repositories, ownership boundaries, and file-level context across services.',
              linkText: 'Read source mapping',
              linkUrl: '/docs',
            },
            {
              icon: <Activity className="h-6 w-6" />,
              title: 'Packages & API Specs',
              description:
                'Track package manifests, OpenAPI contracts, and dependency edges in one place.',
              linkText: 'Read dependency docs',
              linkUrl: '/docs',
            },
            {
              icon: <Database className="h-6 w-6" />,
              title: 'CI/CD & Infra',
              description:
                'Connect pipelines and infra definitions from Terraform and Kubernetes manifests.',
              linkText: 'Read pipeline docs',
              linkUrl: '/docs',
            },
            {
              icon: <Terminal className="h-6 w-6" />,
              title: 'Observability & ADRs',
              description:
                'Bring in traces, errors, runbooks, and ADRs to enrich architecture context.',
              linkText: 'Read context docs',
              linkUrl: '/docs',
            },
          ]}
        />

        {/* Bottom CTA */}
        <section className="bg-[#050505]">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="max-w-4xl pl-0 lg:pl-12">
              <h2 className="mb-6 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl leading-[1.1]">
                Map your repo in minutes, not meetings.
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-gray-400 max-w-2xl font-light">
                Start with the docs you already have. Build once. Share architecture context with
                your team and every agent session.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/docs"
                  className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="https://github.com/ameyalambat128/devgraph"
                  className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white"
                >
                  View on GitHub
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
