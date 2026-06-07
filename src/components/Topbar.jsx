import React, { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 md:hidden"
        >
          <Menu size={22} />
        </button>
        <div className="md:hidden font-bold text-lg">
          <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARK</span>
          <span className="text-slate-800">FLOW</span>
        </div>
        {/* Page title placeholder area for desktop */}
        <div className="hidden md:block" />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
        >
          <Bell size={20} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: '#ef4444', animation: 'pulse-ring 1.5s ease-out infinite' }}
          />
        </Link>

        {/* Avatar */}
        <Link to="/profile" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
          >
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
