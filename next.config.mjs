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
}

export default nextConfig
