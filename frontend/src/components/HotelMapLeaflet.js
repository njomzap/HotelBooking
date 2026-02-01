import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultPosition = [41.3275, 19.8187];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const HotelMapLeaflet = ({ address, city }) => {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const parts = [address, city].filter(Boolean);
    return parts.length ? parts.join(", ") : "";
  }, [address, city]);

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
  }, []);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!query) {
        setPosition(defaultPosition);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "HotelBookingApp/1.0",
            },
          }
        );
        const data = await res.json();
        if (data?.length) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setPosition(defaultPosition);
        }
      } catch (err) {
        console.error("Failed to geocode hotel address", err);
        setPosition(defaultPosition);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [query]);

  const openInMaps = () => {
    const encoded = encodeURIComponent(query || "Hotel location");
    window.open(`https://www.openstreetmap.org/search?query=${encoded}`);
  };

  if (!isClient) {
    return null;
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

      <div className="rounded-2xl shadow-lg border border-orange-100 overflow-hidden" style={{ height: "300px" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={markerIcon}>
              <Popup>
                {hotelPopupText(query)}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );
};

const hotelPopupText = (query) => (query ? query : "Hotel location");

export default HotelMapLeaflet;
