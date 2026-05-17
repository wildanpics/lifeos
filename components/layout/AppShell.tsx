'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { MorningLock } from '@/components/dashboard/MorningLock';

interface AppShellProps {
  children: React.ReactNode;
  topBarTitle?: string;
}

const SIDEBAR_WIDTH = 256; // px — must match Sidebar component

export function AppShell({ children, topBarTitle }: AppShellProps) {
  return (
    // Outer container: full viewport, no flex (sidebar is fixed so no flex needed)
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Fixed Sidebar — handled inside Sidebar component */}
      <Sidebar />

      {/* Main area: offset from sidebar on desktop via paddingLeft */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          // Mobile: no offset, bottom nav takes space
          paddingBottom: '80px',
        }}
        // On lg screens: shift content right to clear the fixed sidebar
        className="lg:pl-64 lg:pb-0"
      >
        <TopBar title={topBarTitle} />

        {/* Content fills all remaining horizontal space */}
        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Morning lock overlay */}
      <MorningLock />
    </div>
  );
}
