import { Navbar } from '@/components/navbar';
import { FeatureSection } from '@/components/feature-section';
import { FeatureGrid } from '@/components/feature-grid';
import { Footer } from '@/components/footer';
import { CodeWindow } from '@/components/code-window';
import {
  ArrowRight,
  Terminal,
  Database,
  Activity,
  GitBranch,
  Blocks,
  FileJson2,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const siteUrl = 'https://devgraph.ameyalambat.com';
const description =
  'DevGraph turns Markdown architecture notes into a graph your team, docs, and AI agents can actually use. Build graph.json, summary.md, Mermaid diagrams, and agent-ready context from one command.';

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DevGraph',
    url: siteUrl,
    description,
    publisher: {
      '@type': 'Person',
      name: 'Ameya Lambat',
      url: 'https://ameyalambat.com',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DevGraph',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux, Windows',
    description,
    url: siteUrl,
    image: `${siteUrl}/devgraph-social-card.png`,
    screenshot: [
      `${siteUrl}/captures/devgraph-cli-capture.svg`,
      `${siteUrl}/captures/devgraph-studio-capture.svg`,
    ],
    author: {
      '@type': 'Person',
      name: 'Ameya Lambat',
      url: 'https://ameyalambat.com',
    },
    publisher: {
      '@type': 'Person',
      name: 'Ameya Lambat',
      url: 'https://ameyalambat.com',
    },
    downloadUrl: 'https://www.npmjs.com/package/devgraph',
    softwareHelp: `${siteUrl}/docs`,
    codeRepository: 'https://github.com/ameyalambat128/devgraph',
  },
];

const heroHighlights = [
  {
    key: 'markdown-blocks',
    icon: <Blocks className="h-4 w-4" />,
    label: 'Markdown blocks',
    value: 'Annotate services in docs',
  },
  {
    key: 'build-outputs',
    icon: <FileJson2 className="h-4 w-4" />,
    label: 'Build outputs',
    value: 'graph.json, summary.md, Mermaid',
  },
  {
    key: 'agent-context',
    icon: <Workflow className="h-4 w-4" />,
    label: 'Agent context',
    value: 'Stable context across repos',
  },
];

const productCaptures = [
  {
    src: '/captures/devgraph-cli-capture.svg',
    alt: 'DevGraph CLI build capture showing graph outputs written to .devgraph',
    label: 'CLI Capture',
    title: 'Build graph.json, summary.md, and Mermaid from Markdown blocks',
  },
  {
    src: '/captures/devgraph-studio-capture.svg',
    alt: 'DevGraph Studio capture showing services and dependencies in a graph view',
    label: 'Studio Capture',
    title: 'Inspect services, dependencies, and generated graph context visually',
  },
];

function HeroHighlightCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm text-white">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{value}</p>
    </div>
  );
}

function ProductCaptureCard({
  src,
  alt,
  label,
  title,
}: {
  src: string;
  alt: string;
  label: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-white/10 bg-[#0b0b0b]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-gray-500">{label}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-300">{title}</p>
      </div>
      <Image
        src={src}
        alt={alt}
        width={1400}
        height={900}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="h-auto w-full"
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-accent/30 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-end">
            <div className="max-w-4xl">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-xs font-mono uppercase tracking-wide text-gray-300">
                  One graph. Every repo.
                </span>
              </div>
              <h1 className="text-6xl font-bold tracking-[-0.06em] leading-[0.9] text-white sm:text-7xl lg:text-[6rem]">
                DevGraph
              </h1>
              <p className="mt-6 max-w-3xl text-2xl font-light leading-relaxed text-white/85 sm:text-3xl">
                Markdown-first architecture context for humans and AI.
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
                Turn the READMEs and architecture notes you already maintain into{' '}
                <span className="text-white">graph.json</span>,{' '}
                <span className="text-white">summary.md</span>, Mermaid diagrams, Studio views, and
                agent-ready context with one command.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/docs"
                  className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-white/90"
                >
                  Read docs
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="https://github.com/ameyalambat128/devgraph"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white"
                >
                  View on GitHub
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <HeroHighlightCard
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-white/10 bg-[#101010] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.28em] text-gray-500">
                    Product Proof
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    Write blocks, run one command, ship context.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wide text-emerald-300">
                  Stable
                </span>
              </div>

              <div className="rounded-sm border border-white/5 bg-black">
                <CodeWindow
                  code={`# docs/architecture.md

\`\`\`devgraph-service
name: payments-api
type: backend
repo: github.com/acme/payments-api
depends:
  - postgres
  - auth-api
links:
  studio: /docs/introduction
\`\`\`

$ devgraph build docs/architecture.md

> Found 14 devgraph blocks in 6 files
> Wrote .devgraph/graph.json
> Wrote .devgraph/summary.md
> Wrote .devgraph/system.mmd`}
                  title="devgraph build"
                  className="border-none bg-black text-sm shadow-none"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-gray-500">
                    Inputs
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    Existing Markdown, service blocks, and architecture notes across repos.
                  </p>
                </div>
                <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-gray-500">
                    Outputs
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    Shareable docs, graph data, Mermaid diagrams, and Studio-ready context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-10">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-accent">
              Real Product Captures
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
              See DevGraph in the terminal and in Studio.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-400">
              The homepage now shows the product instead of generic context language: build output
              from the CLI and a graph view from Studio on the same DevGraph brand surface.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {productCaptures.map((capture) => (
              <ProductCaptureCard
                key={capture.title}
                src={capture.src}
                alt={capture.alt}
                label={capture.label}
                title={capture.title}
              />
            ))}
          </div>
        </section>

        {/* Feature 1: Architecture */}
        <FeatureSection
          title="Turn Markdown into an architecture graph."
          description="DevGraph scans devgraph blocks in the docs you already keep and builds a deterministic graph for engineers, onboarding, and AI workflows."
          bullets={[
            'Track service boundaries and cross-repo dependencies',
            'Capture APIs, environment variables, and ownership context',
            'Generate graph outputs that stay close to the codebase',
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
          title="Build outputs your team and agents can both use."
          description="Run one command and get a stack of durable artifacts for docs, reviews, diagrams, and agent sessions across the whole repo."
          bullets={[
            'Write devgraph blocks next to the system docs they describe',
            "Run 'devgraph build docs/architecture.md' to refresh context",
            'Open Studio or ship the generated files directly into your workflows',
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
          title="DevGraph is the architecture layer you trust first."
          description="Start with deterministic structure and relationships now. Layer in decision history, incidents, and provenance as your context graph practice matures."
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
          title="Connect the sources around your graph."
          description="DevGraph starts with Markdown-first architecture context and can expand outward into the systems your team already uses."
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
                DevGraph makes your architecture legible before the next prompt.
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-gray-400 max-w-2xl font-light">
                Start from Markdown. Build one graph. Share the same architecture context with your
                team, your docs, and every AI session that touches the repo.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/docs"
                  className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-white/90"
                >
                  Read docs
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="https://github.com/ameyalambat128/devgraph"
                  target="_blank"
                  rel="noreferrer"
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
