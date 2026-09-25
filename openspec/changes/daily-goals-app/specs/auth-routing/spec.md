## Purpose

Proxy de autenticación con rutas públicas y protegidas: define qué rutas requieren auth, redirige post-login a `/today`, y mantiene `/` como ruta pública siempre.

## ADDED Requirements

### Requirement: Rutas públicas definidas
El proxy SHALL definir las siguientes rutas como públicas (sin auth requerida): `/`, `/login`, `/auth/*`, `/about`, `/blog/*`, `/topics`, `/resources`.

#### Scenario: Visitante accede a /
- WHEN un usuario no autenticado visita `/`
- THEN accede a la landing page sin redirección.

#### Scenario: Visitante accede a /about
- WHEN un usuario no autenticado visita `/about`
- THEN accede a la página about sin redirección.

### Requirement: Rutas protegidas
El proxy SHALL redirigir a `/login` cualquier intento de acceder a una ruta no pública sin autenticación.

#### Scenario: Sin auth en /today
- WHEN un usuario no autenticado visita `/today`
- THEN es redirigido a `/login`.

#### Scenario: Sin auth en /goals
- WHEN un usuario no autenticado visita `/goals`
- THEN es redirigido a `/login`.

### Requirement: Redirect post-login a /today
El proxy SHALL redirigir a `/today` (no a `/`) cuando un usuario autenticado visita `/login`.

#### Scenario: Login exitoso
- WHEN un usuario autenticado visita `/login`
- THEN es redirigido a `/today`.

### Requirement: Admin routes protection
El proxy SHALL verificar que las rutas `/admin/*` requieran autenticación. El auth guard en el layout de admin verifica `is_admin` adicional.

#### Scenario: Sin auth en /admin
- WHEN un usuario no autenticado visita `/admin`
- THEN es redirigido a `/login`.

#### Scenario: Auth pero no admin
- WHEN un usuario autenticado sin `is_admin` visita `/admin`
- THEN el layout de admin lo redirige a `/`.
