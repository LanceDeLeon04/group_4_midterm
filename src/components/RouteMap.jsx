import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function svgPin(color, letter) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">
    <filter id="s${letter}"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter>
    <path d="M17 2C9.82 2 4 7.82 4 15c0 9.5 13 29 13 29S30 24.5 30 15C30 7.82 24.18 2 17 2z"
      fill="${color}" filter="url(#s${letter})" stroke="white" stroke-width="1.5"/>
    <circle cx="17" cy="15" r="6.5" fill="white" opacity="0.95"/>
    <text x="17" y="19.5" text-anchor="middle" font-size="9.5" font-weight="800"
      font-family="Plus Jakarta Sans,sans-serif" fill="${color}">${letter}</text>
  </svg>`;
  return new L.DivIcon({ html: svg, className: '', iconSize: [34, 46], iconAnchor: [17, 46], popupAnchor: [0, -48] });
}

const iconA = svgPin('#10b981', 'A');
const iconB = svgPin('#ef4444', 'B');

function FitBounds({ originCoords, destCoords, poly }) {
  const map = useMap();
  useEffect(() => {
    if (!originCoords || !destCoords) return;
    const points = [originCoords, destCoords, ...poly];
    const bounds = L.latLngBounds(points);
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [52, 52], animate: false });
  }, [
    originCoords?.[0], originCoords?.[1],
    destCoords?.[0], destCoords?.[1],
    map
  ]);
  return null;
}

// Click handler — no page scroll
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function RouteMap({ originCoords, destCoords, geometry, originName, destName, onMapClick, picking }) {
  const poly = geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
  const center = originCoords || [14.2116, 121.1653];

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      border: '1px solid #e2e8f0',
      // KEY FIX: z-index:0 and position:relative keeps map BEHIND dropdowns
      position: 'relative', zIndex: 0,
    }}>
      {picking && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(79,70,229,0.92)', color: '#fff', borderRadius: 10,
          padding: '7px 16px', fontSize: 12, fontWeight: 700, zIndex: 9,
          pointerEvents: 'none', backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
        }}>
          Click on the map to set {picking === 'origin' ? 'Origin' : 'Destination'}
        </div>
      )}
      <MapContainer
        center={center} zoom={11}
        style={{ height: 420, width: '100%', cursor: picking ? 'crosshair' : 'grab' }}
        scrollWheelZoom zoomControl
      >
        <MapClickHandler onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {originCoords && destCoords && (
          <FitBounds originCoords={originCoords} destCoords={destCoords} poly={poly} />
        )}
        {originCoords && (
          <Marker position={originCoords} icon={iconA}>
            <Popup><strong style={{ color: '#10b981' }}>Origin</strong><br />{originName}</Popup>
          </Marker>
        )}
        {destCoords && (
          <Marker position={destCoords} icon={iconB}>
            <Popup><strong style={{ color: '#ef4444' }}>Destination</strong><br />{destName}</Popup>
          </Marker>
        )}
        {poly.length > 1 && <>
          <Polyline positions={poly} color="#818cf8" weight={10} opacity={0.3} />
          <Polyline positions={poly} color="#4f46e5" weight={4} opacity={0.9} />
        </>}
      </MapContainer>
    </div>
  );
}