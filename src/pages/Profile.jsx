import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Check, AlertCircle, ChevronDown } from 'lucide-react';

/* ── shared input style (avoids Tailwind/CSS specificity conflicts) ── */
const baseInput = {
  width: '100%',
  paddingTop: '11px',
  paddingBottom: '11px',
  paddingRight: '14px',
  paddingLeft: '40px',       // space for the icon
  background: 'white',
  border: '1.5px solid #e2e8f0',
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  color: '#0f172a',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};
const focusStyle   = { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59,130,246,0.15)' };
const blurStyle    = { borderColor: '#e2e8f0', boxShadow: 'none' };
const disabledStyle = { ...baseInput, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' };
const errorStyle   = { borderColor: '#f87171', boxShadow: '0 0 0 3px rgba(248,113,113,0.15)' };

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '', mobileNumber: '', gender: 'MALE',
    dob: '', city: '', email: '', role: '', createdAt: ''
  });

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileError, setMobileError]  = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data?.data?.profile) {
          const p = res.data.data.profile;
          setProfileData({
            name:         p.name         || '',
            mobileNumber: p.mobileNumber || '',
            gender:       p.gender       || 'MALE',
            dob:          p.dob ? p.dob.substring(0, 10) : '',
            city:         p.city         || '',
            email:        p.email        || '',
            role:         p.role         || '',
            createdAt:    p.createdAt    || '',
          });
        }
      } catch {
        setError('Failed to load profile. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Live mobile validation
    if (name === 'mobileNumber') {
      setMobileError(/^\d{10}$/.test(value) || value === '' ? '' : 'Must be exactly 10 digits');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(profileData.mobileNumber)) {
      setMobileError('Must be exactly 10 digits');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/users/profile', {
        name:         profileData.name,
        mobileNumber: profileData.mobileNumber,
        gender:       profileData.gender,
        dob:          profileData.dob,
        city:         profileData.city,
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── helpers ── */
  const calculateCompletion = () => {
    const fields = ['name', 'email', 'mobileNumber', 'gender', 'dob', 'city'];
    return Math.round((fields.filter(f => profileData[f]).length / fields.length) * 100);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    // Single word → first two chars
    return name.slice(0, 2).toUpperCase();
  };

  const completion = calculateCompletion();
  const initials   = getInitials(profileData.name || user?.name);

  /* ── loading skeleton ── */
  if (loading) return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto animate-pulse">
      <div className="h-8 w-48 rounded-xl skeleton" />
      <div className="h-44 rounded-2xl skeleton" />
      <div className="h-80 rounded-2xl skeleton" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto" style={{ animation: 'fadeIn 0.4s ease-out both' }}>

      {/* ── Page title ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information</p>
      </div>

      {/* ── Profile Hero Card ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        {/* Cover gradient */}
        <div className="h-24"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)' }}>
          <div className="w-full h-full opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
        </div>

        <div className="bg-white px-6 pb-6">
          {/* Avatar row — negative margin pulls it over the cover edge */}
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-extrabold text-white flex-shrink-0 shadow-lg select-none"
              style={{
                fontSize: initials.length === 1 ? '2rem' : '1.5rem',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: '4px solid white',
              }}
            >
              {initials}
            </div>
            <div className="pb-2 flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-slate-900 truncate">{profileData.name || 'User'}</h2>
              <p className="text-slate-500 text-sm truncate">{profileData.email}</p>
            </div>
            <div className="pb-2 flex-shrink-0">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700"
                style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                {profileData.role || user?.role || 'USER'}
              </span>
            </div>
          </div>

          {/* Completion bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-500">Profile Completion</span>
              <span className={`text-xs font-bold ${completion === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {completion}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${completion}%`,
                  background: completion === 100
                    ? 'linear-gradient(90deg,#059669,#10b981)'
                    : 'linear-gradient(90deg,#d97706,#f59e0b)',
                }} />
            </div>
            {completion < 100 && (
              <p className="text-xs text-slate-400 mt-1">
                Fill in all fields to reach 100%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Global alerts ── */}
      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: 'linear-gradient(135deg,#ffe4e6,#fecdd3)', border: '1px solid #fca5a5', color: '#9f1239' }}>
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', border: '1px solid #6ee7b7', color: '#065f46' }}>
          <Check size={16} className="flex-shrink-0" /> {success}
        </div>
      )}

      {/* ── Form Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Edit3 size={16} className="text-slate-500" />
          <h3 className="font-bold text-slate-800">Edit Information</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

            {/* Full Name */}
            <Field label="Full Name" icon={<User size={15} />}>
              <input
                type="text" name="name"
                value={profileData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                style={baseInput}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e  => Object.assign(e.target.style, blurStyle)}
              />
            </Field>

            {/* Email (read-only) */}
            <Field label="Email Address" icon={<Mail size={15} />}>
              <input
                type="email"
                value={profileData.email}
                disabled
                placeholder="Email address"
                style={disabledStyle}
              />
            </Field>

            {/* Mobile */}
            <Field label="Mobile Number" icon={<Phone size={15} />}>
              <input
                type="tel" name="mobileNumber"
                value={profileData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="10-digit number"
                maxLength={10}
                style={{
                  ...baseInput,
                  ...(mobileError ? errorStyle : {}),
                }}
                onFocus={e => Object.assign(e.target.style, mobileError ? errorStyle : focusStyle)}
                onBlur={e  => Object.assign(e.target.style, mobileError ? errorStyle : blurStyle)}
              />
              {/* Only show hint when there's actually an error */}
              {mobileError && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5 font-medium">
                  <AlertCircle size={11} /> {mobileError}
                </p>
              )}
            </Field>

            {/* Gender — native select, no icon overlap needed */}
            <Field label="Gender" icon={<User size={15} />}>
              <div className="relative">
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleChange}
                  style={{ ...baseInput, paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e  => Object.assign(e.target.style, blurStyle)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Prefer not to say</option>
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </Field>

            {/* Date of Birth */}
            <Field label="Date of Birth" icon={<Calendar size={15} />}>
              <input
                type="date" name="dob"
                value={profileData.dob}
                onChange={handleChange}
                style={baseInput}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e  => Object.assign(e.target.style, blurStyle)}
              />
            </Field>

            {/* City */}
            <Field label="City" icon={<MapPin size={15} />}>
              <input
                type="text" name="city"
                value={profileData.city}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
                style={baseInput}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e  => Object.assign(e.target.style, blurStyle)}
              />
            </Field>

          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl">
              <Shield size={14} className="text-emerald-500 flex-shrink-0" />
              <span>
                Member since{' '}
                <strong>
                  {profileData.createdAt
                    ? new Date(profileData.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                    : 'N/A'}
                </strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!mobileError}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
              style={{
                background: (isSubmitting || mobileError) ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                boxShadow: (isSubmitting || mobileError) ? 'none' : '0 4px 15px rgba(37,99,235,0.4)',
              }}
              onMouseEnter={e => { if (!isSubmitting && !mobileError) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isSubmitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : <><Check size={15} /> Update Profile</>}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

/* ── Reusable form field wrapper with absolutely-positioned icon ── */
const Field = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      {/* Icon pinned to left-center of the input */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
        style={{ lineHeight: 0 }}>
        {icon}
      </div>
      {children}
    </div>
  </div>
);

export default Profile;
