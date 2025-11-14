import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Durante el build, ignorar warnings para continuar
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ignorar errores de TypeScript durante build de producción
    ignoreBuildErrors: false,
  },
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
  // ===== CONFIGURACIONES DE SEGURIDAD =====
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  // ===== CONFIGURACIÓN DE ENTORNO =====
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // ===== CONFIGURACIÓN DE COMPILACIÓN =====
  serverExternalPackages: ["bcryptjs"],
  // ===== CONFIGURACIÓN DE SEGURIDAD ADICIONAL =====
  poweredByHeader: false,
  compress: true,
  /* config options here */
};

export default nextConfig;
