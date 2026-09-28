/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/egypt-standalone-store',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
