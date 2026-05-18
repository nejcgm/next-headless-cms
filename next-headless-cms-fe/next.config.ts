import type { NextConfig } from "next";
import path from "path";

const tenantId = process.env.TENANT_ID;
const analyze = process.env.ANALYZE === "true";

if (!tenantId) {
  throw new Error(
    "TENANT_ID env var is required. Set it to the tenant folder name, e.g. TENANT_ID=vukans-bike"
  );
}

// `vercel build` post-process expects the default `.next` output directory.
// Local / CI tenant builds use `.next-${tenantId}` to avoid collisions.
const distDir =
  process.env.NEXT_USE_VERCEL_DIST === "1" ? ".next" : `.next-${tenantId}`;

const nextConfig: NextConfig = {
  distDir,
  // Temporary: lint is enforced separately in CI; do not block tenant builds on legacy lint debt.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack(config, { isServer }) {
    // Tenant aliases for build-time resolution
    config.resolve ??= {};
    config.resolve.alias ??= {};
    const tenantPath = path.resolve(__dirname, `src/tenants/${tenantId}`);
    config.resolve.alias["@tenant"] = tenantPath;
    config.resolve.alias["@tenant/config"] = path.join(tenantPath, "config");
    // Mock data folder names may differ from tenantId (e.g. resort-example → resort)
    const mockDataFolder = tenantId === "resort-example" ? "resort" : tenantId;
    config.resolve.alias["@mock-data"] = path.resolve(
      __dirname,
      `src/core/mock-data.ts/${mockDataFolder}`
    );

    // Bundle analyzer for verification (only when ANALYZE=true)
    if (analyze) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins ??= [];
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          reportFilename: isServer
            ? `../analyze/server-${tenantId}.html`
            : `../analyze/client-${tenantId}.html`,
          generateStatsFile: true,
          statsFilename: isServer
            ? `../analyze/server-${tenantId}.json`
            : `../analyze/client-${tenantId}.json`,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
