import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
};

const MapComponent = () => {
  const [position, setPosition] = useState({ lat: 10.762622, lng: 106.660172 }); // Default: SG

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.error('Không lấy được vị trí người dùng:', err.message);
        }
      );
    } else {
      console.warn('Trình duyệt không hỗ trợ Geolocation');
    }
  }, []);

  return (
    <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <RecenterMap lat={position.lat} lng={position.lng} />
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[position.lat, position.lng]}>
        <Popup>Bạn đang ở đây</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;