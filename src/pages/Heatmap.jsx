import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { SocketContext } from '../contexts/SocketContext';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default leaflet icons not showing in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const getMarkerColor = (occupancy) => {
  if (occupancy <= 40) return '#28a745'; // Green
  if (occupancy <= 80) return '#ffc107'; // Yellow
  return '#dc3545'; // Red
};

const createCustomIcon = (occupancy) => {
  const color = getMarkerColor(occupancy);
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.3));">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-pin-icon',
    html: svgIcon,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48]
  });
};

const MapBounds = ({ data }) => {
  const map = useMap();
  useEffect(() => {
    const validData = data.filter(loc => loc.latitude != null && loc.longitude != null);
    if (validData.length > 0) {
      const bounds = L.latLngBounds(validData.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);
  return null;
};

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { socket } = useContext(SocketContext);

  const fetchHeatmap = async () => {
    try {
      const res = await api.get('/locations/heatmap');
      setHeatmapData(res.data.data);
    } catch (err) {
      setError('Failed to load map data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  // Real-time updates!
  useEffect(() => {
    if (socket) {
      const handleRefresh = () => fetchHeatmap();
      // Any new notification generally implies a change in state
      socket.on('newNotification', handleRefresh);
      return () => socket.off('newNotification', handleRefresh);
    }
  }, [socket]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Map...</div>;

  // Center on Bangalore roughly based on average or fixed coords (fallback)
  const bangaloreCenter = [12.9716, 77.5946];

  // Calculate statistics
  const totalHubs = heatmapData.length;
  const totalAvailable = heatmapData.reduce((acc, loc) => acc + (loc.availableSlots || 0), 0);
  const totalOccupied = heatmapData.reduce((acc, loc) => acc + (loc.occupiedSlots || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full max-w-6xl mx-auto gap-3 md:gap-4">
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Live Parking Map</h1>
          <p className="text-slate-500 text-xs md:text-sm">Real-time view of all parking hubs.</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg shrink-0 text-sm">{error}</div>}

      {/* Stats — 3 col on all sizes */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 shrink-0">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Hubs</p>
          <p className="text-xl md:text-2xl font-bold text-slate-800">{totalHubs}</p>
        </div>
        <div className="bg-emerald-50 p-3 md:p-4 rounded-xl shadow-sm border border-emerald-200 flex flex-col items-center text-center">
          <p className="text-[10px] md:text-xs text-emerald-700 uppercase font-bold tracking-wider mb-1">Available</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-800">{totalAvailable}</p>
        </div>
        <div className="bg-rose-50 p-3 md:p-4 rounded-xl shadow-sm border border-rose-200 flex flex-col items-center text-center">
          <p className="text-[10px] md:text-xs text-rose-700 uppercase font-bold tracking-wider mb-1">Occupied</p>
          <p className="text-xl md:text-2xl font-bold text-rose-800">{totalOccupied}</p>
        </div>
      </div>

      {/* Legend — horizontal scroll on mobile */}
      <div className="pill-scroll shrink-0 bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#28a745] shadow-sm"></div>
          <span className="whitespace-nowrap text-xs md:text-sm">Available (0–40%)</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ffc107] shadow-sm"></div>
          <span className="whitespace-nowrap text-xs md:text-sm">Filling (41–80%)</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#dc3545] shadow-sm"></div>
          <span className="whitespace-nowrap text-xs md:text-sm">Near Full (81–100%)</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[250px] border border-slate-200 rounded-xl overflow-hidden shadow-sm relative z-0">
        <MapContainer center={bangaloreCenter} zoom={13} className="h-full w-full">
          <MapBounds data={heatmapData} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {heatmapData
            .filter(loc => loc.latitude != null && loc.longitude != null)
            .map(loc => (
            <Marker 
              key={loc.locationId} 
              position={[loc.latitude, loc.longitude]}
              icon={createCustomIcon(loc.occupancyPercentage)}
            >
              <Popup className="custom-popup">
                <div className="min-w-[200px] flex flex-col gap-2 p-1">
                  <h3 className="font-bold text-slate-800 text-base">{loc.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-500 uppercase">Available</p>
                      <p className="font-bold text-slate-800">{loc.availableSlots} / {loc.totalCapacity}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-500 uppercase">Price</p>
                      <p className="font-bold text-slate-800">₹{loc.basePrice}/hr</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full h-6 bg-slate-100 rounded-md overflow-hidden relative border border-slate-200">
                      <div className="h-full transition-all duration-500 ease-in-out" style={{
                        width: `${loc.occupancyPercentage}%`,
                        backgroundColor: getMarkerColor(loc.occupancyPercentage),
                      }}></div>
                      <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                        loc.occupancyPercentage >= 50 ? 'text-white drop-shadow-md' : 'text-slate-700'
                      }`}>
                        {loc.occupancyPercentage}% Occupied
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Heatmap;
