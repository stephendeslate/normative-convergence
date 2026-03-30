import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MedConnect - Telehealth Booking',
  description: 'Multi-tenant telehealth booking platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600">
          Skip to main content
        </a>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <div role="banner" aria-label="Demo disclaimer" className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
              <span role="status">Demo Application — Do not enter real patient data</span>
            </div>
            <div id="main-content" role="main" aria-live="polite">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
