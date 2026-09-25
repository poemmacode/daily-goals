## Context

Proyecto en carpeta `daily-goals/` con app Next.js completa deployada en Vercel. Ver `proposal.md` para el porqué. Restricciones: deploy en Vercel desde GitHub, backend Supabase dedicado (proyecto `occginpuogqcmeuthxca`, región us-east-1), alarma sin assets externos, timer exacto en segundo plano, SEO optimizado para crawling.

## Goals / Non-Goals

- Goals: scaffolding Next.js listo para Vercel; esquema `goals` + `goal_daily_logs` + `profiles` + `seo_content` con RLS; checklist diario en `/today` sin cronjobs; focus timer exacto + alarma Web Audio; insights (racha, historial, detalle); landing page pública; SEO completo; CMS de contenido; AI coaching; analytics engine; feature gating; templates; cookie consent EU; about page bilingual.
- Non-Goals: notificaciones push, modo offline PWA completo, social/compartir, pagos con Stripe (mock/dev tier primero), multi-idioma completo (solo EN/ES en i18n context), autenticación con redes sociales (solo email + magic link).

## Decisions

1. **Next.js App Router + TypeScript + Tailwind** sobre Vite SPA: integración cero-config con Vercel (build, previews por rama, env vars) y server components para Supabase SSR. Alternativa Vite: más simple pero sin SSR ni previews tan pulidas.
2. **Supabase (`@supabase/supabase-js` + `@supabase/ssr`) con Auth**: reutiliza el proyecto existente; tablas nuevas `goals`, `goal_daily_logs`, `profiles`, `seo_content` con `user_id uuid REFERENCES auth.users`. RLS: políticas `USING (auth.uid() = user_id)` en SELECT/INSERT/UPDATE/DELETE. `profiles` tiene `is_admin BOOLEAN` para control de acceso al CMS.
3. **Reseteo natural por fecha (sin cron)**: el checklist es una derivación `vigentes(hoy) LEFT JOIN logs(hoy)`; si no hay log, checkbox pendiente. Sin jobs a medianoche, sin estados que "desmarcar". Zona horaria: guardar `log_date DATE` en tiempo local del cliente (formato `YYYY-MM-DD`) para evitar desfases UTC.
4. **Timer por `targetTimestamp = Date.now() + restante` + intervalo de 250ms recalculando**: exacto ante throttling de pestañas. Estado de sesión en memoria + persistencia en localStorage al pausar/terminar. Alternativa `setInterval` restando 1s: descartada por deriva en segundo plano.
5. **Alarma con Web Audio API (oscilador)**: secuencia de 3 beeps sintetizados, sin `.mp3`, sin CORS ni cargas de red. Fallback: `navigator.vibrate` en móvil. Requiere gesto de usuario previo (el botón iniciar) para cumplir autoplay policies.
6. **Anillo SVG con `stroke-dashoffset`** para progreso del timer y del día; contribution graph con CSS grid 2 columnas (stats izquierda, heatmap derecha). Sin librerías de charts en MVP (menos peso); Recharts solo si insights avanzados lo piden.
7. **Routing: `/` pública, `/today` protegida**: la landing page es siempre pública para SEO y conversión. El checklist diario vive en `/today` (ruta protegida). Post-login redirige a `/today`. El proxy distingue rutas públicas vs protegidas.
8. **AI provider abstraction**: interfaz `AIProvider` con implementación OpenAI. BYOK (Bring Your Own Key) — el usuario configura su propia key en `/settings`. Key-store con encriptación placeholder (AES-GCM futura). System prompts separados para Goal Coach y Weekly Review.
9. **Analytics engine como módulo lib/**: `lib/analytics/` con funciones puras (streaks, goal-health, failure-reasons, insights, weekly-review). 38 tests con Vitest. Separado de la UI para reutilización.
10. **Feature gating con entitlements**: `lib/entitlements/` con enum Feature, TIER_FEATURES map, y funciones de acceso. Dev tier toggle en settings para testing sin Stripe.
11. **SEO completo**: metadata OpenGraph/Twitter en layout.tsx, JSON-LD SoftwareApplication, `robots.txt`, blog con `generateMetadata` (server component), topics y resources como páginas públicas.
12. **CMS de contenido en `/admin`**: rutas `/admin`, `/admin/content`, `/admin/content/[id]`, `/admin/categories`. Layout con auth guard que verifica `is_admin` en profiles. Editor con meta tools, health bars SEO, filtering/search.
13. **Cookie consent EU**: banner que detecta timezone EU por heuristic. GA consent mode: `analytics_storage` denied hasta aceptar. Persistencia en localStorage. `CookieConsent` cargado en layout.tsx.
14. **I18n con React context**: `lib/i18n.tsx` con EN/ES. Toggle mínimo (botón único que muestra idioma actual). Todas las páginas usan `useLang()` para textos.
15. **DB migrations manuales**: `supabase db push` no disponible. Migraciones se aplican manualmente en Supabase SQL Editor. Usar `DROP POLICY IF EXISTS` antes de crear policies para evitar conflictos.

## Risks / Trade-offs

- [RLS mal configurado bloquea la app] → Mitigación: migración aplica políticas junto con las tablas; verificar con `supabase_get_advisors` tras migrar.
- [Autoplay policy silencia la alarma si no hubo interacción] → Mitigación: el timer siempre arranca con click; crear el `AudioContext` en ese gesto.
- [Zona horaria del usuario vs servidor] → Mitigación: `log_date` lo genera el cliente en hora local; documentado en spec.
- [Proyecto Supabase compartido con otras tablas sin RLS] → Mitigación: no tocar tablas existentes; solo crear las nuevas con RLS desde el inicio.
- [SEO requiere server components para generateMetadata] → Mitigación: solo `app/blog/[slug]/page.tsx` es server component; el resto es client con metadata estática en layout.
- [AI key del usuario en localStorage] → Mitigación: key-store con encriptación placeholder; documentado como BYOK responsibility.
- [Cookie consent EU con heuristic de timezone] → Mitigación: detección por timezone no es 100% precisa; alternativa futura: geo-lookup.

## Migration Plan

1. Aplicar migración SQL (`goals`, `goal_daily_logs`, `profiles`, `seo_content`, índices, RLS + policies) vía `supabase_apply_migration` o SQL Editor manual.
2. Aplicar migración `002_add_admin_flag.sql` para `is_admin` en profiles.
3. Setear `is_admin = TRUE` para el usuario admin via SQL: `UPDATE profiles SET is_admin = TRUE WHERE id = '<uuid>'`.
4. Scaffold Next.js + env vars; `npm run build` en local debe pasar.
5. Push a GitHub, conectar repo en Vercel, setear `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
6. Configurar GA Tracking ID `G-3SWWZ7C48H` en metadata.
7. Rollback: archivar change en OpenSpec; revertir migración solo si no hay datos (DROP TABLE), o dejar tablas inactivas.

## Open Questions

- Ninguna bloqueante. Detalles confirmados durante implementación:
  - Auth: email + magic link (sin redes sociales por ahora).
  - AI: BYOK con OpenAI (sin proveedores alternativos en MVP).
  - Pagos: mock/dev tier primero; Stripe en futura change.
  - Idioma: EN/ES via React context (no i18n framework completo).
