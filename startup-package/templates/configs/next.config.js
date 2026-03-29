/** @type {import('next').NextConfig} */
const nextConfig = {
  /* React */
  reactStrictMode: true,

  /* TypeScript */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // Remove this in production - it's here as a starter template only
    ignoreBuildErrors: false,
  },

  /* ESLint */
  eslint: {
    // !! WARN !!
    // Disable ESLint during builds
    // Remove this in production - it's here as a starter template only
    ignoreDuringBuilds: false,
  },

  /* Images */
  images: {
    // Configure domains for next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Add your own domains here
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
  },

  /* Headers */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  /* Redirects */
  async redirects() {
    return [
      // Example redirect
      // {
      //   source: '/old-page',
      //   destination: '/new-page',
      //   permanent: true,
      // },
    ];
  },

  /* Rewrites */
  async rewrites() {
    return [
      // Example rewrite for API
      // {
      //   source: '/api/v1/:path*',
      //   destination: 'https://api.example.com/:path*',
      // },
    ];
  },

  /* Environment Variables exposed to browser */
  env: {
    // Custom env vars accessible via process.env.CUSTOM_VAR
  },

  /* Experimental Features */
  experimental: {
    // Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Uncomment to enable other experimental features
    // optimizePackageImports: ['package-name'],
  },

  /* Webpack Config (advanced) */
  webpack: (config, { dev, isServer }) => {
    // Custom webpack configuration
    // Example: Add custom aliases
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   '@': path.resolve(__dirname),
    // };

    return config;
  },

  /* Output */
  // output: 'standalone', // Uncomment for Docker deployments

  /* Power by header */
  poweredByHeader: false,

  /* Compression */
  compress: true,

  /* Generate ETags */
  generateEtags: true,

  /* Page Extensions */
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  /* Trailing Slash */
  trailingSlash: false,
};

module.exports = nextConfig;
