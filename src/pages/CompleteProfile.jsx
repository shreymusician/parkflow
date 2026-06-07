import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CompleteProfile = () => {
  const [gender, setGender] = useState('MALE');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.put('/users/profile', { gender, dob, city });
      // Redirect to Vehicles page to add first vehicle
      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipStep = () => {
    navigate('/vehicles');
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            👤
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-slate-500">Just a few more details to help us personalize your parking experience.</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Gender</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Date of Birth</label>
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">City</label>
            <input 
              type="text" 
              placeholder="e.g. Bangalore" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 shadow-sm shadow-primary-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </button>
            <button 
              type="button" 
              onClick={skipStep} 
              className="w-full py-2.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
