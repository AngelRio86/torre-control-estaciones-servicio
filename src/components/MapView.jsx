import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCategoria } from '../data/stations';

function createIcon(hex, isSelected) {
  const size = isSelected ? 44 : 36;
  const inner = isSelected ? 13 : 9;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="position:absolute;inset:0;background:${hex};border-radius:50%;opacity:0.18;animation:pulse-ring 2.5s infinite;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${inner+6}px;height:${inner+6}px;background:${hex};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.25);"></div>
    </div>`,
  });
}

export default function MapView({ stations, selectedId, onSelect }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (leafletMap.current) return;
    leafletMap.current = L.map(mapRef.current, { center:[43.29,-2.96], zoom:11, scrollWheelZoom:true, zoomControl:false, attributionControl:false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains:'abcd', maxZoom:19 }).addTo(leafletMap.current);
    L.control.zoom({ position:'bottomright' }).addTo(leafletMap.current);

    stations.forEach(st => {
      const cat = getCategoria(st.imp);
      const marker = L.marker([st.lat, st.lng], { icon: createIcon(cat.hex, false), zIndexOffset: st.imp });
      marker.bindPopup(`
        <div style="font-family:DM Sans,sans-serif;min-width:210px;">
          <div style="font-size:10px;color:#9CA3AF;font-family:JetBrains Mono,monospace;margin-bottom:3px;">${st.id}</div>
          <div style="font-weight:700;font-size:14px;color:#111827;margin-bottom:3px;">${st.nombre}</div>
          <div style="font-size:12px;color:#6B7280;margin-bottom:10px;">${st.municipio} · ${st.barrio}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:13px;color:${cat.hex};font-weight:700;font-family:JetBrains Mono,monospace;">IMP ${st.imp}</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${cat.hex}18;color:${cat.hex};border:1px solid ${cat.hex}40;">${cat.label}</span>
          </div>
          <button onclick="window._sel('${st.id}')" style="width:100%;padding:7px;background:#C0001A;color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif;">
            Abrir Cockpit →
          </button>
        </div>
      `, { maxWidth:260 });
      marker.addTo(leafletMap.current);
      markersRef.current[st.id] = marker;
    });
    window._sel = id => { leafletMap.current.closePopup(); onSelect(id); };
    return () => { delete window._sel; };
  }, []);

  useEffect(() => {
    stations.forEach(st => {
      const m = markersRef.current[st.id];
      if (!m) return;
      m.setIcon(createIcon(getCategoria(st.imp).hex, st.id === selectedId));
    });
    if (selectedId && markersRef.current[selectedId]) {
      const st = stations.find(s => s.id === selectedId);
      leafletMap.current?.setView([st.lat, st.lng], 13, { animate:true });
    }
  }, [selectedId]);

  const total_cap = stations.reduce((a,b) => a + b.kpi.capex_recomendado_eur, 0);
  const total_ebi = stations.reduce((a,b) => a + b.kpi.ebitda_uplift_eur_year, 0);
  const imp_medio = Math.round(stations.reduce((a,b) => a + b.imp, 0) / stations.length);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ width:'100%', height:'100%' }} />

      {/* Legend */}
      <div className="absolute bottom-6 left-4 rounded-xl px-4 py-3 text-xs z-[1000]" style={{ background:'rgba(255,255,255,0.95)', border:'1px solid var(--border)', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:'10px', color:'var(--text-dim)', fontFamily:'JetBrains Mono, monospace', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>IMP · Índice Maestro</div>
        {[{ hex:'#059669', l:'★ Estrella / Sólida', r:'≥ 60' },{ hex:'#D97706', l:'● Estable', r:'45–59' },{ hex:'#DC2626', l:'▲ Vulnerable / Crítica', r:'< 45' }].map(({ hex, l, r }) => (
          <div key={l} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ background:hex }} />
            <span style={{ color:'var(--text-base)' }}>{l}</span>
            <span style={{ color:'var(--text-dim)', fontFamily:'JetBrains Mono, monospace' }}>{r}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 rounded-xl px-4 py-3 z-[1000]" style={{ background:'rgba(255,255,255,0.95)', border:'1px solid var(--border)', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:'10px', color:'var(--text-dim)', fontFamily:'JetBrains Mono, monospace', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Resumen Portafolio</div>
        {[{ l:'Estaciones', v:stations.length },{ l:'IMP Medio', v:imp_medio },{ l:'Capex Total Rec.', v:`€${(total_cap/1e6).toFixed(1)}M` },{ l:'EBITDA Uplift/año', v:`€${Math.round(total_ebi/1e3)}K` }].map(({ l, v }) => (
          <div key={l} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
            <span style={{ fontSize:'12px', color:'var(--text-sub)' }}>{l}</span>
            <span style={{ fontSize:'12px', fontFamily:'JetBrains Mono, monospace', fontWeight:700, color:'var(--text-head)' }}>{v}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 right-4 px-3 py-1.5 rounded-lg z-[1000]" style={{ background:'rgba(255,255,255,0.9)', border:'1px solid var(--border)', fontSize:'11px', color:'var(--text-dim)' }}>
        Clic en un marcador para ver el cockpit
      </div>
    </div>
  );
}
