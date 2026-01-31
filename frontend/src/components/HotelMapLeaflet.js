import * as React from 'react';
import { useEffect, useState } from 'react';

const defaultPosition = [41.3275, 19.8187];

const HotelMapLeaflet = ({ address, city }) => {
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
    setLoading(false);
  }, []);

  const openInMaps = () => {
    const query = encodeURIComponent(`${address || ''}, ${city || ''}`);
    const url = `https://www.openstreetmap.org/search?query=${query}`;
    window.open(url, '_blank');
  };

  if (loading) {
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
        <div className="relative h-full bg-gray-100">
          {/* Static Map Fallback */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium mb-2">Hotel Location</p>
              <p className="text-sm text-gray-600 mb-4">{address || 'Address not available'}</p>
              <button
                onClick={openInMaps}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelMapLeaflet;
