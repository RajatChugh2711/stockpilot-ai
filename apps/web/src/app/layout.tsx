import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StockPilot AI | Market intelligence',
  description: 'Research workspace for Indian equity markets.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
