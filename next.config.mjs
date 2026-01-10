/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend =
      process.env.BACKEND_BASE || "https://pyratas-smm-api.onrender.com";

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
