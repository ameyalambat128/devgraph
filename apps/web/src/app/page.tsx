import { Navbar } from '@/components/navbar';
import { FeatureSection } from '@/components/feature-section';
import { FeatureGrid } from '@/components/feature-grid';
import { Footer } from '@/components/footer';
import { CodeWindow } from '@/components/code-window';
import { Sparkles, Terminal, Database, Activity, GitBranch } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent/30 font-sans">
      <Navbar />

      <main className="pt-32 pb-0">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 mb-32 relative">
          {/* Vertical Guide Lines */}
          <div className="absolute top-0 bottom-0 left-6 w-px bg-white/5 hidden lg:block" />
          <div className="absolute top-0 bottom-0 right-6 w-px bg-white/5 hidden lg:block" />

          {/* Hero Content - Left Aligned */}
          <div className="max-w-4xl mb-24 pl-0 lg:pl-12">
            <div className="mb-8 flex items-center gap-2">
              <span className="h-px w-8 bg-accent/50" />
              <span className="text-xs font-mono text-accent uppercase tracking-widest">
                Public Alpha
              </span>
            </div>
            <h1 className="mb-8 text-6xl font-bold tracking-[-0.04em] leading-[0.95] text-white sm:text-7xl lg:text-[5.5rem]">
              Ship resilient AI
              <br />
              and APIs.
            </h1>
            <p className="mb-12 text-xl text-gray-400 max-w-xl leading-relaxed font-light">
              Inject realistic failures into AI SDK flows and core async APIs before launch.
            </p>

            <Link
              href="/docs"
              className="group inline-flex items-center justify-center rounded-sm border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white"
            >
              Start Here
              <Sparkles className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
            </Link>
          </div>

          {/* Hero Visual - Massive Code Window */}
          <div className="relative w-full rounded-sm bg-[#1A1A1A] p-3 sm:p-6 shadow-2xl border border-white/5">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                session 2: core // seed //
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
                code={`import { devgraph } from "devgraph/sdk"

const api = devgraph.init({
  fail: 0.1,
  delay: [120, 300],
  timeout: 3.05,
})

const res = await api.get("https://api.example.com")
// request chaos injected...`}
                className="bg-black border-none shadow-none text-base sm:text-lg leading-loose py-8"
              />

              {/* Footer Bar inside terminal */}
              <div className="flex items-center gap-4 px-6 py-3 border-t border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-mono text-gray-600 uppercase">1: presets</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase bg-white/10 px-1.5 py-0.5 rounded-sm">
                  +2: core
                </span>
                <span className="text-[10px] font-mono text-gray-600 uppercase">3: ai sdk</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1: Architecture */}
        <FeatureSection
          title="Chaos presets that feel like production."
          description="DevGraph gives you realistic failure timing, not just random errors. Use presets for quick coverage, then tune per-model and per-api options when you need precision."
          bullets={[
            'realistic / unstable / harsh / nightmare / apocalypse',
            'deterministic seeds for reproducible failures',
            'hook into every chaos event via onChaos',
          ]}
          codeTitle="chaos-config.ts"
          code={`// Add chaos to specific models
import { devgraph } from "devgraph"

const model = devgraph.model("gpt-4o", {
  presets: "nightmare",
  timeout: 8.2,
})`}
          linkText="Explore presets"
        />

        {/* Feature 2: Streaming */}
        <FeatureSection
          align="right"
          title="Streaming chaos you can actually test."
          description="Streaming fails differently. DevGraph can slow tokens, corrupt deltas, and cut streams mid-flight to prove your UI and service retry logic are solid."
          bullets={[
            'slowTokens (typing under pressure)',
            'corruptChunks (bad deltas, weird bytes)',
            'streamCut (mid-transfer termination)',
          ]}
          codeTitle="stream-test.ts"
          code={`const result = await streamText({
  model: devgraph.wrap(openai("gpt-4")),
  onChunk: (chunk) => {
    // Chaos injected into chunks
    console.log(chunk)
  }
})`}
          linkText="Learn streaming chaos"
        />

        {/* Feature 3: Diagnostics */}
        <FeatureSection
          title="Diagnostics your team can ship with."
          description="Track chaos events per request, measure latency distribution, and spot resilience gaps with a clean timeline. DevGraph helps you fix real bugs in models and services."
          bullets={[
            'group events by request id',
            'compute p50/p95/p99 latency',
            'count retries and failures accurately',
          ]}
          codeTitle="analytics.ts"
          code={`const events = [] as string[]
const api = devgraph.init({
  onChaos: (event) => events.push(event.type)
})

await generateText({ model, prompt })
console.table(events) // See what failed`}
          linkText="See diagnostics"
        />

        {/* Grid Section: Connect Sources */}
        <FeatureGrid
          title="Chaos infrastructure that ships."
          description="We focus on production-grade failure simulation for AI apps and async backends, not synthetic demos."
          actionLink={{ text: 'Open workflow', url: '/docs' }}
          items={[
            {
              icon: <Activity className="h-6 w-6" />,
              title: 'Chaos presets',
              description:
                'Start from realistic presets, then tune options per provider, model, or API.',
              linkText: 'Read chaos',
              linkUrl: '#',
            },
            {
              icon: <Terminal className="h-6 w-6" />,
              title: 'Core and AI SDK',
              description:
                'Wrap fetch and async functions with simple wrappers provided by the SDK.',
              linkText: 'Read Core API',
              linkUrl: '#',
            },
            {
              icon: <Database className="h-6 w-6" />,
              title: 'Stream drills',
              description:
                'Test slow tokens, chunk corruption, and stream cuts before shipping UI.',
              linkText: 'Read streaming',
              linkUrl: '#',
            },
            {
              icon: <GitBranch className="h-6 w-6" />,
              title: 'CI replay',
              description: 'Seed chaos once and replay deterministic sequences in every pipeline.',
              linkText: 'Read replay',
              linkUrl: '#',
            },
          ]}
        />
      </main>

      <Footer />
    </div>
  );
}
