## 1. Base de datos Supabase

- [x] 1.1 Crear migración SQL con `goals` + `goal_daily_logs`, índices y RLS policies por `user_id` — verificar con `supabase_get_advisors` sin alertas críticas nuevas.
- [x] 1.2 Verificar tablas e inserción de prueba con `supabase_execute_sql` (insert + select + delete de un registro de prueba).
- [x] 1.3 Crear migración `001_freemium_and_seo.sql` con tablas `profiles`, `milestones`, `tasks`, `misses`, `experiments`, `seo_content`.
- [x] 1.4 Crear migración `002_add_admin_flag.sql` con `is_admin BOOLEAN` en profiles.

## 2. Scaffolding Next.js + Supabase

- [x] 2.1 Scaffold Next.js (App Router, TypeScript, Tailwind) en la carpeta actual sin borrar `openspec/` — verificar con `npm run build` exitoso.
- [x] 2.2 Instalar y configurar `@supabase/supabase-js` + `@supabase/ssr`, cliente browser/server y `.env.local` — verificar con conexión de prueba a Supabase.
- [x] 2.3 Crear `.gitignore`, `README` con pasos de deploy Vercel y `.env.example` — verificar que no se commitean secretos.

## 3. Gestión de objetivos

- [x] 3.1 UI CRUD de objetivos (título, minutos, fechas, días activos, color) conectada a Supabase — verificar creando/editando/archivando un objetivo visible en lista.
- [x] 3.2 Validar rango de fechas y minutos > 0 con mensajes de error — verificar intentando guardar fin < inicio.
- [x] 3.3 Integrar 14 templates predefinidos en 6 categorías con modal picker — verificar seleccionando un template y verificando pre-fill del formulario.

## 4. Checklist diario

- [x] 4.1 Vista diaria en `/today` que filtra vigentes por fecha y genera/lee logs del día — verificar que un día nuevo muestra checkboxes pendientes.
- [x] 4.2 Toggle completado con persistencia y progreso % en tiempo real — verificar 3/4 → 75%.
- [x] 4.3 Badge "In Progress" con tiempo restante para goal con sesión activa — verificar que el badge se muestra y se actualiza cada 2s.
- [x] 4.4 Badge "In Progress" es link clicable a `/focus/[goalId]` — verificar navegación al hacer click.

## 5. Focus timer + alarma

- [x] 5.1 Vista focus con countdown grande, anillo SVG, play/pausa/reinicio basado en timestamps — verificar exactitud tras 1 min en segundo plano.
- [x] 5.2 Alarma Web Audio al llegar a 00:00 + acumulación de `time_spent_seconds` — verificar sonido audible y segundos guardados.
- [x] 5.3 Persistencia de sesión en localStorage para sobrevivir cierre de pestaña — verificar cerrando y reabriendo pestaña.
- [x] 5.4 Redirect a `/today` al completar, en "Back" y en "goal not found" — verificar navegación.

## 6. Insights y gamificación

- [x] 6.1 Indicador de racha (streak) y resumen del día — verificar racha 3 tras 3 días al 100%.
- [x] 6.2 Historial 30 días + detalle por objetivo (tasa éxito, tiempo invertido vs planeado) — verificar números contra logs reales.
- [x] 6.3 Contribution graph 2 columnas (stats izquierda, heatmap derecha) con celdas aspect-square — verificar layout en móvil y desktop.
- [x] 6.4 Tarjetas compactas de insights (p-3, text-2xl) — verificar diseño en móvil.
- [x] 6.5 Goal Health Badge por objetivo (healthy/warning/critical) — verificar colores según cumplimiento.

## 7. Deploy GitHub + Vercel

- [x] 7.1 Repo GitHub inicializado con primer commit (sin secretos) — verificar `git log` y `git status` limpios.
- [x] 7.2 Guía de conexión Vercel + env vars y build de producción en verde — verificar URL pública cargando el checklist.

## 8. Landing page

- [x] 8.1 Landing page pública en `/` con hero, value props, social proof y CTA — verificar que siempre muestra la landing (no el checklist).
- [x] 8.2 JSON-LD structured data con schema SoftwareApplication — verificar con Google Rich Results Test.
- [x] 8.3 OpenGraph + Twitter cards con thumbnail — verificar preview en redes sociales.

## 9. SEO completo

- [x] 9.1 Metadata estática en layout.tsx (title, description, OG, Twitter) — verificar con `next lint`.
- [x] 9.2 `robots.txt` que permite crawling y bloquea /admin, /settings, /focus — verificar accesibilidad.
- [x] 9.3 Blog con `generateMetadata` (server component) — verificar SEO con Next.js Metadata API.
- [x] 9.4 Páginas `/topics` y `/resources` públicas — verificar acceso sin auth.

## 10. CMS de contenido (Admin)

- [x] 10.1 Admin layout con auth guard que verifica `is_admin` — verificar que usuarios no-admin son redirigidos.
- [x] 10.2 Content list con filtering, search y health bars SEO — verificar en `/admin/content`.
- [x] 10.3 Editor completo con meta tools, slug auto-generado, health bars — verificar creando un post.
- [x] 10.4 Category management en `/admin/categories` — verificar CRUD de categorías.

## 11. AI Coaching

- [x] 11.1 AI provider abstraction (`lib/ai/`) con interfaz `AIProvider` — verificar que la interfaz define los métodos necesarios.
- [x] 11.2 OpenAI implementation con BYOK — verificar llamada con key de prueba.
- [x] 11.3 Key-store con encriptación placeholder — verificar persistencia en localStorage.
- [x] 11.4 System prompts para Goal Coach y Weekly Review — verificar que los prompts generan respuestas útiles.
- [x] 11.5 Settings page con input de API key — verificar que la key se guarda y se puede eliminar.

## 12. Analytics engine

- [x] 12.1 `lib/analytics/` con funciones puras: streaks, goal-health, failure-reasons, insights, weekly-review — verificar que todas las funciones están exportadas.
- [x] 12.2 38 tests con Vitest cubriendo todas las funciones — verificar con `npx vitest run`.
- [x] 12.3 Integración en página de insights — verificar que los datos se muestran correctamente.

## 13. Feature gating

- [x] 13.1 `lib/entitlements/` con Feature enum, TIER_FEATURES, access control — verificar que las funciones retornan los valores esperados.
- [x] 13.2 Dev tier toggle en settings — verificar que el cambio de tier funciona.
- [x] 13.3 UpgradePrompt component — verificar que se muestra cuando la feature está bloqueada.

## 14. Auth y routing

- [x] 14.1 Proxy con rutas públicas/ protegidas — verificar que `/today` requiere auth y `/` es pública.
- [x] 14.2 Redirect post-login a `/today` — verificar que después del login llega a `/today`.
- [x] 14.3 Navbar con user icon dropdown cuando autenticado, login solo cuando no — verificar ambos estados.
- [x] 14.4 BottomNav con tabs Today, Goals, Insights, Settings — verificar navegación.

## 15. Cookie consent y GA

- [x] 15.1 CookieConsent banner con detección EU por timezone — verificar que se muestra para usuarios EU.
- [x] 15.2 GA consent mode (analytics_storage denied hasta aceptar) — verificar con Google Tag Assistant.
- [x] 15.3 Persistencia de preferencia en localStorage — verificar que el banner no reaparece tras aceptar.

## 16. About page

- [x] 16.1 Página `/about` bilingual con secciones de features, cómo funciona, templates, freemium — verificar en ambos idiomas.
- [x] 16.2 Pública (sin auth requerida) — verificar acceso sin login.

## 17. Navbar y Footer

- [x] 17.1 Navbar rediseñada con user icon, Blog/About links, toggle idioma mínimo — verificar en móvil y desktop.
- [x] 17.2 Footer con About, Blog, LinkedIn, Buy Me a Coffee — verificar links.
- [x] 17.3 "Daily Goals®" con ® en Navbar, Login, Footer, metadata — verificar consistencia.

## 18. I18n

- [x] 18.1 Contexto de i18n EN/ES con `useLang()` — verificar cambio de idioma.
- [x] 18.2 Traducciones para todas las páginas y componentes — verificar que no hay textos hardcodeados.

## 19. Tests y lint

- [x] 19.1 38 tests con Vitest pasando — verificar con `npx vitest run`.
- [x] 19.2 Lint limpio (0 errors, 0 warnings) — verificar con `npx eslint --max-warnings=0 .`
- [x] 19.3 Build exitoso — verificar con `npm run build`.
