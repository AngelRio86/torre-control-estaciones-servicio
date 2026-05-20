import { useState, useEffect } from 'react';
import { getCategoria, ALERTAS, ESCENARIOS } from '../data/stations';

function ScoreCard({ label, value, max = 100, sublabel }) {
  const pct = (value / max) * 100;
  const color = pct >= 70 ? 'var(--green)' : pct >= 45 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </div>
      <div className="flex items-end justify-between mb-2">
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>/100</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
        <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
      {sublabel && <div className="text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>{sublabel}</div>}
    </div>
  );
}

function KpiCard({ label, value, delta, accent }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', color: accent || 'var(--text-bright)', lineHeight: 1 }}>{value}</div>
      {delta && <div className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{delta}</div>}
    </div>
  );
}

function RadarChart({ scores }) {
  const axes = [
    { key: 'defensa_combustible', label: 'Fuel' },
    { key: 'potencial_ev', label: 'EV Hub' },
    { key: 'conveniencia_retail', label: 'Retail' },
    { key: 'flota_comercial', label: 'Flota' },
    { key: 'opcionalidad_inmobiliaria', label: 'Inm.' },
    { key: 'fortaleza_competitiva', label: 'Moat' },
  ];
  const n = axes.length;
  const CX = 120, CY = 120, R = 90;
  const angle = i => (Math.PI * 2 * i / n) - Math.PI / 2;

  const rings = [0.25, 0.5, 0.75, 1];
  const ringPoints = rings.map(r =>
    axes.map((_, i) => [CX + Math.cos(angle(i)) * R * r, CY + Math.sin(angle(i)) * R * r])
  );

  const dataPoints = axes.map((ax, i) => {
    const val = (scores[ax.key] || 0) / 100;
    return [CX + Math.cos(angle(i)) * R * val, CY + Math.sin(angle(i)) * R * val];
  });

  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      {/* Rings */}
      {ringPoints.map((pts, ri) => (
        <polygon key={ri} points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {axes.map((_, i) => (
        <line key={i} x1={CX} y1={CY} x2={CX + Math.cos(angle(i)) * R} y2={CY + Math.sin(angle(i)) * R} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {/* Data polygon */}
      <polygon points={dataPoints.map(p => p.join(',')).join(' ')} fill="rgba(192,0,26,0.2)" stroke="#C0001A" strokeWidth="2" />
      {/* Data dots */}
      {dataPoints.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#C0001A" />)}
      {/* Labels */}
      {axes.map((ax, i) => {
        const lx = CX + Math.cos(angle(i)) * (R + 16);
        const ly = CY + Math.sin(angle(i)) * (R + 16);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}

function ScenarioPanel({ stationId }) {
  const scenarios = ESCENARIOS[stationId];
  const [active, setActive] = useState(scenarios ? scenarios.findIndex(s => s.tag === 'Recomendado') : 0);
  if (!scenarios) return (
    <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
      Escenarios disponibles en la versión completa del piloto.
    </div>
  );

  const sc = scenarios[active];
  const fmtEur = n => n ? `€${Math.round(n / 1000)}K` : '€0';
  const prioColor = { alta: 'var(--green)', media: 'var(--yellow)', baja: 'var(--text-dim)', no: 'var(--red)' };

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
      <div className="flex flex-col gap-1.5">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="text-left px-3 py-2.5 rounded-lg transition-all"
            style={{
              background: i === active ? 'rgba(192,0,26,0.12)' : 'var(--panel)',
              border: `1px solid ${i === active ? 'rgba(192,0,26,0.4)' : 'var(--border)'}`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-base)' }}>{s.nombre}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{s.tag}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono" style={{ color: 'var(--text-base)', fontFamily: 'JetBrains Mono, monospace' }}>{fmtEur(s.capex)}</div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: prioColor[s.prioridad], marginLeft: 'auto', marginTop: '4px' }} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '16px', color: 'var(--text-bright)', marginBottom: '12px' }}>{sc.nombre}</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { l: 'CAPEX', v: fmtEur(sc.capex), c: 'var(--text-bright)' },
            { l: 'EBITDA Δ/año', v: sc.ebitda ? `+${fmtEur(sc.ebitda)}` : '€0', c: 'var(--green)' },
            { l: 'Payback', v: sc.payback, c: 'var(--text-bright)' },
            { l: 'Prioridad', v: sc.prioridad.charAt(0).toUpperCase() + sc.prioridad.slice(1), c: prioColor[sc.prioridad] },
          ].map(({ l, v, c }) => (
            <div key={l} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-xs uppercase" style={{ color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', letterSpacing: '0.08em' }}>{l}</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '18px', color: c, marginTop: '2px', lineHeight: 1 }}>{v}</div>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>{sc.racional}</p>
      </div>
    </div>
  );
}

export default function StationDetail({ station, onBack }) {
  if (!station) return null;

  const cat = getCategoria(station.imp);
  const alerts = ALERTAS.filter(a => a.estacion_id === station.id);
  const alertColors = { critica: 'var(--red)', oportunidad: 'var(--green)', atencion: 'var(--yellow)' };
  const alertBg = { critica: 'var(--red-soft)', oportunidad: 'var(--green-soft)', atencion: 'var(--yellow-soft)' };
  const alertBorder = { critica: 'rgba(239,68,68,0.3)', oportunidad: 'rgba(16,185,129,0.3)', atencion: 'rgba(245,158,11,0.3)' };

  const scoreLabels = {
    defensa_combustible: 'Defensa Combustible',
    potencial_ev: 'Potencial EV Hub',
    conveniencia_retail: 'Convenience Retail',
    flota_comercial: 'Flota & Comercial',
    opcionalidad_inmobiliaria: 'Opcionalidad Inm.',
    fortaleza_competitiva: 'Fortaleza Competitiva',
  };

  const catColorHex = cat.color === 'green' ? 'var(--green)' : cat.color === 'yellow' ? 'var(--yellow)' : 'var(--red)';
  const fmtEur = n => `€${(n / 1000).toFixed(0)}K`;

  return (
    <div className="h-full overflow-y-auto fade-up" style={{ background: 'var(--ink)' }}>
      <div className="max-w-6xl mx-auto px-6 py-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-dim)' }}>{station.id}</span>
              <span className="px-2 py-0.5 rounded-full text-xs border" style={{ color: catColorHex, borderColor: catColorHex + '50', background: catColorHex + '15', fontSize: '11px' }}>
                {cat.label}
              </span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--panel)', color: 'var(--text-dim)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                {station.marca}
              </span>
            </div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', color: 'var(--text-bright)', lineHeight: 1.1, marginBottom: '4px' }}>
              {station.nombre}
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{station.direccion}</p>
          </div>

          <div className="text-right shrink-0">
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '52px', color: catColorHex, lineHeight: 1 }}>{station.imp}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>IMP / 100</div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <KpiCard label="CAPEX Recomendado" value={fmtEur(station.kpi.capex_recomendado_eur)} delta={`Prioridad ${station.kpi.prioridad}`} />
          <KpiCard label="EBITDA Uplift / Año" value={`+${fmtEur(station.kpi.ebitda_uplift_eur_year)}`} delta="est. a partir año 2" accent="var(--green)" />
          <KpiCard label="Payback Estimado" value={`${station.kpi.payback_anos}a`} delta="sobre capex total" />
          <KpiCard label="Footfall Diario" value={station.kpi.footfall_diario.toLocaleString('es-ES')} delta={`${station.kpi.dwell_time_min} min dwell pot.`} />
        </div>

        {/* Two columns: radar + scores */}
        <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: '220px 1fr' }}>
          {/* Radar */}
          <div className="rounded-xl p-4 flex flex-col items-center" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
              Perfil Estratégico
            </div>
            <RadarChart scores={station.scores} />
          </div>

          {/* Score cards */}
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {Object.entries(station.scores).map(([key, value]) => (
              <ScoreCard key={key} label={scoreLabels[key]} value={value} />
            ))}
          </div>
        </div>

        {/* Market data + Alerts */}
        <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>

          {/* Market intel */}
          <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
              Datos de Mercado
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {[
                { l: 'Población 1km', v: station.mercado.poblacion_1km.toLocaleString('es-ES') },
                { l: 'Renta Media', v: `€${station.mercado.renta_media_eur.toLocaleString('es-ES')}` },
                { l: 'Penetración BEV', v: `${station.mercado.vehiculos_bev_pct}%` },
                { l: 'Competencia Fuel 1km', v: `${station.mercado.competencia_fuel_1km} EESS` },
                { l: 'Cargadores EV 1km', v: `${station.mercado.cargadores_ev_1km} pts.` },
                { l: 'Ratio EV/Cargador', v: `×${station.mercado.ratio_ev_cargador}` },
                { l: 'Rating Google', v: `★ ${station.mercado.rating_google}` },
                { l: 'Índice Reputación', v: `${station.mercado.reputacion_index}/100` },
              ].map(({ l, v }) => (
                <div key={l} className="py-1.5 border-b flex justify-between" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{l}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-bright)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Precios */}
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs uppercase mb-2" style={{ color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', letterSpacing: '0.1em' }}>Precios Actuales</div>
              <div className="flex gap-3">
                {[
                  { l: 'G95', v: station.precios.g95 },
                  { l: 'G98', v: station.precios.g98 },
                  { l: 'Diésel', v: station.precios.diesel_a },
                ].map(({ l, v }) => (
                  <div key={l} className="flex-1 text-center rounded-lg py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{l}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-bright)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>€{v.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts + Reco */}
          <div className="flex flex-col gap-3">
            {/* Active alerts */}
            {alerts.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
                  Alertas Activas
                </div>
                <div className="flex flex-col gap-2">
                  {alerts.map(a => (
                    <div key={a.id} className="rounded-lg px-3 py-2.5" style={{ background: alertBg[a.tipo], border: `1px solid ${alertBorder[a.tipo]}` }}>
                      <div className="flex items-start gap-2">
                        <span style={{ color: alertColors[a.tipo], fontSize: '12px' }}>{a.tipo === 'critica' ? '⚠' : a.tipo === 'oportunidad' ? '★' : '●'}</span>
                        <div>
                          <div className="text-xs font-semibold" style={{ color: 'var(--text-base)' }}>{a.titulo}</div>
                          <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-dim)' }}>{a.descripcion}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(192,0,26,0.06)', border: '1px solid rgba(192,0,26,0.25)' }}>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--accent)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
                Plan de Acción Recomendado
              </div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '15px', color: 'var(--text-bright)', marginBottom: '8px' }}>
                {station.recomendacion.arquetipo}
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-dim)' }}>
                {station.recomendacion.resumen}
              </p>
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--yellow)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Riesgos Clave</div>
                  {station.recomendacion.riesgos.map((r, i) => (
                    <div key={i} className="text-xs mb-1 flex items-start gap-1.5" style={{ color: 'var(--text-dim)' }}>
                      <span style={{ color: 'var(--yellow)', marginTop: '2px' }}>▲</span>{r}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--red)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>No Hacer</div>
                  {station.recomendacion.no_hacer.map((r, i) => (
                    <div key={i} className="text-xs mb-1 flex items-start gap-1.5" style={{ color: 'var(--text-dim)' }}>
                      <span style={{ color: 'var(--red)', marginTop: '2px' }}>✕</span>{r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios */}
        <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
            Simulador de Escenarios
          </div>
          <ScenarioPanel stationId={station.id} />
        </div>

        {/* Asset data */}
        <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
            Datos del Activo
          </div>
          <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { l: 'Superficie', v: `${station.activo.superficie_m2.toLocaleString('es-ES')} m²` },
              { l: 'Islas', v: station.activo.islas },
              { l: 'Surtidores', v: station.activo.surtidores },
              { l: 'Tienda', v: `${station.activo.tienda_m2} m²` },
              { l: 'Parking', v: `${station.activo.parking} plazas` },
              { l: 'Potencia actual', v: `${station.activo.potencia_kva} kVA` },
              { l: 'Potencia expandible', v: `${station.activo.potencia_expandible_kva} kVA` },
              { l: 'ZBE', v: station.zbe },
            ].map(({ l, v }) => (
              <div key={l} className="py-1.5 border-b flex justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{l}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-bright)', fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {station.servicios.map(s => (
              <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-base)', border: '1px solid var(--border)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
