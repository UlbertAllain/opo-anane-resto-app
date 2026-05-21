/** @type {import('next').NextConfig} */
const nextConfig = {
  // HAPUS output: 'export' dulu sampai Fase 5 (Build APK)
  images: {
    unoptimized: true, // Ini biar gambar dari Supabase/Unsplash bisa muncul di Capacitor nanti
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'your-project-id.supabase.co', // Ganti dengan domain Supabase Anda
      },
    ],
  },
};

export default nextConfig;