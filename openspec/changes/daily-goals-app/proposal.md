## Why

El usuario necesita gamificar rutinas diarias sin reescribirlas cada día: definir cada objetivo una sola vez con un periodo de vigencia (1-2 meses) y hacer check diario con temporizador de enfoque, alarma al terminar y métricas de cumplimiento. Hoy no existe ninguna app propia que lo resuelva y hacerlo manual en papel/notas no da insights de progreso. Además, necesita una landing page pública para atraer usuarios, SEO optimizado, un CMS de contenido para blog/recursos, y coaching con IA para mejorar sus hábitos.

## What Changes

- Scaffolding Next.js (App Router) + TypeScript + Tailwind CSS en la carpeta actual, listo para deploy en Vercel vía GitHub.
- Integración con Supabase (Postgres + Auth anónima/email) con migraciones SQL versionadas.
- CRUD de objetivos (`goals`): título, categoría/color/icono, minutos asignados, `start_date`, `end_date`, días activos, **14 templates predefinidos en 6 categorías**.
- Checklist diario auto-generado en **`/today`** (ruta protegida): filtra metas vigentes por fecha actual y crea/lee `daily_logs` del día; sin cronjobs, el "reseteo" es natural por fecha. **Badge "In Progress" con tiempo restante** para goals con sesión activa.
- Modo Focus: cronómetro decremental grande con anillo de progreso SVG, play/pausa/reinicio, cálculo por `Date.now()` (resistente a throttling) y alarma sintetizada con Web Audio API. **Redirect a `/today` al completar**.
- Porcentaje de cumplimiento diario, rachas (streaks) e insights por objetivo (tiempo invertido vs planeado, tasa de éxito, **contribution graph tipo GitHub 2 columnas**).
- **Landing page pública (`/`)**: hero, value props, social proof, CTA. Separada del checklist diario.
- **Página `/about` bilingual**: explica features, cómo funciona, templates, freemium.
- **SEO completo**: metadata OpenGraph/Twitter, JSON-LD SoftwareApplication, `robots.txt`, blog con `generateMetadata`, topics, resources.
- **CMS de contenido (`/admin`)**: gestión de blog posts, topics, resources con editor, health bars SEO, control de acceso `is_admin`.
- **AI Coaching**: provider abstraction con OpenAI BYOK, system prompts para Goal Coach y Weekly Review, key-store con encriptación placeholder.
- **Analytics engine** (`lib/analytics/`): streaks, goal-health, failure-reasons, insights, weekly-review — 38 tests.
- **Feature gating** (`lib/entitlements/`): enum de features, TIER_FEATURES, control de acceso, dev tier toggle.
- **Cookie consent EU**: banner de consentimiento, GA consent mode, persistencia en localStorage.
- **Navbar rediseñada**: icono de usuario con dropdown, login solo cuando no autenticado, Blog/About en nav, toggle de idioma mínimo.
- **Google Analytics**: gtag.js G-3SWWZ7C48H con consent mode para EU.
- RLS habilitado en todas las tablas nuevas; variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` documentadas para Vercel.

## Capabilities

### New Capabilities
- `goals-management`: creación, edición, archivado y vigencia de objetivos recurrentes con tiempo asignado y 14 templates predefinidos.
- `daily-checklist`: generación y completado del checklist del día en `/today`, porcentaje de cumplimiento diario, badge "In Progress" con tiempo restante.
- `focus-timer`: sesión de enfoque por objetivo con countdown visual, persistencia de tiempo real, alarma de fin y redirect a `/today`.
- `progress-insights`: rachas, historial de cumplimiento, contribution graph 2 columnas, insights por objetivo, analytics engine con 38 tests.
- `landing-page`: página pública `/` con hero, value props, social proof, CTA. Separada del checklist autenticado.
- `seo-cms`: CMS de contenido en `/admin` para blog, topics y resources con editor, health bars y control de acceso is_admin.
- `ai-coaching`: provider abstraction para IA, OpenAI BYOK, system prompts, key-store. Configurable desde `/settings`.
- `analytics-engine`: motor de análisis con streaks, goal-health, failure-reasons, insights y weekly-review.
- `feature-gating`: sistema de entitlements con tiers, features habilitadas por tier, dev toggle para testing.
- `templates`: 14 plantillas de objetivos predefinidas en 6 categorías (salud, productividad, aprendizaje,-finanzas, creatividad, bienestar).
- `cookie-consent`: banner de consentimiento EU para Google Analytics con consent mode y persistencia.
- `about-page`: página `/about` bilingual que explica features, cómo funciona, templates y freemium.
- `auth-routing`: proxy con rutas públicas/ protegidas, redirect post-login a `/today`, ruta `/today` protegida.

### Modified Capabilities
- Ninguna adicional (las 4 originales se actualizan con los requisitos anteriores).

## Impact

- Nuevo código: app Next.js completa en este repo (`app/`, `components/`, `lib/`).
- Nuevas tablas Supabase: `goals`, `goal_daily_logs`, `profiles`, `seo_content` (+ RLS policies).
- Nuevas dependencias: `@supabase/supabase-js`, `@supabase/ssr`; dev: migraciones SQL.
- Sistemas afectados: solo el proyecto Supabase conectado (tablas nuevas, sin tocar `User`, `Job`, etc. existentes); deploy Vercel conectado a GitHub requiere env vars.
- Tests: 38 tests en `lib/analytics/__tests__/` cubriendo streaks, goal-health, failure-reasons, insights.
