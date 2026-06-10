import { FiMapPin } from 'react-icons/fi';

export default function LocationPicker({ lat, lng, onLocationChange }) {
  const safeLat = parseFloat(lat) || '';
  const safeLng = parseFloat(lng) || '';

  const handleLatChange = (e) => {
    const v = e.target.value;
    onLocationChange(v, lng || '', '');
  };

  const handleLngChange = (e) => {
    const v = e.target.value;
    onLocationChange(lat || '', v, '');
  };

  return (
    <div className="location-picker">
      <label><FiMapPin /> Lokacioni në Hartë</label>
      <div className="form-row">
        <div className="form-group">
          <label>Latitude</label>
          <input type="number" step="any" value={safeLat} onChange={handleLatChange} placeholder="p.sh. 42.6026" />
        </div>
        <div className="form-group">
          <label>Longitude</label>
          <input type="number" step="any" value={safeLng} onChange={handleLngChange} placeholder="p.sh. 20.9030" />
        </div>
      </div>
      {lat && lng && (
        <div className="map-wrapper" style={{ marginTop: 10 }}>
          <iframe
            title="location-preview"
            width="100%"
            height="250"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
          />
        </div>
      )}
    </div>
  );
}