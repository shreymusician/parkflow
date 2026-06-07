import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Car, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function BottomNav() {
  const { user } = useAuth();

  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return null;

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/request-parking', icon: Zap, label: 'Book' },
    { to: '/vehicles', icon: Car, label: 'Vehicles' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-40"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className="flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200"
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
                  style={isActive ? { background: 'linear-gradient(135deg, #2563eb, #7c3aed)' } : {}}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-white' : 'text-slate-400'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
