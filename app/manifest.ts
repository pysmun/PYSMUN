import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pakistan Youth Summit Model United Nations",
    short_name: "PYSMUN",
    description: "Inspiring Leaders, Empowering Change",
    start_url: "/",
    display: "standalone",
    background_color: "#071426",
    theme_color: "#071426",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
