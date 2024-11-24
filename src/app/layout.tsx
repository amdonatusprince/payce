import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Payce - Decentralized Payment Infrastructure",
  description: "The first entirely on-chain autonomous and decentralised payment infrastructure for businesses and merchants.",
  icons: {
    icon: '/payceLogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceGrotesk.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}