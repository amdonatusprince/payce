/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    // Handle source maps properly
    config.module.rules.push({
      test: /\.js\.map$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });

    // Handle all declaration files and source maps
    config.module.rules.push({
      test: /\.(d\.ts|d\.ts\.map|js\.map)$/,
      use: 'null-loader',
      type: 'javascript/auto',
    });

    // Handle .mjs files
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Ignore specific problematic modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@metamask/sdk-communication-layer': false,
    };

    // Disable source maps in production
    if (config.mode === 'production') {
      config.devtool = false;
    }

    return config;
  },
  // Add transpilePackages if needed
  transpilePackages: [
    '@metamask/sdk',
    '@wagmi/connectors',
    'wagmi',
    '@rainbow-me/rainbowkit'
  ],
}

export default nextConfig
