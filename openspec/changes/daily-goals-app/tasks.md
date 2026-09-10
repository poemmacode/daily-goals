## 1. Base de datos Supabase

- [ ] 1.1 Crear migración SQL con `goals` + `goal_daily_logs`, índices y RLS policies por `user_id` — verificar con `supabase_get_advisors` sin alertas críticas nuevas.
- [ ] 1.2 Verificar tablas e inserción de prueba con `supabase_execute_sql` (insert + select + delete de un registro de prueba).

## 2. Scaffolding Next.js + Supabase

- [ ] 2.1 Scaffold Next.js (App Router, TypeScript, Tailwind) en la carpeta actual sin borrar `openspec/` — verificar con `npm run build` exitoso.
- [ ] 2.2 Instalar y configurar `@supabase/supabase-js` + `@supabase/ssr`, cliente browser/server y `.env.local` — verificar con conexión de prueba a Supabase.
- [ ] 2.3 Crear `.gitignore`, `README` con pasos de deploy Vercel y `.env.example` — verificar que no se commitean secretos.

## 3. Gestión de objetivos

- [ ] 3.1 UI CRUD de objetivos (título, minutos, fechas, días activos, color) conectada a Supabase — verificar creando/editando/archivando un objetivo visible en lista.
- [ ] 3.2 Validar rango de fechas y minutos > 0 con mensajes de error — verificar intentando guardar fin < inicio.

## 4. Checklist diario

- [ ] 4.1 Vista diaria que filtra vigentes por fecha y genera/lee logs del día — verificar que un día nuevo muestra checkboxes pendientes.
- [ ] 4.2 Toggle completado con persistencia y progreso % en tiempo real — verificar 3/4 → 75%.

## 5. Focus timer + alarma

- [ ] 5.1 Vista focus con countdown grande, anillo SVG, play/pausa/reinicio basado en timestamps — verificar exactitud tras 1 min en segundo plano.
- [ ] 5.2 Alarma Web Audio al llegar a 00:00 + acumulación de `time_spent_seconds` — verificar sonido audible y segundos guardados.

## 6. Insights y gamificación

- [ ] 6.1 Indicador de racha (streak) y resumen del día — verificar racha 3 tras 3 días al 100%.
- [ ] 6.2 Historial 30/60 días + detalle por objetivo (tasa éxito, tiempo invertido vs planeado) — verificar números contra logs reales.

## 7. Deploy GitHub + Vercel

- [ ] 7.1 Repo GitHub inicializado con primer commit (sin secretos) — verificar `git log` y `git status` limpios.
- [ ] 7.2 Guía de conexión Vercel + env vars y build de producción en verde — verificar URL pública cargando el checklist.
