/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  async rewrites() {
    return [
      {
        source: '/models/:path*',
        destination: '/node_modules/face-api.js/weights/:path*',
      },
    ];
  },
};

export default nextConfig;
