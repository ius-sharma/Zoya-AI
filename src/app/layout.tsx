import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zoya AI — Next Generation Voice & Text Chatbot',
  description:
    'Near-black dark UI conversational AI featuring interactive Web Audio particle orb, continuous speech recognition, and instant streaming intelligence.',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-[#07060a] text-gray-100 antialiased min-h-screen selection:bg-purple-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
