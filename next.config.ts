/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // WAJIB: Untuk jadiin APK
  trailingSlash: true, // WAJIB: Biar routing di HP nggak 404
  images: {
    unoptimized: true, // WAJIB: Image optimization Next.js tidak jalan di local file
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'bxljmxqnjqeuuafuppur.supabase.co', // Ganti dengan domain Supabase Anda
      },
    ],
  },
};

export default nextConfig;