import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import StationDetail from './components/StationDetail';
import { STATIONS } from './data/stations';

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('map');

  const selected = STATIONS.find(s => s.id === selectedId);

  const handleSelectStation = (id) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleBack = () => {
    setView('map');
    setSelectedId(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{background:'var(--ink)'}}>
      <Sidebar stations={STATIONS} selectedId={selectedId} onSelect={handleSelectStation} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{background:'var(--panel)',borderColor:'var(--border)'}}>
          <div className="flex items-center gap-3">
            {view === 'detail' && (
              <button onClick={handleBack} className="flex items-center gap-1.5 text-xs mr-2 transition-colors hover:opacity-80" style={{color:'var(--text-dim)'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Volver
              </button>
            )}
            <span className="w-2 h-2 rounded-full animate-pulse" style={{background:'var(--accent)'}} />
            <span style={{fontFamily:'DM Serif Display, serif', color:'var(--text-bright)', fontSize:'15px', letterSpacing:'0.02em'}}>
              Torre de Control · Estaciones de Servicio Petronor Bizkaia
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{color:'var(--text-dim)'}}>
            <span style={{fontFamily:'JetBrains Mono, monospace'}}>PILOTO BIZKAIA · 8 EESS</span>
            <span className="px-2 py-0.5 rounded text-xs" style={{background:'var(--muted)',color:'var(--text-base)',fontFamily:'JetBrains Mono, monospace'}}>
              {new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          {view === 'map'
            ? <MapView stations={STATIONS} selectedId={selectedId} onSelect={handleSelectStation} />
            : <StationDetail station={selected} onBack={handleBack} />
          }
        </div>
      </div>
    </div>
  );
}
