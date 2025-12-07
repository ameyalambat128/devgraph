/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export as static HTML/JS/CSS
  output: 'export',

  // Disable image optimization (not available in static export)
  images: {
    unoptimized: true,
  },

  // Base path when served from CLI (root)
  basePath: '',

  // Trailing slashes for static file serving
  trailingSlash: true,
};

export default nextConfig;
