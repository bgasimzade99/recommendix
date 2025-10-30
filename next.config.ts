import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

// When deploying to GitHub Pages for this repo, the site is served under /recommendix
const repoBasePath = "/recommendix";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGitHubActions ? repoBasePath : undefined,
  assetPrefix: isGitHubActions ? repoBasePath + "/" : undefined,
};

export default nextConfig;
