import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { SocketContext } from '../contexts/SocketContext';
import { Bell, Check, CheckCheck, Clock, Inbox, AlertCircle } from 'lucide-react';

/* ── Real CSS colors (not Tailwind class names) ── */
const notifTypeConfig = {
  RESERVATION_CONFIRMED: {
    gradient: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
    border: '#93c5fd',
    dot: '#3b82f6',
    iconBg: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
    icon: '🎫',
    label: 'Reservation Confirmed',
  },
  SESSION_STARTED: {
    gradient: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
    border: '#6ee7b7',
    dot: '#10b981',
    iconBg: 'linear-gradient(135deg, #d1fae5, #ccfbf1)',
    icon: '🚗',
    label: 'Session Started',
  },
  SESSION_ENDED: {
    gradient: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    border: '#cbd5e1',
    dot: '#64748b',
    iconBg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    icon: '✅',
    label: 'Session Ended',
  },
  WAITLIST_PROMOTED: {
    gradient: 'linear-gradient(135deg, #f5f3ff, #faf5ff)',
    border: '#c4b5fd',
    dot: '#8b5cf6',
    iconBg: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
    icon: '⬆️',
    label: 'Waitlist Promoted',
  },
  RESERVATION_EXPIRING: {
    gradient: 'linear-gradient(135deg, #fffbeb, #fff7ed)',
    border: '#fbbf24',
    dot: '#f59e0b',
    iconBg: 'linear-gradient(135deg, #fef3c7, #ffedd5)',
    icon: '⏰',
    label: 'Reservation Expiring',
  },
  RESERVATION_CANCELLED: {
    gradient: 'linear-gradient(135deg, #fff1f2, #fff5f5)',
    border: '#fca5a5',
    dot: '#ef4444',
    iconBg: 'linear-gradient(135deg, #fee2e2, #fecdd3)',
    icon: '❌',
    label: 'Reservation Cancelled',
  },
};

/* Fallback config for unknown types */
const DEFAULT_CFG = {
  gradient: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
  border: '#cbd5e1',
  dot: '#64748b',
  iconBg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
  icon: '🔔',
  label: 'Notification',
};

/* Format type string safely: "SESSION_STARTED" → "Session Started" */
const formatType = (type) => {
  if (!type || typeof type !== 'string') return 'Notification';
  return type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useContext(SocketContext);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      // Guard: ensure we always have an array
      setNotifications(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError('Failed to load notifications. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    if (socket) {
      const handleNew = (newNotif) => setNotifications(prev => [newNotif, ...prev]);
      socket.on('newNotification', handleNew);
      return () => socket.off('newNotification', handleNew);
    }
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, deliveryStatus: 'READ' } : n)
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => n.deliveryStatus === 'DELIVERED');
    await Promise.all(unread.map(n => markAsRead(n._id)));
  };

  const unreadCount = notifications.filter(n => n.deliveryStatus === 'DELIVERED').length;

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="flex flex-col gap-4 animate-pulse max-w-3xl mx-auto">
      <div className="h-8 w-56 rounded-xl skeleton" />
      <div className="h-6 w-32 rounded-xl skeleton" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto" style={{ animation: 'fadeIn 0.4s ease-out both' }}>

      {/* ── Header ── */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Notification Center</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated on your parking reservations</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <Bell size={14} /> {unreadCount} New
              </div>
              <button
                onClick={markAllRead}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Mark all read
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', color: '#9f1239', border: '1px solid #fca5a5' }}>
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #ede9fe)' }}>
            <Inbox size={32} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-lg">All caught up!</h3>
            <p className="text-slate-400 text-sm mt-1">No notifications yet. We'll ping you when something happens.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif, idx) => {
            // Safely resolve config — handles undefined/null/unknown type
            const cfg = notifTypeConfig[notif?.type] || DEFAULT_CFG;
            const isUnread = notif.deliveryStatus === 'DELIVERED';
            const label = cfg.label || formatType(notif?.type);

            return (
              <div
                key={notif._id || idx}
                className="rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:shadow-md cursor-default"
                style={{
                  background: isUnread ? cfg.gradient : 'white',
                  border: isUnread ? `1px solid ${cfg.border}` : '1px solid #f1f5f9',
                  borderLeft: isUnread ? `4px solid ${cfg.border}` : '4px solid #e2e8f0',
                  opacity: isUnread ? 1 : 0.72,
                  animation: 'fadeIn 0.35s ease-out both',
                  animationDelay: `${idx * 0.04}s`,
                }}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Icon bubble */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                    style={{ background: isUnread ? cfg.iconBg : '#f8fafc' }}>
                    <span role="img" aria-label={label}>{cfg.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Type badge + unread dot */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                        style={{
                          background: isUnread
                            ? `linear-gradient(135deg, ${cfg.dot}, ${cfg.dot}dd)`
                            : '#94a3b8',
                        }}>
                        {label}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: cfg.dot, boxShadow: `0 0 0 3px ${cfg.dot}33` }} />
                      )}
                    </div>

                    {/* Message */}
                    <p className={`text-sm leading-relaxed break-words ${isUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                      {notif.message || 'No message content.'}
                    </p>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock size={11} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Unknown time'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action / status */}
                <div className="flex-shrink-0">
                  {isUnread ? (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                      }}
                    >
                      <Check size={12} /> Mark Read
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCheck size={14} />
                      <span className="text-xs font-medium">Read</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
