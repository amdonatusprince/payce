import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { headers } from 'next/headers';
import AppKitProvider from '@/context/AppKitProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Payce - onchain payment Infrastructure for businesses and merchants.",
  description:
    "The first entirely on-chain autonomous and decentralised payment infrastructure for businesses and merchants.",
  icons: {
    icon: "/payceLogo.png",
  },
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceGrotesk.variable} suppressHydrationWarning>
        <AppKitProvider cookies={cookies}>
            {children}
        </AppKitProvider>
      </body>
    </html>
  );
}
