import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin } from 'react-icons/fi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker draggable position={position} eventHandlers={{ dragend: (e) => { const m = e.target.getLatLng(); onPositionChange(m.lat, m.lng); } }} /> : null;
}

function MapCenterUpdater({ lat, lng }) {
  const map = useMap();
  const prev = useRef([lat, lng]);
  useEffect(() => {
    if (prev.current[0] !== lat || prev.current[1] !== lng) {
      prev.current = [lat, lng];
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ lat, lng, onLocationChange }) {
  const onChangeRef = useRef(onLocationChange);
  onChangeRef.current = onLocationChange;

  const [userPosition, setUserPosition] = useState(null);
  const [resolved, setResolved] = useState(false);

  const safeLat = parseFloat(lat) || 0;
  const safeLng = parseFloat(lng) || 0;
  const hasInitialCoords = Boolean(lat && lng);

  const center = userPosition || (hasInitialCoords ? [safeLat, safeLng] : [42.6026, 20.9030]);

  useEffect(() => {
    if (resolved) return;
    if (hasInitialCoords) { setResolved(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p);
        setResolved(true);
        onChangeRef.current(pos.coords.latitude, pos.coords.longitude, '');
      },
      () => setResolved(true),
      { timeout: 5000, enableHighAccuracy: true }
    );
  }, [resolved, hasInitialCoords]);

  const handlePositionChange = useCallback(async (newLat, newLng) => {
    let addr = '';
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'sq' } }
      );
      const data = await res.json();
      addr = data.display_name || '';
    } catch {}
    onChangeRef.current(newLat, newLng, addr);
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <div className="location-picker">
      <label><FiMapPin /> Lokacioni në Hartë</label>
      <div className="map-wrapper">
        <MapContainer center={center} zoom={13} className="leaflet-map" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={center} onPositionChange={handlePositionChange} />
          <MapCenterUpdater lat={center[0]} lng={center[1]} />
        </MapContainer>
      </div>
      <p className="map-hint">Klikoni në hartë ose tërhiqni markerin për të zgjedhur lokacionin</p>
    </div>
  );
}
