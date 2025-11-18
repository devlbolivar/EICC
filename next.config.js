/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint check enabled during builds
    ignoreDuringBuilds: false,
    // Directories to lint during build
    dirs: ['app', 'components', 'lib', 'hooks', 'config', 'context'],
  },
  typescript: {
    // TypeScript check enabled - no production errors
    ignoreBuildErrors: false,
  },
  // Allow more time for static generation
  staticPageGenerationTimeout: 120,
  // Use standalone output for deployment
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // Provide dummy DATABASE_URL during build if not set
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/builddb',
  },
  serverExternalPackages: ["bcryptjs"],
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
