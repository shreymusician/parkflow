import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Zap, Car, MapPin, Clock, CheckCircle, AlertCircle, ArrowRight, ListOrdered } from 'lucide-react';

const RequestParking = () => {
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [duration, setDuration] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, locRes, profRes] = await Promise.all([
          api.get('/vehicles'), api.get('/locations'), api.get('/users/profile')
        ]);
        setVehicles(vehRes.data.data);
        setLocations(locRes.data.data);

        const defaultVid = profRes.data?.data?.profile?.defaultVehicleId;
        if (defaultVid && vehRes.data.data.some(v => v._id === defaultVid)) {
          setSelectedVehicle(defaultVid);
        } else if (vehRes.data.data.length > 0) {
          setSelectedVehicle(vehRes.data.data[0]._id);
        }
        if (locRes.data.data.length > 0) setSelectedLocation(locRes.data.data[0]._id);
      } catch { setError('Failed to load required data.'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/reservations/request', {
        vehicleId: selectedVehicle,
        locationId: selectedLocation,
        duration: Number(duration)
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process reservation request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVehicleData = vehicles.find(v => v._id === selectedVehicle);
  const selectedLocationData = locations.find(l => l._id === selectedLocation);
  const occupancyPercent = selectedLocationData
    ? Math.round(((selectedLocationData.totalCapacity - selectedLocationData.availableSlots) / selectedLocationData.totalCapacity) * 100)
    : 0;

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 transition-all outline-none cursor-pointer";
  const focusH = e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
  const blurH = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  if (loading) return (
    <div className="flex flex-col gap-4 animate-pulse max-w-3xl mx-auto">
      <div className="h-8 w-64 rounded-xl skeleton" />
      <div className="h-64 rounded-2xl skeleton" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={18} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Smart Allocation</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Request Parking</h1>
        <p className="text-slate-500 text-sm mt-1">Our AI-powered engine will find the best spot for you instantly.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', color: '#9f1239', border: '1px solid #fca5a5' }}>
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Result Banner */}
      {result && (
        <div
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{
            border: result.waitlisted ? '1px solid #fbbf24' : '1px solid #6ee7b7',
            animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
          }}
        >
          <div className="p-4 md:p-5"
            style={{
              background: result.waitlisted
                ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                : 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            }}>
            {result.waitlisted ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <ListOrdered size={20} className="text-amber-700 flex-shrink-0" />
                  <h3 className="text-base md:text-lg font-extrabold text-amber-900">Added to Waitlist!</h3>
                </div>
                <p className="text-amber-700 text-sm">The selected location is currently at full capacity.</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
                  <div className="px-5 py-3 rounded-xl text-center"
                    style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Queue Position</p>
                    <p className="text-3xl font-black text-amber-900 font-mono">{result.position}</p>
                  </div>
                  <p className="text-sm text-amber-700 flex-1">You'll be notified when a slot becomes available for you.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-extrabold text-emerald-900">Slot Successfully Allocated!</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 md:p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(110,231,183,0.4)' }}>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Booking ID</p>
                    <p className="font-mono font-bold text-emerald-900 text-xs md:text-sm break-all">{result.bookingId}</p>
                  </div>
                  <div className="p-3 md:p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(110,231,183,0.4)' }}>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Your Slot</p>
                    <p className="font-extrabold text-2xl md:text-3xl text-emerald-900">{result.slotNumber}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-700 pt-2 border-t border-emerald-200/50 flex items-center gap-1.5">
                  ⏱️ You have <strong>15 minutes</strong> to arrive, or this slot will be auto-released.
                </p>
                <Link to="/reservations"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto self-start px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 15px rgba(5,150,105,0.4)' }}>
                  View Reservation <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="p-8 rounded-2xl flex flex-col items-center text-center gap-4"
          style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid #fbbf24' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            <Car size={28} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 mb-1">No Vehicles Registered</h3>
            <p className="text-amber-700 text-sm">Register a vehicle first to request parking.</p>
          </div>
          <Link to="/vehicles"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 4px 15px rgba(217,119,6,0.4)' }}>
            Register Vehicle <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Form header */}
          <div className="px-6 py-5 border-b border-slate-100"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #ede9fe)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Smart Allocation Engine</h3>
                <p className="text-xs text-slate-400">Fill in your preferences below</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col gap-5">
            {/* Vehicle Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Car size={12} /> Select Vehicle
              </label>
              <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
                className={inputClass} required onFocus={focusH} onBlur={blurH}>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.vehicleNumber} — {v.vehicleBrand} {v.vehicleModel} ({v.vehicleType.replace('_', ' ')})</option>
                ))}
              </select>
              {selectedVehicleData && (
                <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-blue-700"
                  style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                  <span className="font-mono font-bold">{selectedVehicleData.vehicleNumber}</span>
                  <span>•</span>
                  <span>{selectedVehicleData.vehicleBrand} {selectedVehicleData.vehicleModel}</span>
                  <span>•</span>
                  <span>{selectedVehicleData.vehicleColor}</span>
                </div>
              )}
            </div>

            {/* Location Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} /> Parking Hub
              </label>
              <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}
                className={inputClass} required onFocus={focusH} onBlur={blurH}>
                {locations.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.name} — Available: {l.availableSlots}/{l.totalCapacity}
                  </option>
                ))}
              </select>

              {/* Location availability bar */}
              {selectedLocationData && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Occupancy</span>
                    <span className={`font-bold ${occupancyPercent >= 90 ? 'text-rose-600' : occupancyPercent >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {occupancyPercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${occupancyPercent}%`,
                        background: occupancyPercent >= 90
                          ? 'linear-gradient(90deg, #dc2626, #f43f5e)'
                          : occupancyPercent >= 70
                            ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                            : 'linear-gradient(90deg, #059669, #10b981)'
                      }} />
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-600">{selectedLocationData.availableSlots}</strong> slots available of {selectedLocationData.totalCapacity} total
                  </p>
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} /> Duration
              </label>
              <div className="flex items-center gap-4">
                <input type="range" min="1" max="24" value={duration}
                  onChange={e => setDuration(e.target.value)} className="flex-1 accent-blue-600" />
                <div className="px-5 py-3 rounded-xl text-center min-w-[80px]"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
                  <p className="text-xl font-extrabold text-blue-700">{duration}</p>
                  <p className="text-xs text-blue-500 font-medium">{duration === '1' || duration === 1 ? 'hour' : 'hours'}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-4 rounded-2xl font-bold text-sm md:text-base text-white transition-all duration-200 disabled:opacity-60 flex justify-center items-center gap-2 md:gap-3"
              style={{
                background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: isSubmitting ? 'none' : '0 8px 25px rgba(37,99,235,0.45)',
              }}
              onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(37,99,235,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(37,99,235,0.45)'; }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Smart Allocation Engine Running...</span>
                  <span className="sm:hidden">Allocating...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span className="hidden sm:inline">Request Smart Allocation</span>
                  <span className="sm:hidden">Request Parking</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RequestParking;
