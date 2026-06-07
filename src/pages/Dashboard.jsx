import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { getReservations } from '../services/reservationService';
import { getSessions } from '../services/sessionService';
import { SocketContext } from '../contexts/SocketContext';
import {
  Zap, Map, Car, ArrowRight, Clock, CheckCircle,
  TrendingUp, FileText, Activity, User
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [activeRes, setActiveRes] = useState(null);
  const [activeSess, setActiveSess] = useState(null);
  const [history, setHistory] = useState([]);
  const [defaultVehicle, setDefaultVehicle] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => setRefreshTrigger(prev => prev + 1);
      socket.on('newNotification', handleRefresh);
      return () => socket.off('newNotification', handleRefresh);
    }
  }, [socket]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, resData, sessData, histData, vehData] = await Promise.all([
          api.get('/users/profile'),
          getReservations(),
          getSessions(),
          api.get('/users/history'),
          api.get('/vehicles'),
        ]);

        setProfileData(profileRes.data?.data?.profile);
        setStatsData(profileRes.data?.data?.stats);
        setHistory(histData.data?.data || []);

        const vehicles = vehData.data?.data || [];
        const defaultVid = profileRes.data?.data?.profile?.defaultVehicleId;
        if (defaultVid) {
          setDefaultVehicle(vehicles.find(v => v._id === defaultVid));
        }

        const reservations = resData.data || [];
        setActiveRes(reservations.find(r => ['PENDING', 'CONFIRMED'].includes(r.reservationStatus)));

        const sessions = sessData.data || [];
        setActiveSess(sessions.find(s => s.sessionStatus === 'ACTIVE'));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [refreshTrigger]);

  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    const fields = ['name', 'email', 'mobileNumber', 'gender', 'dob', 'city', 'defaultVehicleId'];
    let filled = 0;
    fields.forEach(f => { if (profile[f] && profile[f] !== '') filled++; });
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion(profileData);
  const firstName = profileData?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-xl skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">{greeting} 👋</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Welcome back, <span style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>{firstName}!</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's what's happening with your parking today.</p>
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
        >
          <User size={15} /> Edit Profile
        </Link>
      </div>

      {/* Active Status Alerts */}
      {(activeSess || activeRes) && (
        <div className="flex flex-col gap-3">
          {activeSess && (
            <div className="p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                border: '1px solid #6ee7b7',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  <Activity size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }} />
                    <h3 className="font-bold text-emerald-900">Active Parking Session</h3>
                  </div>
                  <p className="text-sm text-emerald-700 mt-0.5">Entry: {new Date(activeSess.entryTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
              </div>
              <Link to="/sessions" className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 15px rgba(5,150,105,0.4)' }}>
                Manage <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {activeRes && !activeSess && (
            <div className="p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '1px solid #fbbf24',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                  <Clock size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Pending Reservation</h3>
                  <p className="text-sm text-amber-700 mt-0.5">Status: {activeRes.reservationStatus}</p>
                </div>
              </div>
              <Link to="/reservations" className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 4px 15px rgba(217,119,6,0.4)' }}>
                View Ticket <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reservations', value: statsData?.totalReservations ?? 0, icon: FileText, color: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50', text: 'text-blue-700' },
          { label: 'Parking Sessions', value: statsData?.totalSessions ?? 0, icon: Activity, color: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50', text: 'text-emerald-700' },
          { label: 'Vehicles', value: statsData?.registeredVehicles ?? 0, icon: Car, color: 'from-violet-500 to-purple-600', bg: 'from-violet-50 to-purple-50', text: 'text-violet-700' },
          { label: 'Profile', value: `${profileCompletion}%`, icon: TrendingUp, color: profileCompletion === 100 ? 'from-emerald-500 to-green-600' : 'from-amber-500 to-orange-500', bg: profileCompletion === 100 ? 'from-emerald-50 to-green-50' : 'from-amber-50 to-orange-50', text: profileCompletion === 100 ? 'text-emerald-700' : 'text-amber-700' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`p-5 rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${stat.color}`}>
                <Icon size={17} className="text-white" />
              </div>
              <p className={`text-2xl font-extrabold ${stat.text}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-slate-800">Profile Summary</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${profileCompletion === 100 ? 'text-emerald-700' : 'text-amber-700'}`}
              style={{ background: profileCompletion === 100 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              {profileCompletion}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${profileCompletion}%`,
                background: profileCompletion === 100 ? 'linear-gradient(90deg, #059669, #10b981)' : 'linear-gradient(90deg, #d97706, #f59e0b)'
              }}
            />
          </div>

          <div className="space-y-3 text-sm">
            {[
              { label: 'Email', value: profileData?.email || user?.email },
              { label: 'Mobile', value: profileData?.mobileNumber || 'Not set' },
              { label: 'City', value: profileData?.city || 'Not set' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{item.label}</span>
                <span className="font-semibold text-slate-800 truncate ml-2 max-w-[60%] text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">Vehicle Status</h3>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)' }}>
              <Car size={16} className="text-blue-600" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-4">
            <span className="text-sm text-slate-600">Total Vehicles</span>
            <span className="text-xl font-extrabold text-slate-900">{statsData?.registeredVehicles || 0}</span>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Default Vehicle</p>
            {defaultVehicle ? (
              <div className="p-3.5 border border-slate-100 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{defaultVehicle.vehicleBrand} {defaultVehicle.vehicleModel}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{defaultVehicle.vehicleNumber}</p>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-bold text-blue-700"
                  style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                  DEFAULT
                </span>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-sm text-slate-400">No default vehicle set</p>
              </div>
            )}
          </div>
          <Link to="/vehicles" className="flex items-center justify-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Manage Vehicles <ArrowRight size={13} />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">Quick Actions</h3>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
              <Zap size={16} className="text-violet-600" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/request-parking"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 4px 15px rgba(37,99,235,0.3)',
              }}
            >
              <Zap size={15} /> Request Parking
            </Link>
            <Link
              to="/heatmap"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200"
            >
              <Map size={15} /> View Live Map
            </Link>
            <Link
              to="/reservations"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200"
            >
              <FileText size={15} /> My Reservations
            </Link>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Recent Parking History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your latest completed sessions</p>
          </div>
          <Link to="/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
              <Clock size={24} className="text-slate-300" />
            </div>
            <h4 className="font-semibold text-slate-700 mb-1">No history yet</h4>
            <p className="text-slate-400 text-sm">Your completed sessions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-sm" style={{ minWidth: '540px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['Date', 'Hub', 'Vehicle', 'Duration', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((session, idx) => (
                  <tr key={session.sessionId}
                    className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
                    style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{new Date(session.entryTime).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{session.locationName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs rounded-md">{session.vehicleNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{session.durationMinutes} min</td>
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">₹{session.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700"
                        style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                        {session.sessionStatus}
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
  );
};

export default Dashboard;
