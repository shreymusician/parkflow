import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, MapPin, Car, Clock, CheckCircle, Sparkles } from 'lucide-react';

const ParkingPass = () => {
  const location = useLocation();
  const reservation = location.state?.reservation;

  if (!reservation) return <Navigate to="/reservations" replace />;

  const qrPayload = JSON.stringify({
    bookingId: reservation.bookingId,
    slotNumber: reservation.slotId?.slotNumber,
    vehicleNumber: reservation.vehicleId?.vehicleNumber
  });

  const statusGradient = reservation.reservationStatus === 'ACTIVE'
    ? 'linear-gradient(135deg, #059669, #10b981)'
    : reservation.reservationStatus === 'PENDING'
      ? 'linear-gradient(135deg, #d97706, #f59e0b)'
      : 'linear-gradient(135deg, #2563eb, #7c3aed)';

  const statusBg = reservation.reservationStatus === 'ACTIVE'
    ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
    : reservation.reservationStatus === 'PENDING'
      ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
      : 'linear-gradient(135deg, #dbeafe, #bfdbfe)';

  const statusText = reservation.reservationStatus === 'ACTIVE'
    ? '#065f46' : reservation.reservationStatus === 'PENDING' ? '#92400e' : '#1e40af';

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto items-center" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Digital Pass</h1>
          <p className="text-slate-500 text-sm mt-0.5">Show this at the entry gate</p>
        </div>
        <Link to="/reservations"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      {/* Pass Card */}
      <div className="w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
        {/* Pass Header */}
        <div className="p-6 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
          {/* Background orbs */}
          <div style={{ position: 'absolute', width: 150, height: 150, top: '-30%', left: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 120, height: 120, bottom: '-20%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent)', filter: 'blur(25px)', pointerEvents: 'none' }} />

          <div className="relative z-10 flex items-center justify-center gap-2 mb-3">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">PARKFLOW PASS</span>
          </div>
          <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-1 relative z-10">Parking Hub</p>
          <h2 className="text-2xl font-extrabold relative z-10 truncate">{reservation.locationId?.name || 'N/A'}</h2>
        </div>

        {/* Tear line */}
        <div className="flex items-center relative" style={{ background: '#f8fafc' }}>
          <div className="absolute -left-3 w-6 h-6 rounded-full" style={{ background: 'white', zIndex: 10 }} />
          <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-4" />
          <div className="absolute -right-3 w-6 h-6 rounded-full" style={{ background: 'white', zIndex: 10 }} />
        </div>

        {/* QR Code Area */}
        <div className="px-8 py-8 flex flex-col items-center" style={{ background: '#f8fafc' }}>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 mb-4">
            <QRCodeSVG value={qrPayload} size={180} level="H"
              imageSettings={{ src: '', height: 0, width: 0, excavate: false }} />
          </div>
          <p className="font-mono text-xs text-slate-400 text-center tracking-widest break-all max-w-[220px]">
            {reservation.bookingId}
          </p>
        </div>

        {/* Tear line */}
        <div className="flex items-center relative" style={{ background: 'white' }}>
          <div className="absolute -left-3 w-6 h-6 rounded-full" style={{ background: '#f8fafc', zIndex: 10 }} />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-4" />
          <div className="absolute -right-3 w-6 h-6 rounded-full" style={{ background: '#f8fafc', zIndex: 10 }} />
        </div>

        {/* Details Area */}
        <div className="p-6 bg-white">
          <div className="grid grid-cols-2 gap-5 mb-5 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={11} className="text-slate-400" />
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Slot</p>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{reservation.slotId?.slotNumber || 'N/A'}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <Car size={11} className="text-slate-400" />
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Vehicle</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2.5 py-1.5 bg-slate-900 text-white font-mono text-sm font-bold rounded-xl">
                  {reservation.vehicleId?.vehicleNumber || 'N/A'}
                </span>
                <span className="text-xs text-slate-400">{reservation.vehicleId?.vehicleType}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={11} className="text-slate-400" />
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Valid From</p>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-slate-400">{new Date(reservation.startTime).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <Clock size={11} className="text-slate-400" />
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Valid Until</p>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-slate-400">{new Date(reservation.endTime).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-center pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: statusBg }}>
              <CheckCircle size={14} style={{ color: statusText }} />
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: statusText }}>
                {reservation.reservationStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-slate-400 text-sm max-w-xs leading-relaxed px-4">
        🔍 Scan this QR code at the entry gate to automatically start your parking session.
      </p>
    </div>
  );
};

export default ParkingPass;
