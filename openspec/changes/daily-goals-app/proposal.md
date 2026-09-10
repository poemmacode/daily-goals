## Why

El usuario necesita gamificar rutinas diarias sin reescribirlas cada día: definir cada objetivo una sola vez con un periodo de vigencia (1-2 meses) y hacer check diario con temporizador de enfoque, alarma al terminar y métricas de cumplimiento. Hoy no existe ninguna app propia que lo resuelva y hacerlo manual en papel/notas no da insights de progreso.

## What Changes

- Scaffolding Next.js (App Router) + TypeScript + Tailwind CSS en la carpeta actual, listo para deploy en Vercel vía GitHub.
- Integración con Supabase (Postgres + Auth anónima/email) con migraciones SQL versionadas.
- CRUD de objetivos (`goals`): título, categoría/color/icono, minutos asignados, `start_date`, `end_date`, días activos.
- Checklist diario auto-generado: filtra metas vigentes por fecha actual y crea/lee `daily_logs` del día; sin cronjobs, el "reseteo" es natural por fecha.
- Modo Focus: cronómetro decremental grande con anillo de progreso SVG, play/pausa/reinicio, cálculo por `Date.now()` (resistente a throttling) y alarma sintetizada con Web Audio API.
- Porcentaje de cumplimiento diario, rachas (streaks) e insights por objetivo (tiempo invertido vs planeado, tasa de éxito, heatmap).
- RLS habilitado en todas las tablas nuevas; variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` documentadas para Vercel.

## Capabilities

### New Capabilities
- `goals-management`: creación, edición, archivado y vigencia de objetivos recurrentes con tiempo asignado.
- `daily-checklist`: generación y completado del checklist del día, porcentaje de cumplimiento diario.
- `focus-timer`: sesión de enfoque por objetivo con countdown visual, persistencia de tiempo real y alarma de fin.
- `progress-insights`: rachas, historial de cumplimiento e insights por objetivo.

### Modified Capabilities
- Ninguna (proyecto nuevo, `openspec/specs/` está vacío).

## Impact

- Nuevo código: app Next.js completa en este repo (`app/`, `components/`, `lib/supabase/`).
- Nuevas tablas Supabase: `goals`, `goal_daily_logs` (+ RLS policies).
- Nuevas dependencias: `@supabase/supabase-js`, `@supabase/ssr`; dev: migraciones SQL.
- Sistemas afectados: solo el proyecto Supabase conectado (tablas nuevas, sin tocar `User`, `Job`, etc. existentes); deploy Vercel conectado a GitHub requiere 2 env vars.
