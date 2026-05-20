import { ALERTAS, getCategoria } from '../data/stations';

function ImpBar({ value, color }) {
  const colorMap = {
    green: 'var(--green)',
    yellow: 'var(--yellow)',
    red: 'var(--red)',
  };
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--muted)' }}>
        <div
          className="h-1 rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: colorMap[color] }}
        />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: colorMap[color] }}>
        {value}
      </span>
    </div>
  );
}

export default function Sidebar({ stations, selectedId, onSelect }) {
  const sorted = [...stations].sort((a, b) => b.imp - a.imp);

  const alertasCriticas = ALERTAS.filter(a => a.tipo === 'critica');
  const alertasOportunidad = ALERTAS.filter(a => a.tipo === 'oportunidad');
  const alertasAtencion = ALERTAS.filter(a => a.tipo === 'atencion');

  const alertaColors = {
    critica: { bg: 'var(--red-soft)', border: 'rgba(239,68,68,0.3)', text: 'var(--red)', icon: '⚠' },
    oportunidad: { bg: 'var(--green-soft)', border: 'rgba(16,185,129,0.3)', text: 'var(--green)', icon: '★' },
    atencion: { bg: 'var(--yellow-soft)', border: 'rgba(245,158,11,0.3)', text: 'var(--yellow)', icon: '●' },
  };

  return (
    <aside
      className="flex flex-col shrink-0 overflow-hidden border-r"
      style={{
        width: '280px',
        background: 'var(--panel)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo strip */}
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'var(--accent)' }}
        >
          P
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
            PETRONOR · BIZKAIA
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* IMP Ranking */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.12em' }}
          >
            Ranking IMP
          </div>

          <div className="flex flex-col gap-1">
            {sorted.map((st, i) => {
              const cat = getCategoria(st.imp);
              const isSelected = st.id === selectedId;
              return (
                <button
                  key={st.id}
                  onClick={() => onSelect(st.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group"
                  style={{
                    background: isSelected ? 'var(--accent-glow)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-dim)', minWidth: '16px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="text-xs font-medium truncate"
                          style={{ color: isSelected ? 'var(--text-bright)' : 'var(--text-base)' }}
                        >
                          {st.nombre.replace('Petronor ', '')}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded border shrink-0"
                          style={{
                            fontSize: '9px',
                            background: cat.color === 'green' ? 'var(--green-soft)' : cat.color === 'yellow' ? 'var(--yellow-soft)' : 'var(--red-soft)',
                            color: cat.color === 'green' ? 'var(--green)' : cat.color === 'yellow' ? 'var(--yellow)' : 'var(--red)',
                            borderColor: cat.color === 'green' ? 'rgba(16,185,129,0.3)' : cat.color === 'yellow' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
                          }}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <ImpBar value={st.imp} color={cat.color} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 my-3 border-t" style={{ borderColor: 'var(--border)' }} />

        {/* Alertas Activas */}
        <div className="px-4 pb-4">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.12em' }}
          >
            Alertas Activas
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: 'var(--red-soft)', color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
            >
              {alertasCriticas.length}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {ALERTAS.map(alerta => {
              const c = alertaColors[alerta.tipo];
              const st = stations.find(s => s.id === alerta.estacion_id);
              return (
                <div
                  key={alerta.id}
                  className="px-3 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  onClick={() => onSelect(alerta.estacion_id)}
                >
                  <div className="flex items-start gap-2">
                    <span style={{ color: c.text, fontSize: '11px', marginTop: '1px' }}>{c.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: 'var(--text-base)' }}>
                        {alerta.titulo}
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-dim)' }}>
                        {st?.municipio}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}
      >
        <div>Forecourt Transition Intelligence</div>
        <div style={{ color: 'var(--muted)', marginTop: '2px' }}>v1.0 · Piloto Bizkaia 2026</div>
      </div>
    </aside>
  );
}
