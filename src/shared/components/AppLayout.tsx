import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmailVerificationBanner } from './EmailVerificationBanner';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col md:pl-[260px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex min-w-0 flex-1 flex-col px-3 py-3 md:px-4 md:py-4">
          <EmailVerificationBanner />
          <div className="min-w-0 w-full flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
