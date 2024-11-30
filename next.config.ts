/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    // Ignore source map files
    config.module.rules.push({
      test: /\.d\.ts\.map$/,
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

    return config;
  },
}

export default nextConfig
