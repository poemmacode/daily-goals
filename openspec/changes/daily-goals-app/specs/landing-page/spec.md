## Purpose

Página pública de aterrizaje (`/`) optimizada para conversión y SEO: muestra hero, value props, social proof y CTA. Separada del checklist diario autenticado.

## ADDED Requirements

### Requirement: Landing page siempre pública
La ruta `/` SHALL ser siempre pública y mostrar la landing page, sin importar si el usuario está autenticado o no. No SHALL redirigir a ninguna otra ruta.

#### Scenario: Visitante no autenticado
- WHEN un usuario no autenticado visita `/`
- THEN ve la landing page completa con hero, value props y CTA.

#### Scenario: Usuario autenticado
- WHEN un usuario autenticado visita `/`
- THEN ve la misma landing page (no el checklist diario).

### Requirement: Hero section con headline y CTA
La landing page SHALL mostrar un hero con headline persuasivo, subtítulo explicativo y botón CTA que redirige a `/login`.

#### Scenario: Ver hero
- WHEN el usuario carga la página
- THEN ve el headline, subtítulo y botón "Start Tracking for Free" (o "Empieza a Rastrear Gratis" en ES).

### Requirement: Value props section
La landing page SHALL mostrar 4 value props con icono, título y descripción que explican las diferencias clave del producto.

#### Scenario: Ver value props
- WHEN el usuario hace scroll después del hero
- THEN ve las secciones: "Data-Driven Difference", "Turn Why into How", "Your AI Goal Coach", "Everything You Need".

### Requirement: Social proof section
La landing page SHALL mostrar badges de social proof con características clave del producto.

#### Scenario: Ver social proof
- WHEN el usuario llega a la sección de social proof
- THEN ve badges como "Deterministic goal health scoring", "GitHub-style contribution heatmap", etc.

### Requirement: Final CTA
La landing page SHALL mostrar un CTA final al final de la página que redirige a `/login`.

#### Scenario: Ver CTA final
- WHEN el usuario llega al final de la página
- THEN ve "Ready to stop guessing and start improving?" con botón "Start Free Today".

### Requirement: JSON-LD structured data
La landing page SHALL incluir JSON-LD con schema SoftwareApplication para SEO.

#### Scenario: Crawling por motores de búsqueda
- WHEN un motor de búsqueda indexa la página
- THEN encuentra el JSON-LD con nombre, descripción, screenshot y offers.
