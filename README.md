# 🎯 Daily Goals

Checklist de objetivos diarios con timer de enfoque, alarma y gamificación (rachas e insights).

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completa tu anon key
npm run dev
```

Abre http://localhost:3000, entra con tu email (enlace mágico) y crea tu primer objetivo.

## Specs (OpenSpec)

El plan vive en `openspec/changes/daily-goals-app/`:

```bash
npx @fission-ai/openspec validate daily-goals-app
```

## Deploy: GitHub → Vercel

1. **Subir a GitHub:**
   ```bash
   git init && git add . && git commit -m "feat: daily goals app"
   gh repo create daily-goals --public --source=. --push
   ```
   (`.env.local` está en `.gitignore`: los secretos nunca se suben.)

2. **Conectar en Vercel:**
   - Importa el repo desde el dashboard de Vercel (o `vercel --prod`).
   - Agrega las Environment Variables:
     - `NEXT_PUBLIC_SUPABASE_URL=https://occginpuogqcmeuthxca.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<tu publishable key>`
   - Deploy: cada push a `main` redespliega automáticamente.

3. **Supabase Auth:** en el dashboard de Supabase → Authentication → URL Configuration,
   agrega tu dominio de Vercel como Site URL para que el enlace mágico redirija bien.

## Modelo de datos

- `goals`: plantilla del objetivo (título, minutos, `start_date`/`end_date`, días activos).
- `goal_daily_logs`: un registro por objetivo y día (`goal_id`, `log_date`, `completed`, `time_spent_seconds`).
- El checklist "se reinicia" solo: cada día filtra vigentes y lee/crea logs de esa fecha.
- RLS habilitado: cada usuario solo ve sus filas (`auth.uid() = user_id`).
