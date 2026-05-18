import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { LevelUpCelebrationModal } from '@/components/dashboard/LevelUpCelebrationModal';

export const metadata: Metadata = {
  title: 'LIFE OS — Personal Discipline & Productivity System',
  description:
    'Your personal Life Operating System. Build discipline, reduce dopamine addiction, eliminate procrastination, and gamify self-improvement.',
  keywords: ['productivity', 'discipline', 'habit tracker', 'life os', 'focus', 'prayer times'],
  authors: [{ name: 'LIFE OS' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LIFE OS',
  },
  openGraph: {
    title: 'LIFE OS — Personal Discipline & Productivity System',
    description: 'Build discipline, reduce distraction, live structured.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B0F19' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <LevelUpCelebrationModal />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
