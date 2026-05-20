import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCategoria } from '../data/stations';

// Marker colors by category
function getMarkerColor(imp) {
  const cat = getCategoria(imp);
  if (cat.color === 'green') return '#10B981';
  if (cat.color === 'yellow') return '#F59E0B';
  return '#EF4444';
}

function createIcon(color, isSelected) {
  const size = isSelected ? 44 : 36;
  const inner = isSelected ? 14 : 10;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="position:absolute;inset:0;background:${color};border-radius:50%;opacity:0.2;animation:pulse-ring 2.5s infinite;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${inner + 6}px;height:${inner + 6}px;background:${color};border:2.5px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.7)'};border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.5);"></div>
    </div>`,
  });
}

export default function MapView({ stations, selectedId, onSelect }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current, {
      center: [43.29, -2.96],
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(leafletMap.current);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    stations.forEach(st => {
      const color = getMarkerColor(st.imp);
      const cat = getCategoria(st.imp);
      const marker = L.marker([st.lat, st.lng], {
        icon: createIcon(color, false),
        zIndexOffset: st.imp,
      });

      marker.bindPopup(`
        <div style="font-family:DM Sans,sans-serif;min-width:200px;">
          <div style="font-size:11px;color:var(--text-dim);font-family:JetBrains Mono,monospace;margin-bottom:4px;">${st.id}</div>
          <div style="font-weight:600;font-size:14px;color:var(--text-bright);margin-bottom:4px;">${st.nombre}</div>
          <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">${st.municipio} · ${st.barrio}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:12px;color:${color};font-weight:600;">IMP ${st.imp}/100</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${color}22;color:${color};">${cat.label}</span>
          </div>
          <div style="margin-top:10px;">
            <button onclick="window._selectStation('${st.id}')" style="width:100%;padding:7px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
              Ver Cockpit →
            </button>
          </div>
        </div>
      `, { maxWidth: 260 });

      marker.addTo(leafletMap.current);
      markersRef.current[st.id] = marker;
    });

    // Expose global handler for popup button
    window._selectStation = (id) => {
      leafletMap.current.closePopup();
      onSelect(id);
    };

    return () => {
      delete window._selectStation;
    };
  }, []);

  // Update markers when selectedId changes
  useEffect(() => {
    stations.forEach(st => {
      const marker = markersRef.current[st.id];
      if (!marker) return;
      const color = getMarkerColor(st.imp);
      marker.setIcon(createIcon(color, st.id === selectedId));
    });
    if (selectedId && markersRef.current[selectedId]) {
      const st = stations.find(s => s.id === selectedId);
      leafletMap.current?.setView([st.lat, st.lng], 13, { animate: true });
    }
  }, [selectedId]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div
        className="absolute bottom-6 left-4 rounded-xl px-4 py-3 text-xs z-[1000]"
        style={{ background: 'rgba(17,24,39,0.92)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
      >
        <div className="text-xs mb-2 font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
          IMP · Índice Maestro
        </div>
        {[
          { color: '#10B981', label: '★ Estrella / Sólida', range: '≥ 60' },
          { color: '#F59E0B', label: '● Estable', range: '45–59' },
          { color: '#EF4444', label: '▲ Vulnerable / Crítica', range: '< 45' },
        ].map(({ color, label, range }) => (
          <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span style={{ color: 'var(--text-base)' }}>{label}</span>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{range}</span>
          </div>
        ))}
      </div>

      {/* Stats overlay */}
      <div
        className="absolute top-4 right-4 rounded-xl px-4 py-3 text-xs z-[1000]"
        style={{ background: 'rgba(17,24,39,0.92)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
      >
        <div className="text-xs mb-2 font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
          Resumen Portafolio
        </div>
        {[
          { label: 'Estaciones', value: stations.length },
          { label: 'IMP Medio', value: Math.round(stations.reduce((a, b) => a + b.imp, 0) / stations.length) },
          { label: 'Capex Total Rec.', value: `€${(stations.reduce((a, b) => a + b.kpi.capex_recomendado_eur, 0) / 1e6).toFixed(1)}M` },
          { label: 'EBITDA Uplift/año', value: `€${(stations.reduce((a, b) => a + b.kpi.ebitda_uplift_eur_year, 0) / 1e3).toFixed(0)}K` },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <span style={{ color: 'var(--text-dim)' }}>{label}</span>
            <span style={{ color: 'var(--text-bright)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div
        className="absolute bottom-6 right-4 px-3 py-1.5 rounded-lg text-xs z-[1000]"
        style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}
      >
        Haz clic en un marcador para ver el cockpit
      </div>
    </div>
  );
}
