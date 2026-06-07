import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Map, LayoutDashboard, Bell, LogOut, TrendingUp, Users,
  Car, Activity, Zap, ShieldAlert, ArrowUpRight
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      setError('Failed to load admin analytics. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', fetchAnalytics);
      return () => socket.off('newNotification', fetchAnalytics);
    }
  }, [socket]);

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse max-w-7xl mx-auto w-full">
      <div className="h-10 w-72 rounded-xl skeleton" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(11)].map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 rounded-2xl text-center"
      style={{ background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', border: '1px solid #fca5a5' }}>
      <ShieldAlert className="w-12 h-12 mx-auto text-rose-500 mb-3" />
      <p className="text-rose-700 font-semibold">{error}</p>
    </div>
  );

  const { metrics, reservationTrends, sessionTrends, topLocations, vehicleDistribution, mostActiveUsers } = analytics;

  const metricCards = [
    { title: 'Locations', value: metrics.totalLocations, gradient: 'from-blue-500 to-cyan-500', icon: Map },
    { title: 'Total Slots', value: metrics.totalSlots, gradient: 'from-indigo-500 to-blue-600', icon: Activity },
    { title: 'Available', value: metrics.availableSlots, gradient: 'from-emerald-500 to-teal-500', icon: Activity },
    { title: 'Occupied', value: metrics.occupiedSlots, gradient: 'from-rose-500 to-pink-500', icon: Activity },
    { title: 'Active Reservations', value: metrics.reservations.active, gradient: 'from-amber-500 to-orange-500', icon: Zap },
    { title: 'Active Sessions', value: metrics.sessions.active, gradient: 'from-emerald-600 to-green-500', icon: Activity },
    { title: 'Waitlisted', value: metrics.usersWaiting, gradient: 'from-orange-500 to-red-500', icon: Users },
    { title: 'Total Users', value: metrics.totalUsers, gradient: 'from-violet-500 to-purple-600', icon: Users },
    { title: 'New Users', value: metrics.newUsersThisMonth, gradient: 'from-pink-500 to-rose-500', icon: TrendingUp },
    { title: 'Total Vehicles', value: metrics.totalVehicles, gradient: 'from-slate-600 to-slate-700', icon: Car },
    { title: 'Electric Vehicles', value: metrics.evVehicleCount, gradient: 'from-teal-500 to-emerald-600', icon: Zap },
  ];

  const CustomTooltipStyle = {
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    padding: '12px 16px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }} />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Live Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">System Operations</h1>
          <p className="text-slate-500 text-sm mt-1">Logged in as <span className="font-semibold text-slate-700">{user?.email}</span></p>
        </div>

        <div className="pill-scroll">
          {[
            { to: '/heatmap', label: 'Live Map', gradient: 'from-rose-500 to-pink-600', icon: Map },
            { to: '/demo', label: 'Demo Panel', gradient: 'from-violet-500 to-purple-600', icon: LayoutDashboard },
            { to: '/notifications', label: 'Alerts', gradient: 'from-cyan-500 to-blue-600', icon: Bell },
          ].map(btn => {
            const Icon = btn.icon;
            return (
              <Link key={btn.to} to={btn.to}
                className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${btn.gradient} transition-all duration-200 hover:-translate-y-0.5 shadow-sm flex-shrink-0`}
                style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
                <Icon size={14} /> {btn.label}
              </Link>
            );
          })}
          <button
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #334155, #1e293b)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {metricCards.map(({ title, value, gradient, icon: Icon }) => (
          <div key={title}
            className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default`}>
            <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Icon size={15} className="text-white" />
              </div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs font-semibold text-white/80 mt-0.5 leading-tight">{title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daily Reservation Volume</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 14 days</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
              <TrendingUp size={14} className="text-blue-600" />
            </div>
          </div>
          <div className="h-48 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reservationTrends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(59,130,246,0.05)', radius: 8 }}
                  contentStyle={CustomTooltipStyle}
                />
                <Bar dataKey="count" name="Reservations" radius={[6, 6, 0, 0]} barSize={28}
                  fill="url(#reservationGrad)" />
                <defs>
                  <linearGradient id="reservationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daily Parking Sessions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 14 days</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
              <Activity size={14} className="text-emerald-600" />
            </div>
          </div>
          <div className="h-48 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionTrends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(16,185,129,0.05)', radius: 8 }}
                  contentStyle={CustomTooltipStyle}
                />
                <Bar dataKey="count" name="Sessions" radius={[6, 6, 0, 0]} barSize={28}
                  fill="url(#sessionGrad)" />
                <defs>
                  <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Most Popular Hubs</h3>
              <p className="text-xs text-slate-400 mt-0.5">By reservation count</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-300" />
          </div>
          {topLocations?.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '320px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Reservations</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {topLocations?.map((loc, idx) => (
                    <tr key={loc._id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#d97706' }}>
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{loc.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-blue-600">{loc.reservationCount}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-emerald-600">{loc.sessionCount || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Most Active Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Most Active Users</h3>
              <p className="text-xs text-slate-400 mt-0.5">By total reservations</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-300" />
          </div>
          {mostActiveUsers?.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '280px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Reservations</th>
                  </tr>
                </thead>
                <tbody>
                  {mostActiveUsers?.map((u, idx) => (
                    <tr key={u._id} className="border-b border-slate-50 hover:bg-violet-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${['#2563eb,#7c3aed', '#059669,#06b6d4', '#d97706,#ef4444', '#7c3aed,#ec4899'][idx % 4]})` }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-violet-700"
                          style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                          {u.reservationCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
