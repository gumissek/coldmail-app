import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import ScheduledEmailProcessor from '@/components/ScheduledEmailProcessor';

export const metadata: Metadata = {
  title: 'ColdMail — Email Automation',
  description: 'Professional cold email campaign manager built with Next.js 16',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ScheduledEmailProcessor />
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
