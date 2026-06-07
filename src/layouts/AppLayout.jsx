import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

export function AppLayout({ children }) {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4ff' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 shadow-xl shadow-slate-900/20">
        <Sidebar isOpen={true} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:hidden shadow-2xl ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* Decorative gradient top bar */}
          <div className="h-1 w-full" style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%)'
          }} />

          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-[fadeIn_0.4s_ease-out_both]"
            style={{ animation: 'fadeIn 0.4s ease-out both' }}
          >
            {children}
          </div>
        </main>

        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
