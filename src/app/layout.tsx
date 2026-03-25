import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'QuickBite – Fast Food Delivery',
    template: '%s | QuickBite',
  },
  description:
    'Order delicious burgers, fries, drinks and more — delivered fast to your door. Browse our menu, customize your order, and track delivery in real-time.',
  keywords: ['food delivery', 'fast food', 'burgers', 'order online', 'delivery tracking'],
  openGraph: {
    title: 'QuickBite – Fast Food Delivery',
    description: 'Delicious food delivered fast to your doorstep.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
