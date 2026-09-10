## Context

Proyecto nuevo en carpeta vacía (`daily-goals/` solo contiene `openspec/`). Ver `proposal.md` para el porqué. Restricciones: deploy en Vercel desde GitHub, backend Supabase dedicado (proyecto `occginpuogqcmeuthxca`, región us-east-1), alarma sin assets externos, timer exacto en segundo plano.

## Goals / Non-Goals

- Goals: scaffolding Next.js listo para Vercel; esquema `goals` + `goal_daily_logs` con RLS; checklist diario sin cronjobs; focus timer exacto + alarma Web Audio; insights (racha, historial, detalle).
- Non-Goals: notificaciones push, modo offline PWA completo, multi-idioma, social/compartir, IA o recordatorios por email (futuras changes).

## Decisions

1. **Next.js App Router + TypeScript + Tailwind** sobre Vite SPA: integración cero-config con Vercel (build, previews por rama, env vars) y server components para Supabase SSR. Alternativa Vite: más simple pero sin SSR ni previews tan pulidas.
2. **Supabase (`@supabase/supabase-js` + `@supabase/ssr`) con Auth**: reutiliza el proyecto existente; tablas nuevas `goals` y `goal_daily_logs` con `user_id uuid REFERENCES auth.users`. RLS: políticas `USING (auth.uid() = user_id)` en SELECT/INSERT/UPDATE/DELETE. Alternativa local-first IndexedDB: descartada porque el usuario pidió Supabase + nube.
3. **Reseteo natural por fecha (sin cron)**: el checklist es una derivación `vigentes(hoy) LEFT JOIN logs(hoy)`; si no hay log, checkbox pendiente. Sin jobs a medianoche, sin estados que "desmarcar". Zona horaria: guardar `log_date DATE` en tiempo local del cliente (formato `YYYY-MM-DD`) para evitar desfases UTC.
4. **Timer por `targetTimestamp = Date.now() + restante` + `requestAnimationFrame`/intervalo de 250ms recalculando**: exacto ante throttling de pestañas. Estado de sesión en memoria + persistencia de segundos al pausar/terminar. Alternativa `setInterval` restando 1s: descartada por deriva en segundo plano.
5. **Alarma con Web Audio API (oscilador)**: secuencia de 3 beeps sintetizados, sin `.mp3`, sin CORS ni cargas de red. Fallback: `navigator.vibrate` en móvil. Requiere gesto de usuario previo (el botón iniciar) para cumplir autoplay policies.
6. **Anillo SVG con `stroke-dashoffset`** para progreso del timer y del día; heatmap con CSS grid para historial. Sin librerías de charts en MVP (menos peso); Recharts solo si insights avanzados lo piden.

## Risks / Trade-offs

- [RLS mal configurado bloquea la app] → Mitigación: migración aplica políticas junto con las tablas; verificar con `supabase_get_advisors` tras migrar.
- [Autoplay policy silencia la alarma si no hubo interacción] → Mitigación: el timer siempre arranca con click; crear el `AudioContext` en ese gesto.
- [Zona horaria del usuario vs servidor] → Mitigación: `log_date` lo genera el cliente en hora local; documentado en spec.
- [Proyecto Supabase compartido con otras tablas sin RLS] → Mitigación: no tocar tablas existentes; solo crear las dos nuevas con RLS desde el inicio. (Nota: migrado a proyecto dedicado `occginpuogqcmeuthxca`, riesgo eliminado.)

## Migration Plan

1. Aplicar migración SQL (`goals`, `goal_daily_logs`, índices, RLS + policies) vía `supabase_apply_migration`.
2. Scaffold Next.js + env vars; `npm run build` en local debe pasar.
3. Push a GitHub, conectar repo en Vercel, setear `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Rollback: archivar change en OpenSpec; revertir migración solo si no hay datos (DROP TABLE), o dejar tablas inactivas.

## Open Questions

- Ninguna bloqueante. Detalle a confirmar durante implementación: Auth ¿solo email-magic-link o también Google? (default: email + anónimo local hasta login).
