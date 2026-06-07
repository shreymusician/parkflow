import React, { useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const SimulationDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  const runSimulation = async (count) => {
    if (!window.confirm(`Are you sure you want to simulate ${count} vehicles hitting the Allocation Engine concurrently?`)) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/simulation/traffic', { count });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = async () => {
    if (!window.confirm('WARNING: This will wipe all reservations, sessions, waitlists, and reset slots. Proceed?')) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/simulation/reset');
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Traffic Simulation Engine</h2>
          <p className="text-slate-500 text-sm">Inject artificial concurrent load into the engine.</p>
        </div>
        <Link to="/demo" className="text-primary-600 hover:text-primary-700 font-medium no-underline text-sm whitespace-nowrap">← Demo Overview</Link>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-600 mb-8 leading-relaxed">
          This panel injects concurrent artificial traffic into the Smart Allocation Engine using native MongoDB Transaction limits. It creates dummy users and fires requests simultaneously to demonstrate high-concurrency race condition handling.
        </p>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button 
            disabled={loading}
            onClick={() => runSimulation(10)}
            className="p-3 md:p-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 text-sm"
          >
            Simulate 10
          </button>
          <button 
            disabled={loading}
            onClick={() => runSimulation(25)}
            className="p-3 md:p-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-cyan-600/20 disabled:opacity-50 text-sm"
          >
            Simulate 25
          </button>
          <button 
            disabled={loading}
            onClick={() => runSimulation(50)}
            className="p-3 md:p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50 text-sm"
          >
            Simulate 50
          </button>
          <button 
            disabled={loading}
            onClick={() => runSimulation(100)}
            className="p-3 md:p-4 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl transition-colors shadow-sm shadow-amber-500/20 disabled:opacity-50 text-sm col-span-2 lg:col-span-1"
          >
            Peak Hour (100)
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <button 
            disabled={loading}
            onClick={resetSimulation}
            className="w-full p-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-rose-600/20 disabled:opacity-50 uppercase tracking-wider"
          >
            HARD RESET (Wipe Operational Data)
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span>
          Engine is running... please wait.
        </div>
      )}

      {error && <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium">{error}</div>}

      {result && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <h3 className="text-emerald-800 font-bold text-lg mb-4">{result.message}</h3>
          {result.stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">Success</p>
                <p className="text-2xl font-black text-emerald-800">{result.stats.successCount}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-xs text-amber-600 uppercase font-bold tracking-wider mb-1">Waitlisted</p>
                <p className="text-2xl font-black text-amber-800">{result.stats.waitlistCount}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-rose-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-xs text-rose-600 uppercase font-bold tracking-wider mb-1">Conflicts Blocked</p>
                <p className="text-2xl font-black text-rose-800">{result.stats.conflictCount}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationDashboard;
