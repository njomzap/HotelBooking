import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultPosition = [41.3275, 19.8187];

const HotelMapLeaflet = ({ address, city }) => {
  const [position, setPosition] = useState(defaultPosition); // Default: Tirana
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Custom orange icon
  const orangeIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#ea580c" stroke="#fff" stroke-width="2"/>
        <circle cx="20" cy="20" r="8" fill="#fff"/>
        <circle cx="20" cy="20" r="4" fill="#ea580c"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [10, 20]
  });

  // Geocoding function to convert address to coordinates
  useEffect(() => {
    const geocodeAddress = async () => {
      try {
        const fullAddress = `${address}, ${city}`;
        console.log("Geocoding address:", fullAddress);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log("Geocoding response:", data);
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setPosition([parseFloat(lat), parseFloat(lon)]);
            console.log("Position set to:", [parseFloat(lat), parseFloat(lon)]);
          } else {
            console.log("No results found for address");
          }
        } else {
          console.log("Geocoding request failed");
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      geocodeAddress();
    }
  }, [address, city]);

  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  const openInMaps = () => {
    const url = `https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=15/${position[0]}/${position[1]}`;
    window.open(url, '_blank');
  };

  if (!isClient || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Hotel Location</h4>
        <button
          onClick={openInMaps}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Maps
        </button>
      </div>
      
      <div className="rounded-2xl shadow-lg border border-orange-100 overflow-hidden" style={{ height: '300px' }}>
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={orangeIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{city || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{address || 'No address'}</p>
                  <button
                    onClick={openInMaps}
                    className="mt-2 text-orange-600 hover:text-orange-700 text-xs font-medium"
                  >
                    View in Full Map
                  </button>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default HotelMapLeaflet;
