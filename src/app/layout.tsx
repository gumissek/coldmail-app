'use client';

import './globals.css';
import Sidebar from '@/components/Sidebar';
import ScheduledEmailProcessor from '@/components/ScheduledEmailProcessor';
import ThemeLanguageProvider from '@/components/ThemeLanguageProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <title>ColdMail — Email Automation</title>
        <meta name="description" content="Professional cold email campaign manager built with Next.js 16" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeLanguageProvider>
          <ScheduledEmailProcessor />
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}
