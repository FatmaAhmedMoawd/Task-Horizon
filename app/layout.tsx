import './globals.css';
import type { Metadata } from 'next';
import StoreProvider from './StoreProvider';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Kanban Dashboard',
  description: 'A SaaS-style internal dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen" suppressHydrationWarning>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
