/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    // Expõe o modo para o client-side (client components podem ler via process.env)
    // next.config.js é executado no build; se as vars não existem → modo preview
    NEXT_PUBLIC_PREVIEW_MODE:
      !process.env.MONGODB_URI || !process.env.BULKFOLLOWS_API_KEY ? 'true' : 'false',
  },
}

module.exports = nextConfig
