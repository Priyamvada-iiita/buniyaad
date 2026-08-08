import type { Metadata } from 'next';
import { Inter, Archivo_Black, JetBrains_Mono } from 'next/font/google';
import HelpChatbot from '@/components/HelpChatbot';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Buniyaad — Building Material, Ordered Direct',
  description: 'The marketplace connecting building material buyers and sellers across Bihar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${archivoBlack.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {children}
        <HelpChatbot />
      </body>
    </html>
  );
}
