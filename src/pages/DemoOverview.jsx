import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const DemoOverview = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
          <span className="text-primary-600">ParkFlow</span> Management System
        </h1>
        <p className="text-base md:text-xl text-slate-500 font-light">MERN Stack Architecture &amp; Real-Time Allocation Engine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* User Flows */}
        <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-bold text-slate-800 border-b-2 border-primary-500 pb-3 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-sm">🧑‍💻</span>
            User Flows
          </h3>
          <div className="flex flex-col gap-4 flex-1">
            <DemoLink 
              to="/request-parking" 
              title="1. Request Smart Allocation" 
              desc="Test the concurrent slot allocation engine." 
              className="hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5"
            />
            <DemoLink 
              to="/reservations" 
              title="2. Manage Reservations" 
              desc="View digital QR passes and simulate arrival." 
              className="hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5"
            />
            <DemoLink 
              to="/sessions" 
              title="3. Active Sessions" 
              desc="Monitor parked vehicles and checkout to release slots." 
              className="hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5"
            />
            <DemoLink 
              to="/notifications" 
              title="4. Notification Center" 
              desc="View real-time Waitlist and Expiry alerts." 
              className="hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5"
            />
          </div>
        </div>

        {/* Global Analytics */}
        <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-bold text-slate-800 border-b-2 border-emerald-500 pb-3 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">📊</span>
            System Observability
          </h3>
          <div className="flex flex-col gap-4 flex-1">
            <DemoLink 
              to="/heatmap" 
              title="Live Occupancy Heatmap" 
              desc="Watch Bangalore fill up in real-time." 
              className="bg-emerald-50/50 border-emerald-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5" 
              titleColor="text-emerald-700" 
            />
            
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') ? (
              <>
                <DemoLink 
                  to="/admin" 
                  title="System Aggregations" 
                  desc="MongoDB complex pipeline analytics." 
                  className="bg-slate-50 border-slate-200 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5" 
                  titleColor="text-slate-800" 
                />
                <DemoLink 
                  to="/simulation" 
                  title="Traffic Simulation" 
                  desc="Inject artificial concurrent load into the engine." 
                  className="bg-amber-50/50 border-amber-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5" 
                  titleColor="text-amber-700" 
                />
              </>
            ) : (
              <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center font-medium mt-auto">
                Admin access required for System Operations and Simulation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DemoLink = ({ to, title, desc, className = "bg-white border-slate-200", titleColor = "text-primary-600" }) => (
  <Link 
    to={to} 
    className={`block p-5 border rounded-xl no-underline transition-all duration-200 ${className}`}
  >
    <strong className={`block text-lg mb-1 ${titleColor}`}>{title}</strong>
    <span className="text-sm text-slate-500">{desc}</span>
  </Link>
);

export default DemoOverview;
