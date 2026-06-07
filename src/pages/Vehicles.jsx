import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Car, Plus, Star, Trash2, Zap, Check, Hash } from 'lucide-react';

const vehicleTypeConfig = {
  CAR: { label: 'Car', icon: '🚗', gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50' },
  BIKE: { label: 'Bike', icon: '🏍️', gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50' },
  EV_CAR: { label: 'EV Car', icon: '⚡🚗', gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50' },
  EV_BIKE: { label: 'EV Bike', icon: '⚡🏍️', gradient: 'from-teal-500 to-cyan-600', bg: 'from-teal-50 to-cyan-50' },
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultVehicleId, setDefaultVehicleId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchVehiclesAndProfile = async () => {
    try {
      setLoading(true);
      const [vRes, pRes] = await Promise.all([api.get('/vehicles'), api.get('/users/profile')]);
      setVehicles(vRes.data.data);
      if (pRes.data?.data?.profile?.defaultVehicleId) {
        setDefaultVehicleId(pRes.data.data.profile.defaultVehicleId);
      }
    } catch {
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehiclesAndProfile(); }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/vehicles', { vehicleNumber, vehicleType, vehicleModel, vehicleBrand, vehicleColor });
      setVehicleNumber(''); setVehicleModel(''); setVehicleBrand(''); setVehicleColor('');
      setShowForm(false);
      fetchVehiclesAndProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehiclesAndProfile();
    } catch { setError('Failed to delete vehicle.'); }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put('/users/profile', { defaultVehicleId: id });
      setDefaultVehicleId(id);
    } catch { setError('Failed to set default vehicle.'); }
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 transition-all outline-none";
  const focusH = e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
  const blurH = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  if (loading) return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl skeleton" />
      <div className="h-40 rounded-2xl skeleton" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 rounded-2xl skeleton" />
        <div className="h-48 rounded-2xl skeleton" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">My Vehicles</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your registered vehicles for quick parking</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: showForm ? 'linear-gradient(135deg, #dc2626, #f43f5e)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            boxShadow: '0 4px 15px rgba(37,99,235,0.35)',
          }}
        >
          <Plus size={15} style={{ transform: showForm ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
          {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', color: '#9f1239', border: '1px solid #fca5a5' }}>
          ⚠ {error}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          style={{ animation: 'slideUp 0.3s ease-out both' }}>
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #ede9fe)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Plus size={15} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-800">Register New Vehicle</h3>
          </div>

          <form onSubmit={handleAddVehicle} className="p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Number</label>
                <input type="text" placeholder="e.g., KA-01-XX-1234" value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())} required
                  className={inputClass} onFocus={focusH} onBlur={blurH} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Type</label>
                <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
                  className={`${inputClass} cursor-pointer`} onFocus={focusH} onBlur={blurH}>
                  <option value="CAR">🚗 Car</option>
                  <option value="BIKE">🏍️ Bike</option>
                  <option value="EV_CAR">⚡ EV Car</option>
                  <option value="EV_BIKE">⚡ EV Bike</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                <input type="text" placeholder="e.g., Honda" value={vehicleBrand}
                  onChange={e => setVehicleBrand(e.target.value)} required
                  className={inputClass} onFocus={focusH} onBlur={blurH} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model</label>
                <input type="text" placeholder="e.g., City" value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)} required
                  className={inputClass} onFocus={focusH} onBlur={blurH} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color</label>
                <input type="text" placeholder="e.g., White" value={vehicleColor}
                  onChange={e => setVehicleColor(e.target.value)} required
                  className={inputClass} onFocus={focusH} onBlur={blurH} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button type="submit" disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
                }}
                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>
                ) : (
                  <><Check size={15} /> Register Vehicle</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Registered Vehicles</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your fleet of vehicles</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700"
            style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
            {vehicles.length} Total
          </span>
        </div>

        <div className="p-6">
          {vehicles.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="text-4xl mb-3">🚗</div>
              <h4 className="font-semibold text-slate-700 mb-1">No vehicles yet</h4>
              <p className="text-slate-400 text-sm mb-4">Add your first vehicle to get started</p>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mx-auto"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <Plus size={14} /> Add Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((v, idx) => {
                const cfg = vehicleTypeConfig[v.vehicleType] || vehicleTypeConfig.CAR;
                const isDefault = defaultVehicleId === v._id;
                return (
                  <div key={v._id}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDefault ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                    style={{
                      border: isDefault ? '1px solid #93c5fd' : '1px solid #f1f5f9',
                      animationDelay: `${idx * 0.05}s`,
                      animation: 'fadeIn 0.3s ease-out both',
                    }}>
                    {/* Card header */}
                    <div className={`px-5 py-4 bg-gradient-to-r ${cfg.bg} flex items-center justify-between`}
                      style={{ borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cfg.icon.split('⚡')[1] || cfg.icon}</span>
                        <div>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold text-white"
                            style={{ background: `linear-gradient(135deg, ${cfg.gradient.split(' ').slice(1).join(' ')})` }}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      {isDefault && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                          <Star size={10} className="fill-white" /> DEFAULT
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-5 bg-white">
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1.5 bg-slate-900 text-white font-mono text-sm font-bold rounded-xl tracking-wider shadow-sm">
                          {v.vehicleNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{v.vehicleBrand} {v.vehicleModel}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{v.vehicleColor} • {v.vehicleType.replace('_', ' ')}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                        {!isDefault && (
                          <button onClick={() => handleSetDefault(v._id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
                            <Star size={12} /> Set Default
                          </button>
                        )}
                        <button onClick={() => handleDelete(v._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50 ml-auto">
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
