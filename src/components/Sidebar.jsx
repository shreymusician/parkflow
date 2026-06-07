import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Car, Map, History, User, LogOut,
  Settings, ShieldAlert, FileText, Bell, Zap, Home,
  ChevronRight, Sparkles
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { to: '/request-parking', icon: Zap, label: 'Book Spot', color: 'from-violet-500 to-purple-600' },
    { to: '/heatmap', icon: Map, label: 'Live Map', color: 'from-emerald-500 to-teal-500' },
    { to: '/vehicles', icon: Car, label: 'My Vehicles', color: 'from-amber-500 to-orange-500' },
    { to: '/reservations', icon: FileText, label: 'Reservations', color: 'from-blue-600 to-indigo-600' },
    { to: '/sessions', icon: History, label: 'Sessions', color: 'from-rose-500 to-pink-500' },
    { to: '/notifications', icon: Bell, label: 'Notifications', color: 'from-yellow-500 to-amber-500' },
    { to: '/profile', icon: User, label: 'Profile', color: 'from-slate-500 to-slate-600' },
  ];

  const adminLinks = [
    { to: '/admin', icon: ShieldAlert, label: 'Operations Center', color: 'from-blue-500 to-indigo-600' },
    { to: '/simulation', icon: Settings, label: 'Simulation', color: 'from-purple-500 to-violet-600' },
    { to: '/demo', icon: LayoutDashboard, label: 'Demo Overview', color: 'from-emerald-500 to-teal-600' },
    { to: '/heatmap', icon: Map, label: 'Live Map', color: 'from-rose-500 to-pink-500' },
    { to: '/notifications', icon: Bell, label: 'Alerts', color: 'from-amber-500 to-orange-500' },
  ];

  const links = (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') ? adminLinks : userLinks;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="w-64 h-full flex flex-col overflow-hidden" style={{
      background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
    }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)'
          }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARK</span>
            <span className="text-white">FLOW</span>
          </span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)'
          }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{user?.role}</p>
          </div>
          <ChevronRight size={14} style={{ color: '#64748b' }} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={isActive ? {
                background: 'rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
              } : {}}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{
                  background: 'linear-gradient(180deg, #60a5fa, #a78bfa)'
                }} />
              )}
              {/* Icon with gradient bg when active */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                isActive ? `bg-gradient-to-br ${link.color}` : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <Icon size={15} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
              </div>
              {link.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all duration-200 group"
          style={{ background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-rose-500/20 flex items-center justify-center transition-all">
            <LogOut size={15} />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
}
