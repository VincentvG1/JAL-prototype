import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PROBLEMS } from '../../data/problems';
import type { Problem } from '../../types/journey';
import '../../styles/citymap.css';

const TILBURG_CENTER: LatLngExpression = [51.5553, 5.0913];
const TILBURG_ZOOM = 14;

function makeMarkerIcon(emoji: string, color: string, selected: boolean) {
  return divIcon({
    html: `<div class="map-marker${selected ? ' map-marker--selected' : ''}" style="background:${color}">${emoji}</div>`,
    className: '',
    iconSize: [52, 52],
    iconAnchor: [26, 52],
  });
}

interface CityMapProps {
  onSelectProblem: (problem: Problem) => void;
}

export function CityMap({ onSelectProblem }: CityMapProps) {
  const [active, setActive] = useState<Problem | null>(null);

  return (
    <div className="citymap-shell">
      <header className="citymap-header">
        <div className="citymap-header-left">
          <span className="citymap-logo">🏙️</span>
          <div>
            <h1 className="citymap-heading">Kies een probleem</h1>
            <p className="citymap-subheading">
              Klik op een locatie in Tilburg om een probleem te verkennen
            </p>
          </div>
        </div>
        <div className="citymap-badge">Junior AI League</div>
      </header>

      <div className="citymap-body">
        <MapContainer
          center={TILBURG_CENTER}
          zoom={TILBURG_ZOOM}
          className="citymap-map"
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {PROBLEMS.map((p) => (
            <Marker
              key={p.id}
              position={p.position as LatLngExpression}
              icon={makeMarkerIcon(p.icon, p.color, active?.id === p.id)}
              eventHandlers={{ click: () => setActive(p) }}
            />
          ))}
        </MapContainer>

        {/* Hint when nothing is selected */}
        {!active && (
          <div className="citymap-hint">
            👆 Klik op een marker om een probleem te bekijken
          </div>
        )}

        {/* Side panel */}
        {active && (
          <aside className="citymap-panel" style={{ '--panel-color': active.color } as React.CSSProperties}>
            <button className="citymap-panel-close" onClick={() => setActive(null)}>
              ✕
            </button>
            <div className="citymap-panel-icon" style={{ background: active.color }}>
              {active.icon}
            </div>
            <h2 className="citymap-panel-title">{active.title}</h2>
            <p className="citymap-panel-subtitle">{active.subtitle}</p>
            <p className="citymap-panel-teaser">{active.teaser}</p>
            <button
              className="citymap-panel-cta"
              style={{ background: active.color }}
              onClick={() => onSelectProblem(active)}
            >
              Ik wil dit probleem verkennen →
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}
