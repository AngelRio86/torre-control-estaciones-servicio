import { ALERTAS, getCategoria } from '../data/stations';

function ImpBar({ value, hex }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border)' }}>
        <div className="h-1 rounded-full" style={{ width: `${value}%`, background: hex }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: hex, minWidth: '22px', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function Sidebar({ stations, selectedId, onSelect }) {
  const sorted = [...stations].sort((a, b) => b.imp - a.imp);
  const alertaColors = {
    critica:     { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '⚠' },
    oportunidad: { bg: '#F0FDF4', border: '#6EE7B7', text: '#065F46', icon: '★' },
    atencion:    { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', icon: '●' },
  };

  return (
    <aside className="flex flex-col shrink-0 overflow-hidden border-r" style={{ width: '272px', background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--accent)' }}>P</div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Petronor · Bizkaia</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Ranking */}
        <div className="px-4 pt-4 pb-2">
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
            Ranking IMP
          </div>
          <div className="flex flex-col gap-0.5">
            {sorted.map((st, i) => {
              const cat = getCategoria(st.imp);
              const isSelected = st.id === selectedId;
              return (
                <button key={st.id} onClick={() => onSelect(st.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    background: isSelected ? '#FFF1F2' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(192,0,26,0.25)' : 'transparent'}`,
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-dim)', minWidth: '18px' }}>{String(i+1).padStart(2,'0')}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium truncate" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-head)' }}>
                          {st.nombre.replace('Petronor ','')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded border shrink-0" style={{ fontSize: '9px', color: cat.hex, borderColor: cat.hex + '40', background: cat.hex + '10' }}>
                          {cat.label}
                        </span>
                      </div>
                      <ImpBar value={st.imp} hex={cat.hex} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-4 my-3 border-t" style={{ borderColor: 'var(--border)' }} />

        {/* Alertas */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Alertas Activas</div>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', fontFamily: 'JetBrains Mono, monospace' }}>
              {ALERTAS.filter(a => a.tipo === 'critica').length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {ALERTAS.map(a => {
              const c = alertaColors[a.tipo];
              const st = stations.find(s => s.id === a.estacion_id);
              return (
                <div key={a.id} onClick={() => onSelect(a.estacion_id)}
                  className="px-3 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-75"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <div className="flex items-start gap-2">
                    <span style={{ color: c.text, fontSize: '11px', marginTop: '1px' }}>{c.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium" style={{ color: c.text }}>{a.titulo}</div>
                      <div className="text-xs mt-0.5" style={{ color: c.text, opacity: 0.7 }}>{st?.municipio}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg)', fontSize: '10px' }}>
        <div>Forecourt Transition Intelligence</div>
        <div style={{ color: 'var(--muted)', marginTop: '1px' }}>v1.0 · Piloto Bizkaia 2026</div>
      </div>
    </aside>
  );
}
