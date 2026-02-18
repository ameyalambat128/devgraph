import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">DEVGRAPH</h3>
          <p className="text-sm leading-relaxed text-gray-500">
            Graph-based context for humans and AI agents.
            <br />
            Understand your codebase.
          </p>
          <p className="mt-8 text-xs text-gray-600">© {new Date().getFullYear()} Visible.</p>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Product
          </h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link href="/docs" className="hover:text-white transition-colors">
                Docs
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                API
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Integrations
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Resources
          </h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link
                href="https://github.com/ameyalambat128/devgraph"
                className="hover:text-white transition-colors"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Releases
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                NPM
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Company
          </h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Story
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
