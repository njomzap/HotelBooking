import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const MapComponent = ({ center, zoom, onMapClick }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!mapRef.current || map) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true
    });

    // Add marker for hotel location
    new window.google.maps.Marker({
      position: center,
      map: newMap,
      title: 'Hotel Location',
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#ea580c" stroke="#fff" stroke-width="2"/>
            <circle cx="20" cy="20" r="8" fill="#fff"/>
            <circle cx="20" cy="20" r="4" fill="#ea580c"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    setMap(newMap);

    // Add click listener to open Google Maps
    newMap.addListener('click', () => {
      const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
      window.open(url, '_blank');
    });
  }, [center, zoom, map]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl cursor-pointer"
      style={{ minHeight: '400px' }}
      title="Kliko për të hapur në Google Maps"
    />
  );
};

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
          <p className="text-gray-500">Gabim në ngarkimin e hartës</p>
        </div>
      );
    case Status.SUCCESS:
      return <MapComponent />;
  }
};

const HotelMap = ({ address, city }) => {
  const [center, setCenter] = useState({ lat: 41.3275, lng: 19.8187 }); // Default: Tirana
  
  // Geocoding function to convert address to coordinates
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!window.google || !window.google.maps) return;
      
      const geocoder = new window.google.maps.Geocoder();
      const fullAddress = `${address}, ${city}`;
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          setCenter({
            lat: location.lat(),
            lng: location.lng()
          });
        }
      });
    };

    // Wait for Google Maps to be loaded
    if (window.google && window.google.maps) {
      geocodeAddress();
    } else {
      // If Google Maps is not loaded yet, wait a bit and try again
      const timer = setTimeout(() => {
        if (window.google && window.google.maps) {
          geocodeAddress();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [address, city]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lokacioni në Hartë</h3>
        <button
          onClick={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
            window.open(url, '_blank');
          }}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Hap në Google Maps
        </button>
      </div>
      
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-orange-100">
        <Wrapper
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}
          render={render}
          libraries={['geocoding']}
        >
          <MapComponent center={center} zoom={15} />
        </Wrapper>
        
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-xs text-gray-600">
          💡 Kliko mbi hartë për të hapur në Google Maps
        </div>
      </div>
    </div>
  );
};

export default HotelMap;
