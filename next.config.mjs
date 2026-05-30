/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/api/webhooks/square/",
        destination: "/api/webhooks/square",
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default nextConfig
