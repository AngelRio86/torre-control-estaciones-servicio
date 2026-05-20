# Torre de Control · EESS Petronor Bizkaia

Dashboard BI interactivo — Forecourt Transition Intelligence Platform  
Piloto: 8 estaciones · Índice Maestro de Priorización (IMP)

---

## Despliegue rápido (< 5 min)

### 1 — Subir a GitHub

```bash
git init
git add .
git commit -m "Torre de Control EESS — Petronor Bizkaia v1"

# Crea el repo en github.com, luego:
git remote add origin https://github.com/TU_USUARIO/torre-control-eess.git
git branch -M main
git push -u origin main
```

### 2 — Desplegar en Vercel

**Desde la web (recomendado):**
1. vercel.com → "Add New Project"
2. Import el repo `torre-control-eess`
3. Framework: Vite (auto-detectado)
4. Deploy → URL pública en ~30s

**Desde terminal:**
```bash
npm i -g vercel && vercel --prod
```

---

## Desarrollo local

```bash
npm install
npm run dev   # → localhost:5173
```

---

## Estructura

```
src/
├── data/stations.js    ← Datos de las 8 EESS, alertas, escenarios
├── components/
│   ├── Sidebar.jsx      ← Ranking IMP + Alertas
│   ├── MapView.jsx      ← Mapa Leaflet
│   └── StationDetail.jsx← Cockpit por estación
└── App.jsx
```

| ID | Estación | IMP | Categoría |
|----|----------|-----|-----------|
| BIZ-001 | Gran Vía Bilbao | 82 | ★ Estrella |
| BIZ-002 | Basauri Refinería | 91 | ★ Estrella |
| BIZ-003 | Barakaldo | 67 | ◆ Sólida |
| BIZ-004 | Getxo Algorta | 78 | ★ Estrella |
| BIZ-005 | Erandio | 58 | ● Estable |
| BIZ-006 | Sestao | 44 | ▲ Vulnerable |
| BIZ-007 | Santurtzi | 36 | ▲ Vulnerable |
| BIZ-008 | Leioa Campus | 63 | ◆ Sólida |
