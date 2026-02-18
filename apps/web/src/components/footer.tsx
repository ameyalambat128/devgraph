import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-12 px-6 md:grid-cols-4">
        {/* Brand Column with vertical line */}
        <div className="pr-8 md:border-r md:border-white/10">
          <h3 className="mb-6 text-[10px] font-mono uppercase tracking-widest text-gray-500">
            DEVGRAPH
          </h3>
          <p className="text-sm leading-relaxed text-gray-400 mb-8 max-w-[200px]">
            Graph-based context for humans and AI agents.
            <br />
            Understand your codebase.
          </p>
          <p className="mt-auto text-[10px] text-gray-600 font-mono">
            © {new Date().getFullYear()} Visible.
          </p>
        </div>

        <div className="pl-0 md:pl-8">
          <h3 className="mb-6 text-[10px] font-mono uppercase tracking-widest text-gray-500">
            Product
          </h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link href="/docs" className="hover:text-white transition-colors">
                Docs
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                API Reference
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Integrations
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Enterprise
              </Link>
            </li>
          </ul>
        </div>

        <div className="pl-0 md:pl-8">
          <h3 className="mb-6 text-[10px] font-mono uppercase tracking-widest text-gray-500">
            Resources
          </h3>
          <ul className="space-y-4 text-sm text-gray-400">
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
                Changelog
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                NPM Package
              </Link>
            </li>
          </ul>
        </div>

        <div className="pl-0 md:pl-8">
          <h3 className="mb-6 text-[10px] font-mono uppercase tracking-widest text-gray-500">
            Company
          </h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Manifesto
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
