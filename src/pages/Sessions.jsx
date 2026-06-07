import React, { useState, useEffect } from 'react';
import { getSessions, endSession } from '../services/sessionService';
import { Activity, Car, Clock, MapPin, CheckCircle, XCircle, DollarSign, Timer } from 'lucide-react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getSessions();
      setSessions(res.data);
    } catch (err) {
      setError('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleEndSession = async (sessionId) => {
    if (!window.confirm('Simulate departure: End parking session and release slot?')) return;
    try {
      await endSession(sessionId);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end session');
    }
  };

  const activeSessions = sessions.filter(s => s.sessionStatus === 'ACTIVE');
  const pastSessions = sessions.filter(s => s.sessionStatus !== 'ACTIVE');

  if (loading) return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl skeleton" />
      <div className="h-48 rounded-2xl skeleton" />
      <div className="h-32 rounded-2xl skeleton" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Parking Sessions</h1>
        <p className="text-slate-500 text-sm mt-1">Manage active sessions and view your parking history</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', color: '#9f1239', border: '1px solid #fca5a5' }}>
          ⚠ {error}
        </div>
      )}

      {/* Active Sessions */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }} />
          <h2 className="text-lg font-extrabold text-slate-800">Active Sessions</h2>
          {activeSessions.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              {activeSessions.length}
            </span>
          )}
        </div>

        {activeSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
              <Activity size={28} className="text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No Active Sessions</h3>
            <p className="text-slate-400 text-sm">You're not parked anywhere right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeSessions.map(sess => (
              <div key={sess._id}
                className="rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                  border: '1.5px solid #6ee7b7',
                }}>
                {/* Top bar */}
                <div className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(110,231,183,0.3)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                      style={{ animation: 'pulse-ring 1.5s ease-out infinite', boxShadow: '0 0 0 0 rgba(5,150,105,0.4)' }} />
                    <span className="font-bold text-emerald-800 text-sm uppercase tracking-wider">Live Session</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 md:p-6">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Session ID</p>
                  <p className="font-mono font-bold text-emerald-900 text-base md:text-lg mb-4 break-all">{sess.sessionId}</p>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                    <SessionDetail icon={<Car size={15} />} label="Vehicle" iconBg="linear-gradient(135deg, #064e3b, #065f46)">
                      <span className="px-2.5 py-1 bg-emerald-900 text-emerald-50 font-mono text-sm rounded-lg font-bold inline-block mt-1">
                        {sess.vehicleId?.vehicleNumber || 'N/A'}
                      </span>
                    </SessionDetail>
                    <SessionDetail icon={<MapPin size={15} />} label="Slot" iconBg="linear-gradient(135deg, #047857, #059669)">
                      <span className="text-xl font-extrabold text-emerald-900">{sess.slotId?.slotNumber || 'N/A'}</span>
                    </SessionDetail>
                    <SessionDetail icon={<Clock size={15} />} label="Entry Time" iconBg="linear-gradient(135deg, #059669, #10b981)">
                      <span className="text-sm font-semibold text-emerald-800">{new Date(sess.entryTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </SessionDetail>
                  </div>

                  <button
                    onClick={() => handleEndSession(sess.sessionId)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #f43f5e)',
                      boxShadow: '0 4px 15px rgba(220,38,38,0.4)',
                    }}
                  >
                    <span className="text-base">🚗</span> Simulate Departure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-800">Past Sessions</h2>
          {pastSessions.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600"
              style={{ background: '#f1f5f9' }}>
              {pastSessions.length}
            </span>
          )}
        </div>

        {pastSessions.length === 0 ? (
          <p className="text-slate-400 text-sm">No past sessions recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pastSessions.map((sess, idx) => (
              <div key={sess._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center hover:shadow-md hover:border-slate-200 transition-all duration-200"
                style={{ animationDelay: `${idx * 0.04}s`, animation: 'fadeIn 0.3s ease-out both' }}
              >
                {/* Left: icon + ID + exit time */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                    <CheckCircle size={18} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-slate-700 text-sm truncate max-w-[180px] sm:max-w-none">{sess.sessionId}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Exit: {sess.exitTime ? new Date(sess.exitTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Right: stats row */}
                <div className="flex items-center gap-4 pl-13 sm:pl-0">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Duration</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Timer size={11} className="text-slate-400" />
                      <p className="font-bold text-slate-700 text-sm">{sess.duration} min</p>
                    </div>
                  </div>

                  {sess.totalAmount != null && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Amount</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">₹{sess.totalAmount}</p>
                    </div>
                  )}

                  <span className="px-2 py-1 rounded-full text-[10px] font-bold text-slate-500 ml-auto sm:ml-0"
                    style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', whiteSpace: 'nowrap' }}>
                    {sess.sessionStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SessionDetail = ({ icon, label, children, iconBg }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0"
        style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="text-xs text-emerald-700 uppercase font-bold tracking-wider">{label}</p>
    </div>
    {children}
  </div>
);

export default Sessions;
