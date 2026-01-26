import type { Metadata } from "next";
import { Open_Sans, Inter, Roboto, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ReadOnlyBannerWrapper from "@/components/layout/ReadOnlyBannerWrapper";
import CommandPaletteProvider from "@/components/ai/CommandPaletteProvider";

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Workshop Manager",
  description: "Manage your workshop, workers, and income",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} antialiased`}
      >
        <Providers>
          <ReadOnlyBannerWrapper />
          {children}
          <CommandPaletteProvider />
        </Providers>
      </body>
    </html>
  );
}
