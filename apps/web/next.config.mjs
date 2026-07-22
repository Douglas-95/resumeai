/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@resumeai/shared-types'],
  images: {
    domains: ['your-project.supabase.co'],
  },
}

export default nextConfig
