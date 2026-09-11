---
name: auto-commit-push
description: Use when finishing code changes to always git add, commit and push. Triggers on guardar cambios, subir cambios, commitea, haz push, sincroniza con github.
---

# Auto Commit & Push

Después de completar un conjunto de cambios de código (feature, fix o refactor) y de que build/lint pasen, SIEMPRE cierra el ciclo con git sin que el usuario tenga que pedirlo:

1. **Revisa** con `git status` y `git diff --stat` qué cambió. Solo incluye archivos intencionales del trabajo actual (nunca secretos: `.env.local`, claves, passwords).
2. **Agrega** con `git add` únicamente esos archivos (evita `git add -A` a ciegas si hay archivos extraños sin seguimiento).
3. **Commitea** con un mensaje convencional y conciso en español o inglés según el historial del repo, p. ej. `fix: ...`, `feat: ...`. Revisa `git log --oneline -5` para igualar el estilo.
4. **Empuja** con `git push` a la rama actual. Si no hay upstream configurado, usa `git push -u origin <rama>`.
5. **Reporta** al usuario el commit creado (hash corto + mensaje) y el resultado del push.

Reglas:
- Si el push falla (red, permisos, upstream), informa el error y cómo resolverlo; no reintentes en loop.
- Si hay cambios fuera del alcance del trabajo actual (archivos tocados por el usuario u otros procesos), menciónalos y déjalos sin stagear, o pregunta antes de incluirlos.
- Nunca commitees para guardar trabajo a medias que rompa el build: verifica `npm run build` / lint antes si el repo los tiene.
