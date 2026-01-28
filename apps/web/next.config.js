/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    // Skip Next.js built-in lint during build - we run ESLint separately via `npm run lint`
    // This avoids the "Next.js plugin not detected" warning with flat config
    // The @next/eslint-plugin-next rules ARE applied via our root eslint.config.js
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
