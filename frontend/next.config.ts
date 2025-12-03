import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Désactiver les DevTools pour éviter les problèmes avec les espaces dans le chemin
  // Cette erreur est connue avec Next.js 16 + Turbopack + chemins avec espaces
  // Les DevTools peuvent être réactivés une fois le problème résolu dans une future version
};

export default nextConfig;
