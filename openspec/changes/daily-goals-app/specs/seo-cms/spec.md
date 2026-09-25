## Purpose

CMS de contenido para gestión de blog posts, topics y resources desde `/admin`. Incluye editor con meta tools, health bars SEO y control de acceso via `is_admin`.

## ADDED Requirements

### Requirement: Admin layout con auth guard
El sistema SHALL verificar que el usuario autenticado tenga `is_admin = TRUE` en la tabla `profiles` para acceder a cualquier ruta `/admin`. Si no es admin, SHALL redirigir a `/`.

#### Scenario: Admin accede a /admin
- WHEN un usuario con `is_admin = TRUE` visita `/admin`
- THEN ve el layout de admin con navegación.

#### Scenario: Usuario normal accede a /admin
- WHEN un usuario sin `is_admin` visita `/admin`
- THEN es redirigido a `/`.

### Requirement: Content list con filtering y search
El sistema SHALL mostrar una lista de contenido (blog, topics, resources) con filtering por categoría, búsqueda por título y health bars de SEO.

#### Scenario: Ver lista de contenido
- WHEN el admin accede a `/admin/content`
- THEN ve todos los posts con título, categoría, estado y health bar de SEO.

#### Scenario: Filtrar por categoría
- WHEN el admin selecciona categoría "blog"
- THEN solo se muestran posts de tipo blog.

#### Scenario: Buscar por título
- WHEN el admin escribe "goal tracker" en la búsqueda
- THEN se muestran posts que contengan "goal tracker" en el título.

### Requirement: Editor completo con meta tools
El sistema SHALL ofrecer un editor completo para crear/editar contenido con campos: título, slug (auto-generado), contenido (markdown), categoría, meta title, meta description, OG image.

#### Scenario: Crear nuevo post
- WHEN el admin crea un post nuevo
- THEN el slug se auto-genera desde el título, y puede editar meta title y description para SEO.

#### Scenario: Editar post existente
- WHEN el admin edita un post
- THEN todos los campos se cargan correctamente y puede guardar cambios.

### Requirement: Health bars de SEO
El sistema SHALL mostrar health bars visuales para meta title (longitud ideal 50-60 chars), meta description (longitud ideal 150-160 chars) y contenido (mínimo 300 palabras).

#### Scenario: Health bar meta title
- WHEN el admin escribe un meta title de 55 caracteres
- THEN la health bar muestra verde (óptimo).

#### Scenario: Health bar meta title larga
- WHEN el admin escribe un meta title de 80 caracteres
- THEN la health bar muestra rojo (demasiado largo).

### Requirement: Category management
El sistema SHALL permitir gestionar categorías de contenido (crear, editar, eliminar) desde `/admin/categories`.

#### Scenario: Crear categoría
- WHEN el admin crea una categoría "tutorials"
- THEN la categoría queda disponible para asignar a posts.
