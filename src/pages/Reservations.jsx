import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getReservations } from '../services/reservationService';
import { startSession } from '../services/sessionService';
import { FileText, MapPin, Car, Clock, QrCode, ArrowRight, Zap, Plus } from 'lucide-react';

const statusConfig = {
  PENDING: {
    label: 'Pending',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    border: '#fbbf24',
    text: 'text-amber-700',
    badgeBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  },
  CONFIRMED: {
    label: 'Confirmed',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'from-blue-50 to-indigo-50',
    border: '#93c5fd',
    text: 'text-blue-700',
    badgeBg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  },
  ACTIVE: {
    label: 'Active',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'from-emerald-50 to-teal-50',
    border: '#6ee7b7',
    text: 'text-emerald-700',
    badgeBg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  },
  COMPLETED: {
    label: 'Completed',
    gradient: 'from-slate-400 to-slate-500',
    bg: 'from-slate-50 to-slate-100',
    border: '#cbd5e1',
    text: 'text-slate-600',
    badgeBg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
  },
};

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await getReservations();
      setReservations(res.data);
    } catch (err) {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleStartSession = async (reservationId) => {
    if (!window.confirm('Simulate arrival: Start parking session now?')) return;
    try {
      await startSession(reservationId);
      navigate('/sessions');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start session');
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl skeleton" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton" />)}
    </div>
  );

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">My Reservations</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your active and upcoming parking slots</p>
        </div>
        <Link
          to="/request-parking"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            boxShadow: '0 4px 15px rgba(37,99,235,0.35)',
          }}
        >
          <Plus size={15} /> New Booking
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', color: '#9f1239', border: '1px solid #fca5a5' }}>
          ⚠ {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #ede9fe)' }}>
            <FileText size={32} className="text-blue-400" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800 text-lg mb-1">No Reservations Found</h3>
            <p className="text-slate-400 text-sm">You don't have any active or upcoming reservations.</p>
          </div>
          <Link
            to="/request-parking"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              boxShadow: '0 4px 15px rgba(37,99,235,0.35)',
            }}
          >
            <Zap size={15} /> Request Parking
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((res, idx) => {
            const cfg = statusConfig[res.reservationStatus] || statusConfig.COMPLETED;
            return (
              <div
                key={res._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  border: `1px solid ${cfg.border}30`,
                  animationDelay: `${idx * 0.05}s`,
                  animation: 'fadeIn 0.4s ease-out both',
                }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Status sidebar */}
                  <div className={`p-6 flex flex-col justify-center items-center md:w-44 bg-gradient-to-br ${cfg.bg} border-b md:border-b-0 md:border-r`}
                    style={{ borderColor: `${cfg.border}40` }}>
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                      style={{ background: cfg.badgeBg, color: cfg.text.replace('text-', '') === 'text-amber-700' ? '#92400e' : undefined }}>
                      <span className={cfg.text}>{cfg.label}</span>
                    </span>
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Booking ID</p>
                    <p className="font-mono font-bold text-slate-700 break-all text-center text-xs">{res.bookingId}</p>
                  </div>

                  {/* Details */}
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                          <MapPin size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Location</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{res.locationId?.name || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                          <span className="text-emerald-600 font-bold text-xs">P</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Slot</p>
                          <p className="font-black text-xl text-slate-900 mt-0.5">{res.slotId?.slotNumber || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                          <Car size={14} className="text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Vehicle</p>
                          <span className="inline-block px-2 py-0.5 bg-slate-800 text-white font-mono text-xs rounded-lg mt-1">
                            {res.vehicleId?.vehicleNumber || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                          <Clock size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reserved Period</p>
                          <p className="text-xs text-slate-700 mt-0.5">
                            {new Date(res.startTime).toLocaleString()}<br />
                            <span className="text-slate-400">to</span> {new Date(res.endTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap gap-2">
                      <Link
                        to="/pass"
                        state={{ reservation: res }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200"
                      >
                        <QrCode size={14} /> View QR Pass
                      </Link>

                      {(res.reservationStatus === 'PENDING' || res.reservationStatus === 'CONFIRMED') && (
                        <button
                          onClick={() => handleStartSession(res._id)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                          style={{
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            boxShadow: '0 4px 15px rgba(5,150,105,0.35)',
                          }}
                        >
                          <Zap size={14} /> Simulate Arrival
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reservations;
