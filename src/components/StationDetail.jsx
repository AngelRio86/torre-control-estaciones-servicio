import { useState } from 'react';
import { getCategoria, ALERTAS, ESCENARIOS } from '../data/stations';

// ── helpers ────────────────────────────────────────────────────────────────────
const fmtEur  = n => `€${Number(n).toLocaleString('es-ES')}`;
const fmtEurK = n => `€${Math.round(n / 1000).toLocaleString('es-ES')}K`;
const fmtEurM = n => `€${(n / 1e6).toFixed(2)}M`;
const fmtPct  = n => `${n}%`;

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-soft)' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{label}</span>
      <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: accent || 'var(--text-head)' }}>{value}</span>
    </div>
  );
}

function LayerCard({ num, title, tag, tagColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const tagColors = {
    pending:  { bg: '#FEF3C7', text: '#92400E' },
    ine:      { bg: '#EFF6FF', text: '#1D4ED8' },
    google:   { bg: '#F0FDF4', text: '#166534' },
    catastro: { bg: '#F5F3FF', text: '#5B21B6' },
    kido:     { bg: '#FFF7ED', text: '#9A3412' },
    maps:     { bg: '#FFF1F2', text: '#9F1239' },
  };
  const tc = tagColors[tagColor] || tagColors.ine;
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-dim)', minWidth: '52px' }}>
            CAPA {String(num).padStart(2, '0')}
          </span>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '16px', color: 'var(--text-head)' }}>{title}</span>
          <span className="px-2 py-0.5 rounded text-xs" style={{ background: tc.bg, color: tc.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
            {tag}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-dim)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border-soft)' }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

function BarChart({ data, colorFn }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {data.map(({ label, value, suffix = '' }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-right shrink-0" style={{ fontSize: '11px', color: 'var(--text-sub)', width: '120px' }}>{label}</span>
          <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'var(--bg)' }}>
            <div className="h-5 rounded transition-all duration-700 flex items-center pl-2" style={{ width: `${(value / max) * 100}%`, background: colorFn ? colorFn(value) : 'var(--accent)', minWidth: '2px' }}>
              <span style={{ fontSize: '10px', color: 'white', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {value}{suffix}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScenarioPanel({ stationId }) {
  const scenarios = ESCENARIOS[stationId];
  const [active, setActive] = useState(scenarios ? scenarios.findIndex(s => s.tag === 'Recomendado') : 0);
  if (!scenarios) return (
    <p style={{ fontSize: '13px', color: 'var(--text-sub)', fontStyle: 'italic' }}>
      Simulador de escenarios disponible en la versión completa del piloto.
    </p>
  );
  const sc = scenarios[active < 0 ? 0 : active];
  const prioColor = { alta: '#059669', media: '#D97706', baja: '#9CA3AF', no: '#DC2626' };
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
      <div className="flex flex-col gap-1.5">
        {scenarios.map((s, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="text-left px-4 py-3 rounded-xl transition-all"
            style={{ background: i === active ? '#FFF1F2' : 'var(--bg)', border: `1px solid ${i === active ? 'rgba(192,0,26,0.3)' : 'var(--border)'}` }}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-head)' }}>{s.nombre}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>{s.tag}</div>
              </div>
              <div className="text-right shrink-0">
                <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-head)' }}>{s.capex ? fmtEurK(s.capex) : '€0'}</div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: prioColor[s.prioridad], marginLeft: 'auto', marginTop: '4px' }} />
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '16px', color: 'var(--text-head)', marginBottom: '14px' }}>{sc.nombre}</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { l: 'CAPEX', v: sc.capex ? fmtEurK(sc.capex) : '€0', c: 'var(--text-head)' },
            { l: 'EBITDA Δ/año', v: sc.ebitda ? `+${fmtEurK(sc.ebitda)}` : '€0', c: 'var(--green)' },
            { l: 'Payback', v: sc.payback, c: 'var(--text-head)' },
            { l: 'Prioridad', v: sc.prioridad.charAt(0).toUpperCase() + sc.prioridad.slice(1), c: prioColor[sc.prioridad] },
          ].map(({ l, v, c }) => (
            <div key={l} className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: c, marginTop: '2px' }}>{v}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: 1.6 }}>{sc.racional}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StationDetail({ station }) {
  if (!station) return null;
  const cat = getCategoria(station.imp);
  const alerts = ALERTAS.filter(a => a.estacion_id === station.id);
  const { c1, c2, c3, c4, c5, c6 } = {
    c1: station.capas.c1_interno,
    c2: station.capas.c2_demanda,
    c3: station.capas.c3_competencia,
    c4: station.capas.c4_activo,
    c5: station.capas.c5_kido,
    c6: station.capas.c6_reputacion,
  };
  const catHex = cat.hex;
  const alertStyle = { critica: ['#FEF2F2','#FCA5A5','#991B1B'], oportunidad: ['#F0FDF4','#6EE7B7','#065F46'], atencion: ['#FFFBEB','#FCD34D','#92400E'] };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 28px 48px' }}>

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-6 mb-6 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-dim)', background: 'var(--bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px' }}>{station.id}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs border font-medium" style={{ color: catHex, borderColor: catHex + '60', background: catHex + '12' }}>{cat.label}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{station.marca}</span>
            </div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--text-head)', marginBottom: '4px' }}>{station.nombre}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{station.direccion}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {station.servicios.map(s => (
                <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-sub)', fontSize: '11px' }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '56px', color: catHex, lineHeight: 1 }}>{station.imp}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>IMP · Índice Maestro</div>
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { l: 'CAPEX Recomendado', v: fmtEurK(station.kpi.capex_recomendado_eur), d: `Prioridad ${station.kpi.prioridad}`, c: 'var(--text-head)' },
            { l: 'EBITDA Uplift / Año', v: `+${fmtEurK(station.kpi.ebitda_uplift_eur_year)}`, d: 'est. a partir año 2', c: 'var(--green)' },
            { l: 'Payback Estimado', v: `${station.kpi.payback_anos}a`, d: 'sobre capex total', c: 'var(--text-head)' },
            { l: 'Footfall Diario', v: station.kpi.footfall_diario.toLocaleString('es-ES'), d: `${station.kpi.dwell_time_min} min dwell potencial`, c: 'var(--text-head)' },
          ].map(({ l, v, d, c }) => (
            <div key={l} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{l}</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{d}</div>
            </div>
          ))}
        </div>

        {/* ── ALERTS ── */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {alerts.map(a => {
              const [bg, border, text] = alertStyle[a.tipo];
              return (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
                  <span style={{ fontSize: '13px', color: text, marginTop: '1px' }}>{a.tipo === 'critica' ? '⚠' : a.tipo === 'oportunidad' ? '★' : '●'}</span>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: text }}>{a.titulo}</span>
                    <span style={{ fontSize: '12px', color: text, opacity: 0.8, marginLeft: '8px' }}>{a.descripcion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            6 CAPAS
        ══════════════════════════════════════════════════════ */}
        <div className="mb-2">
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
            Inteligencia Territorial — 6 Capas de Datos
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">

          {/* CAPA 01 — Datos internos */}
          <LayerCard num={1} title="Datos internos del negocio" tag="Operador" tagColor="pending" defaultOpen={true}>
            {c1.estado === 'estimado' && (
              <div className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: '#FFFBEB', border: '1px solid #FCD34D' }}>
                <span style={{ fontSize: '12px', color: '#92400E' }}>⚠</span>
                <span style={{ fontSize: '11px', color: '#92400E' }}>{c1.nota}</span>
              </div>
            )}
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>P&L Resumen</div>
                <Row label="Facturación anual" value={fmtEurM(c1.facturacion_anual_eur)} />
                <Row label="EBITDA" value={fmtEurK(c1.ebitda_eur)} accent="var(--green)" />
                <Row label="Margen EBITDA" value={fmtPct(c1.ebitda_margen_pct)} />
                <Row label="Volumen combustible/año" value={`${(c1.litros_ano / 1e6).toFixed(2)} M litros`} />
                <Row label="Margen combustible €/litro" value={`€${c1.margen_combustible_eur_litro.toFixed(3)}`} />
                <Row label="% tarjetas flota" value={fmtPct(c1.flota_cards_pct)} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Mix de Ingresos</div>
                <BarChart
                  data={Object.entries(c1.ingresos_pct).map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: v, suffix: '%' }))}
                  colorFn={v => v > 60 ? '#1D4ED8' : v > 15 ? '#059669' : '#D97706'}
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Row label="Conversión tienda" value={fmtPct(c1.conversion_tienda_pct)} />
                  <Row label="Ticket medio tienda" value={`€${c1.ticket_medio_tienda_eur}`} />
                </div>
              </div>
            </div>
          </LayerCard>

          {/* CAPA 02 — Demanda territorial */}
          <LayerCard num={2} title="Demanda territorial" tag="INE · DGT" tagColor="ine">
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Catchment 1 km</div>
                <Row label="Población" value={c2.poblacion_1km.toLocaleString('es-ES')} />
                <Row label="Hogares" value={c2.hogares_1km.toLocaleString('es-ES')} />
                <Row label="Edad media" value={`${c2.edad_media} años`} />
                <Row label="Renta media hogar" value={fmtEur(c2.renta_media_eur)} />
                <Row label="Vehículos por hogar" value={c2.vehiculos_hogar} />
                <Row label="% sin garaje" value={fmtPct(c2.pct_sin_garaje)} accent={c2.pct_sin_garaje > 55 ? 'var(--green)' : undefined} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Parque Vehicular</div>
                <BarChart
                  data={[
                    { label: '% BEV', value: c2.pct_bev, suffix: '%' },
                    { label: '% Diésel', value: c2.pct_diesel, suffix: '%' },
                    { label: '% Comerciales', value: c2.pct_comerciales, suffix: '%' },
                  ]}
                  colorFn={(v, i) => ['#059669', '#D97706', '#2563EB'][0]}
                />
                <div className="mt-3">
                  <Row label="Antigüedad media parque" value={`${c2.antiguedad_media_anos} años`} />
                  <Row label="% vivienda en bloque" value={fmtPct(c2.pct_vivienda_bloque)} />
                </div>
                <div className="mt-2" style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{c2.fuente}</div>
              </div>
            </div>
          </LayerCard>

          {/* CAPA 03 — Mapa competitivo */}
          <LayerCard num={3} title="Mapa competitivo" tag="Google Places" tagColor="google">
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Competencia Combustible</div>
                <Row label="EESS en 1 km" value={`${c3.fuel_1km} (${c3.fuel_lowcost} low-cost)`} />
                <Row label="Más cercano" value={`${c3.competidor_mas_cercano} (${c3.competidor_mas_cercano_m}m)`} />
                <Row label="G95 media competencia" value={`€${c3.g95_media_competencia.toFixed(3)}`} />
                <Row label="Gap precio vs. mínimo" value={`${c3.gap_precio_minimo > 0 ? '+' : ''}€${c3.gap_precio_minimo.toFixed(3)}`} accent={c3.gap_precio_minimo > 0 ? 'var(--yellow)' : 'var(--green)'} />
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Infraestructura EV</div>
                <Row label="Cargadores totales (1 km)" value={c3.ev_total_1km} />
                <Row label="HPC ≥ 150 kW" value={c3.ev_hpc_150kw} />
                <Row label="Rápidos 50-150 kW" value={c3.ev_fast_50kw} />
                <Row label="Ratio EV / cargador" value={`×${c3.ratio_ev_cargador}`} accent={c3.ratio_ev_cargador > 100 ? 'var(--accent)' : undefined} />
                <Row label="Gap HPC" value={c3.hpc_gap} />
                <Row label="Utilización media EV" value={fmtPct(c3.utilizacion_ev_pct)} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>POIs en 1 km</div>
                <BarChart
                  data={[
                    { label: 'Supermercados', value: c3.poi.supermercados },
                    { label: 'Cafés / QSR', value: c3.poi.cafes_qsr },
                    { label: 'Restaurantes', value: c3.poi.restaurantes },
                    { label: 'Hoteles', value: c3.poi.hoteles },
                    { label: 'Lockers', value: c3.poi.lockers },
                  ]}
                  colorFn={() => '#2563EB'}
                />
                <div className="mt-3">
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>Operadores EV</div>
                  <div className="flex flex-wrap gap-1">
                    {c3.operadores_ev.map(op => (
                      <span key={op} className="px-2 py-0.5 rounded text-xs" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '11px' }}>{op}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-2" style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{c3.fuente}</div>
              </div>
            </div>
          </LayerCard>

          {/* CAPA 04 — Activo y opcionalidad */}
          <LayerCard num={4} title="Activo y opcionalidad" tag="Catastro · Idealista" tagColor="catastro">
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Infraestructura Física</div>
                <Row label="Superficie total" value={`${c4.superficie_m2.toLocaleString('es-ES')} m²`} />
                <Row label="Islas / Surtidores" value={`${c4.islas} / ${c4.surtidores}`} />
                <Row label="Tienda" value={`${c4.tienda_m2} m²`} />
                <Row label="Parking" value={`${c4.parking} plazas`} />
                <Row label="Potencia actual" value={`${c4.potencia_kva} kVA`} />
                <Row label="Potencia expandible" value={`${c4.potencia_expandible_kva} kVA`} accent="var(--green)" />
                <Row label="Coste acometida est." value={fmtEurK(c4.coste_acometida_eur)} />
                <Row label="Capacidad expansión" value={c4.capacidad_expansion} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Valor del Activo</div>
                <Row label="Valor suelo €/m²" value={fmtEur(c4.valor_suelo_eur_m2)} />
                <Row label="Valor suelo total" value={fmtEurM(c4.valor_suelo_total_eur)} />
                <Row label="Valor operativo est." value={fmtEurM(c4.valor_operativo_eur)} />
                <Row label="Ratio suelo / operativo" value={`×${c4.ratio_suelo_operativo}`} accent={c4.ratio_suelo_operativo > 1.5 ? 'var(--accent)' : undefined} />
                <Row label="Score opcionalidad" value={`${c4.score_opcionalidad}/100`} accent={c4.score_opcionalidad > 60 ? 'var(--green)' : undefined} />
                <Row label="Renta retail €/m²/mes" value={`€${c4.renta_retail_eur_m2_mes}`} />
                <div className="mt-2" style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{c4.fuente}</div>
              </div>
            </div>
          </LayerCard>

          {/* CAPA 05 — Movilidad real */}
          <LayerCard num={5} title="Movilidad real" tag="Kido (sim.)" tagColor="kido">
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Footfall y Comportamiento</div>
                <Row label="Footfall diario estimado" value={c5.footfall_diario.toLocaleString('es-ES')} />
                <Row label="Dwell time potencial" value={`${c5.dwell_time_min} min`} />
                <Row label="Índice de fidelidad" value={c5.indice_fidelidad.toFixed(2)} />
                <Row label="Ratio real / censo" value={`×${c5.ratio_real_censo}`} />
                <Row label="Perfil dominante" value={c5.perfil_dominante} />
                {c5.pct_vehiculo_pesado && <Row label="% vehículo pesado" value={fmtPct(c5.pct_vehiculo_pesado)} />}
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px', lineHeight: 1.5 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>Método: </span>{c5.metodo}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Perfil de Visitantes (%)</div>
                <BarChart
                  data={Object.entries(c5.perfil_pct).map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: v, suffix: '%' }))}
                  colorFn={() => '#D97706'}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Patrón semanal</div>
                <div className="flex gap-3">
                  {Object.entries(c5.patron_semanal).map(([k, v]) => (
                    <div key={k} className="flex-1 text-center rounded-lg py-2" style={{ background: 'var(--bg)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{k}</div>
                      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '18px', color: 'var(--text-head)' }}>×{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </LayerCard>

          {/* CAPA 06 — Reputación */}
          <LayerCard num={6} title="Reputación de servicio" tag="Google Maps" tagColor="maps">
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Métricas Google Maps</div>
                <Row label="Rating estación" value={`★ ${c6.rating} (${c6.n_reseñas.toLocaleString('es-ES')})`} accent={c6.rating >= 4.0 ? 'var(--green)' : c6.rating >= 3.7 ? 'var(--yellow)' : 'var(--red)'} />
                <Row label="Rating competencia" value={`★ ${c6.rating_competencia} (${c6.n_reseñas_competencia.toLocaleString('es-ES')})`} />
                <Row label="Diferencial" value={c6.diferencial} accent={parseFloat(c6.diferencial) >= 0 ? 'var(--green)' : 'var(--red)'} />
                <Row label="Índice de reputación" value={`${c6.indice}/100`} accent={c6.indice >= 65 ? 'var(--green)' : c6.indice >= 50 ? 'var(--yellow)' : 'var(--red)'} />
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Sentimiento</div>
                <BarChart
                  data={[
                    { label: 'Positivo', value: c6.sentimiento_pct.positivo, suffix: '%' },
                    { label: 'Neutro', value: c6.sentimiento_pct.neutro, suffix: '%' },
                    { label: 'Negativo', value: c6.sentimiento_pct.negativo, suffix: '%' },
                  ]}
                  colorFn={(_, i) => ['#059669', '#D97706', '#DC2626'][i]}
                />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Temas Recurrentes</div>
                <div className="mb-3">
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green)', marginBottom: '6px' }}>✓ Positivos</div>
                  {c6.temas_positivos.map(t => (
                    <div key={t} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: 'var(--border-soft)', fontSize: '12px', color: 'var(--text-base)' }}>
                      <span style={{ color: 'var(--green)' }}>+</span>{t}
                    </div>
                  ))}
                </div>
                <div className="mb-3">
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--red)', marginBottom: '6px' }}>✗ Negativos</div>
                  {c6.temas_negativos.map(t => (
                    <div key={t} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: 'var(--border-soft)', fontSize: '12px', color: 'var(--text-base)' }}>
                      <span style={{ color: 'var(--red)' }}>−</span>{t}
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg" style={{ background: '#F8F7F4', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Key Insight</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-base)', lineHeight: 1.6, fontStyle: 'italic' }}>{c6.insight}</p>
                </div>
              </div>
            </div>
          </LayerCard>

        </div>
        {/* ══ END CAPAS ══ */}

        {/* ── SCORES + RADAR ── */}
        <div className="mb-6 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
            Scores Estratégicos · IMP por Dimensión
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { key: 'defensa_combustible', label: 'Defensa Combustible' },
              { key: 'potencial_ev', label: 'Potencial EV Hub' },
              { key: 'conveniencia_retail', label: 'Convenience Retail' },
              { key: 'flota_comercial', label: 'Flota & Comercial' },
              { key: 'opcionalidad_inmobiliaria', label: 'Opcionalidad Inmobiliaria' },
              { key: 'fortaleza_competitiva', label: 'Fortaleza Competitiva' },
            ].map(({ key, label }) => {
              const val = station.scores[key];
              const color = val >= 70 ? 'var(--green)' : val >= 45 ? 'var(--yellow)' : 'var(--red)';
              return (
                <div key={key} className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '30px', color, lineHeight: 1, marginBottom: '8px' }}>{val}</div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${val}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RECOMENDACIÓN ── */}
        <div className="mb-6 rounded-xl p-5" style={{ background: '#FFF8F8', border: '1px solid rgba(192,0,26,0.2)' }}>
          <div style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Plan de Acción Recomendado</div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '18px', color: 'var(--text-head)', marginBottom: '10px' }}>{station.recomendacion.arquetipo}</div>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.65, marginBottom: '16px' }}>{station.recomendacion.resumen}</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Riesgos Clave</div>
              {station.recomendacion.riesgos.map((r, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span style={{ color: 'var(--yellow)', fontSize: '12px', marginTop: '1px' }}>▲</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{r}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>No Hacer</div>
              {station.recomendacion.no_hacer.map((r, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span style={{ color: 'var(--red)', fontSize: '12px', marginTop: '1px' }}>✕</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ESCENARIOS ── */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>
            Simulador de Escenarios de Inversión
          </div>
          <ScenarioPanel stationId={station.id} />
        </div>

      </div>
    </div>
  );
}
