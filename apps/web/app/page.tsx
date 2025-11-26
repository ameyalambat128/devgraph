import { Terminal } from './components/Terminal';

export default function Home() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-6">
        {/* Hero Section */}
        <div className="flex min-h-[90vh] flex-col items-center justify-center py-20 text-center lg:flex-row lg:justify-between lg:gap-16 lg:text-left">
          <div className="lg:max-w-lg">
            <h1 className="mb-4 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-6xl font-bold leading-tight tracking-tighter text-transparent">
              DevGraph
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-muted">
              One graph. Every repo.
              <br />
              Context for humans and AI.
            </p>
            <div className="mb-12 flex justify-center gap-4 lg:mb-0 lg:justify-start">
              <a
                href="#get-started"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-accent bg-accent px-6 text-base font-medium text-bg no-underline transition-all hover:border-[#ddd] hover:bg-[#ddd]"
              >
                Get Started
              </a>
              <a
                href="https://github.com/ameyalambat128/devgraph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-6 text-base font-medium text-text no-underline transition-all hover:border-muted hover:bg-white/5"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div className="w-full max-w-lg">
            <Terminal />
          </div>
        </div>

        {/* Problem Statement */}
        <section className="border-t border-white/5 py-24">
          <h2 className="mb-4 text-center text-4xl font-bold tracking-tight">
            Your codebase is a black box
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-xl text-muted">
            Complexity grows silently until no one understands the whole system.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg-secondary p-6 transition-colors hover:border-[#555]">
              <h3 className="mb-3 text-xl font-semibold">Scattered Docs</h3>
              <p className="text-muted">
                READMEs, Wikis, and notion pages that are always out of date and
                disconnected from code.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg-secondary p-6 transition-colors hover:border-[#555]">
              <h3 className="mb-3 text-xl font-semibold">AI Amnesia</h3>
              <p className="text-muted">
                LLMs ask you to explain your architecture every time because
                they lack global context.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg-secondary p-6 transition-colors hover:border-[#555]">
              <h3 className="mb-3 text-xl font-semibold">Onboarding Hell</h3>
              <p className="text-muted">
                New developers spend weeks just trying to understand how
                services talk to each other.
              </p>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="border-t border-white/5 py-24">
          <h2 className="mb-4 text-center text-4xl font-bold tracking-tight">
            One command. Total clarity.
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-xl text-muted">
            DevGraph scans your repo, builds a unified graph, and generates the
            context you need.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-border bg-bg-secondary p-8">
              <div className="absolute -top-2.5 right-5 z-0 text-7xl font-extrabold text-[#222] opacity-50">
                1
              </div>
              <div className="relative z-10">
                <span className="mb-3 block text-2xl font-semibold">
                  Annotate
                </span>
                <p className="text-muted">
                  Add simple blocks to your Markdown files.
                </p>
                <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-code-bg p-6 font-mono text-sm text-[#a9b7c6]">
                  <span className="text-[#808080]"># service.md</span>
                  <br />
                  ```devgraph-service
                  <br />
                  <span className="text-[#cc7832]">id:</span>{' '}
                  <span className="text-[#6a8759]">&quot;auth-api&quot;</span>
                  <br />
                  <span className="text-[#cc7832]">type:</span>{' '}
                  <span className="text-[#6a8759]">&quot;service&quot;</span>
                  <br />
                  <span className="text-[#cc7832]">language:</span>{' '}
                  <span className="text-[#6a8759]">
                    &quot;typescript&quot;
                  </span>
                  <br />
                  ```
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-bg-secondary p-8">
              <div className="absolute -top-2.5 right-5 z-0 text-7xl font-extrabold text-[#222] opacity-50">
                2
              </div>
              <div className="relative z-10">
                <span className="mb-3 block text-2xl font-semibold">Build</span>
                <p className="text-muted">
                  Run the CLI to scan and link everything.
                </p>
                <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-code-bg p-6 font-mono text-sm text-[#a9b7c6]">
                  <span className="mr-2 font-bold text-[#ff00ff]">$</span>{' '}
                  devgraph build
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-bg-secondary p-8">
              <div className="absolute -top-2.5 right-5 z-0 text-7xl font-extrabold text-[#222] opacity-50">
                3
              </div>
              <div className="relative z-10">
                <span className="mb-3 block text-2xl font-semibold">Use</span>
                <p className="text-muted">
                  Get structured outputs for every use case.
                </p>
                <ul className="mt-6 grid list-none gap-4 p-0">
                  <li className="flex items-center gap-3 text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222] text-sm text-white">
                      ✓
                    </span>
                    Humans
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222] text-sm text-white">
                      ✓
                    </span>
                    Machines
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222] text-sm text-white">
                      ✓
                    </span>
                    AI Agents
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Outputs */}
        <section className="border-t border-white/5 py-24">
          <h2 className="mb-4 text-center text-4xl font-bold tracking-tight">
            What you get
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-xl text-muted">
            Artifacts generated automatically from your source of truth.
          </p>

          <div className="overflow-x-auto">
            <table className="mt-6 w-full border-collapse text-base">
              <thead>
                <tr>
                  <th className="border-b border-border p-4 text-left text-sm font-medium uppercase tracking-wide text-muted">
                    Output File
                  </th>
                  <th className="border-b border-border p-4 text-left text-sm font-medium uppercase tracking-wide text-muted">
                    Audience
                  </th>
                  <th className="border-b border-border p-4 text-left text-sm font-medium uppercase tracking-wide text-muted">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-border p-4">
                    <code className="rounded bg-[#222] px-2 py-1 font-mono text-sm">
                      graph.json
                    </code>
                  </td>
                  <td className="border-b border-border p-4">Machines</td>
                  <td className="border-b border-border p-4">
                    Full graph data structure for tooling and CI/CD.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-border p-4">
                    <code className="rounded bg-[#222] px-2 py-1 font-mono text-sm">
                      summary.md
                    </code>
                  </td>
                  <td className="border-b border-border p-4">Humans</td>
                  <td className="border-b border-border p-4">
                    High-level architecture overview and stats.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-border p-4">
                    <code className="rounded bg-[#222] px-2 py-1 font-mono text-sm">
                      system.mmd
                    </code>
                  </td>
                  <td className="border-b border-border p-4">Visual</td>
                  <td className="border-b border-border p-4">
                    Mermaid.js diagram of your system topology.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-border p-4">
                    <code className="rounded bg-[#222] px-2 py-1 font-mono text-sm">
                      AGENTS.md
                    </code>
                  </td>
                  <td className="border-b border-border p-4">AI Models</td>
                  <td className="border-b border-border p-4">
                    Optimized context prompt for LLM assistants.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Use Cases */}
        <section className="border-t border-white/5 py-24">
          <h2 className="mb-4 text-center text-4xl font-bold tracking-tight">
            Who is this for?
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg-secondary p-6 transition-colors hover:border-[#555]">
              <h3 className="mb-3 text-xl font-semibold">Monorepo Owners</h3>
              <p className="text-muted">
                Map complex dependencies between packages and services
                automatically.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg-secondary p-6 transition-colors hover:border-[#555]">
              <h3 className="mb-3 text-xl font-semibold">Platform Teams</h3>
              <p className="text-muted">
                Generate up-to-date architecture documentation without manual
                effort.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg-secondary p-6 transition-colors hover:border-[#555]">
              <h3 className="mb-3 text-xl font-semibold">AI Builders</h3>
              <p className="text-muted">
                Give your Cursor/Copilot agents the &quot;Big Picture&quot;
                context they are missing.
              </p>
            </div>
          </div>
        </section>

        {/* Build in Public */}
        <section className="border-t border-white/5 py-24 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            Follow the journey
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-xl text-muted">
            This project is being built in public. Star the repo to follow
            along.
          </p>
          <a
            href="https://github.com/ameyalambat128/devgraph"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-accent bg-accent px-6 text-base font-medium text-bg no-underline transition-all hover:border-[#ddd] hover:bg-[#ddd]"
          >
            Star on GitHub
          </a>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-border py-16 text-center text-muted">
          <div className="mb-6 flex justify-center gap-6">
            <a
              href="https://github.com/ameyalambat128/devgraph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text no-underline hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/ameyalambat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text no-underline hover:underline"
            >
              Twitter
            </a>
          </div>
          <p className="m-0">
            &copy; {new Date().getFullYear()} DevGraph. Open source software.
          </p>
          <p className="mt-2 text-sm">
            Coming soon:{' '}
            <code className="rounded bg-[#222] px-2 py-1 font-mono">
              npm install -g devgraph
            </code>
          </p>
        </footer>
      </div>
    </main>
  );
}
