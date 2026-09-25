## Purpose

Página `/about` bilingual que explica las features del producto, cómo funciona, templates disponibles y el modelo freemium. Pública (sin auth requerida).

## ADDED Requirements

### Requirement: Página pública bilingual
La ruta `/about` SHALL ser pública (sin auth requerida) y mostrar contenido en el idioma actual (EN/ES) usando el contexto de i18n.

#### Scenario: Visitante en inglés
- WHEN un usuario con idioma EN visita `/about`
- THEN ve el contenido en inglés.

#### Scenario: Visitante en español
- WHEN un usuario con idioma ES visita `/about`
- THEN ve el contenido en español.

### Requirement: Secciones de contenido
La página `/about` SHALL incluir secciones que expliquen: qué es Daily Goals, features principales, cómo funciona, templates disponibles y el modelo freemium.

#### Scenario: Ver secciones
- WHEN el usuario hace scroll en `/about`
- THEN ve secciones explicativas con icons y descripciones.

### Requirement: Link de retorno a home
La página `/about` SHALL incluir un link de retorno a `/` (landing page) o `/today` (si está autenticado).

#### Scenario: Link de retorno
- WHEN el usuario termina de leer `/about`
- THEN ve un link para volver a la página principal.
