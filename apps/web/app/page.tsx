import { Terminal } from './components/Terminal';

export default function Home() {
  return (
    <main>
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">DevGraph</h1>
            <p className="hero-tagline">
              One graph. Every repo.<br />
              Context for humans and AI.
            </p>
            <div className="cta-group">
              <a href="#get-started" className="btn btn-primary">
                Get Started
              </a>
              <a
                href="https://github.com/ameyalambat128/devgraph"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                View on GitHub
              </a>
            </div>
          </div>
          
          <div className="hero-visual">
            <Terminal />
          </div>
        </div>

        {/* Problem Statement */}
        <section className="section">
          <h2 className="section-title">Your codebase is a black box</h2>
          <p className="section-subtitle">
            Complexity grows silently until no one understands the whole system.
          </p>
          
          <div className="grid-3">
            <div className="card">
              <h3>Scattered Docs</h3>
              <p>READMEs, Wikis, and notion pages that are always out of date and disconnected from code.</p>
            </div>
            <div className="card">
              <h3>AI Amnesia</h3>
              <p>LLMs ask you to explain your architecture every time because they lack global context.</p>
            </div>
            <div className="card">
              <h3>Onboarding Hell</h3>
              <p>New developers spend weeks just trying to understand how services talk to each other.</p>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="section">
          <h2 className="section-title">One command. Total clarity.</h2>
          <p className="section-subtitle">
            DevGraph scans your repo, builds a unified graph, and generates the context you need.
          </p>

          <div className="grid-3">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <span className="step-title">Annotate</span>
                <p className="text-muted">Add simple blocks to your Markdown files.</p>
                <div className="code-block">
                  <span className="code-comment"># service.md</span><br/>
                  ```devgraph-service<br/>
                  <span className="code-keyword">id:</span> <span className="code-string">&quot;auth-api&quot;</span><br/>
                  <span className="code-keyword">type:</span> <span className="code-string">&quot;service&quot;</span><br/>
                  <span className="code-keyword">language:</span> <span className="code-string">&quot;typescript&quot;</span><br/>
                  ```
                </div>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <span className="step-title">Build</span>
                <p className="text-muted">Run the CLI to scan and link everything.</p>
                <div className="code-block">
                  <span className="prompt">$</span> devgraph build
                </div>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <span className="step-title">Use</span>
                <p className="text-muted">Get structured outputs for every use case.</p>
                <ul className="feature-list" style={{ marginTop: '24px' }}>
                  <li className="feature-item"><span className="feature-icon">✓</span> Humans</li>
                  <li className="feature-item"><span className="feature-icon">✓</span> Machines</li>
                  <li className="feature-item"><span className="feature-icon">✓</span> AI Agents</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Outputs */}
        <section className="section">
          <h2 className="section-title">What you get</h2>
          <p className="section-subtitle">
            Artifacts generated automatically from your source of truth.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table className="output-table">
              <thead>
                <tr>
                  <th>Output File</th>
                  <th>Audience</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>graph.json</code></td>
                  <td>Machines</td>
                  <td>Full graph data structure for tooling and CI/CD.</td>
                </tr>
                <tr>
                  <td><code>summary.md</code></td>
                  <td>Humans</td>
                  <td>High-level architecture overview and stats.</td>
                </tr>
                <tr>
                  <td><code>system.mmd</code></td>
                  <td>Visual</td>
                  <td>Mermaid.js diagram of your system topology.</td>
                </tr>
                <tr>
                  <td><code>AGENTS.md</code></td>
                  <td>AI Models</td>
                  <td>Optimized context prompt for LLM assistants.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Use Cases */}
        <section className="section">
          <h2 className="section-title">Who is this for?</h2>
          
          <div className="grid-3">
            <div className="card">
              <h3>Monorepo Owners</h3>
              <p>Map complex dependencies between packages and services automatically.</p>
            </div>
            <div className="card">
              <h3>Platform Teams</h3>
              <p>Generate up-to-date architecture documentation without manual effort.</p>
            </div>
            <div className="card">
              <h3>AI Builders</h3>
              <p>Give your Cursor/Copilot agents the &quot;Big Picture&quot; context they are missing.</p>
            </div>
          </div>
        </section>

        {/* Build in Public */}
        <section className="section text-center">
          <h2 className="section-title">Follow the journey</h2>
          <p className="section-subtitle">
            This project is being built in public. Star the repo to follow along.
          </p>
          <a
            href="https://github.com/ameyalambat128/devgraph"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Star on GitHub
          </a>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-links">
            <a href="https://github.com/ameyalambat128/devgraph" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://twitter.com/ameyalambat" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
          <p>
            &copy; {new Date().getFullYear()} DevGraph. Open source software.
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
            Coming soon: <code>npm install -g devgraph</code>
          </p>
        </footer>
      </div>
    </main>
  );
}
