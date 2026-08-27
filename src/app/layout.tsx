import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zoya AI — Intelligent Voice & Text Assistant',
  description:
    'Luxury conversational AI featuring interactive voice orb, continuous speech recognition, and instant streaming intelligence.',
};

export const viewport: Viewport = {
  themeColor: '#FAF6F0',
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
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className="bg-[#FAF6F0] text-[#292524] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
