import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fátima Scofield – Meta Ads',
  description: 'Fátima Scofield — Meta Ads performance overview (Geral + B2C + B2B)',
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
