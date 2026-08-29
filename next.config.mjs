/** @type {import('next').NextConfig} */
const nextConfig = {
  //devIndicators: false, //uncomment this line after
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
