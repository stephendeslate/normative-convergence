import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@medconnect/shared', '@medconnect/ui'],
};

export default nextConfig;
