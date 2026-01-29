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

const HotelMapLeaflet = ({ address, city }) => {
  const [position, setPosition] = useState([41.3275, 19.8187]); // Default: Tirana
  const [loading, setLoading] = useState(true);

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
        
        // Using Nominatim API (OpenStreetMap geocoding)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setPosition([parseFloat(lat), parseFloat(lon)]);
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Keep default position if geocoding fails
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address, city]);

  const openInMaps = () => {
    const url = `https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=15/${position[0]}/${position[1]}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Harta e Lokacionit</h3>
        </div>
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Harta e Lokacionit</h3>
        <button
          onClick={openInMaps}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Hap në OpenStreetMap
        </button>
      </div>
      
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-orange-100">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '250px', width: '100%' }}
          className="rounded-2xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={orangeIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{city}</p>
                <p className="text-sm text-gray-600">{address}</p>
                <button
                  onClick={openInMaps}
                  className="mt-2 text-orange-600 hover:text-orange-700 text-xs font-medium"
                >
                  Shfaq në hartë të plotë
                </button>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-xs text-gray-600">
          💡 Kliko mbi hartë për të parë detajet
        </div>
      </div>
    </div>
  );
};

export default HotelMapLeaflet;
