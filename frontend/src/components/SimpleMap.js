import React, { useState, useEffect } from 'react';

const SimpleMap = ({ address, city }) => {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    const fullAddress = `${address}, ${city}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=-74.0060,40.7128,-73.9352,40.7614&layer=mapnik&marker=${encodedAddress}`;
    setMapUrl(url);
  }, [address, city]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Hotel Location</h4>
        <a
          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${address}, ${city}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Maps
        </a>
      </div>
      
      <div className="rounded-2xl shadow-lg border border-orange-100 overflow-hidden" style={{ height: '300px' }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Hotel Location Map"
        />
      </div>
    </div>
  );
};

export default SimpleMap;
