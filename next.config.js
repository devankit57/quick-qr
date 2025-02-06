/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      child_process: false,
      fs: false,
    };
    return config;
  },
};

