import type { Metadata } from "next";
import { Inter, Oswald, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import GlobalPlayer from "@/components/layout/GlobalPlayer";
import { getSetting } from "@/app/actions/settingsActions";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Voxo | Cinematic Music Magazine",
  description: "High-end music reviews and artist discoveries in cinematic perspective.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch global playlist from DB on initial server render
  const globalPlaylistUrl = await getSetting('global_spotify_playlist');

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${oswald.variable} ${montserrat.variable} ${playfair.variable} antialiased selection:bg-white selection:text-black`}
      >
        {children}
        {globalPlaylistUrl && <GlobalPlayer playlistUrl={globalPlaylistUrl} />}
      </body>
    </html>
  );
}
