## Purpose

14 plantillas de objetivos predefinidas en 6 categorías para acelerar la creación de objetivos. El usuario puede seleccionar un template y el formulario se pre-llena automáticamente.

## ADDED Requirements

### Requirement: 14 templates en 6 categorías
El sistema SHALL ofrecer 14 templates distribuidos en 6 categorías: salud, productividad, aprendizaje, finanzas, creatividad, bienestar.

#### Scenario: Ver templates disponibles
- WHEN el usuario abre el modal de creación de objetivo
- THEN ve los 14 templates organizados por categoría.

### Requirement: Template modal picker
El sistema SHALL mostrar un modal con los templates agrupados por categoría, con icono y descripción para cada uno.

#### Scenario: Seleccionar template
- WHEN el usuario hace click en un template
- THEN el formulario de creación se pre-llena con los datos del template (título, minutos, días activos).

#### Scenario: Cerrar modal sin seleccionar
- WHEN el usuario cierra el modal de templates
- THEN el formulario queda vacío para creación manual.

### Requirement: Pre-fill del formulario
Al seleccionar un template, el sistema SHALL pre-llenar automáticamente: título, minutos asignados, y días activos por defecto.

#### Scenario: Template "Leer 30 min"
- WHEN el usuario selecciona el template "Leer 30 min"
- THEN el formulario se pre-llena con título "Leer", 30 minutos, y todos los días activos.

### Requirement: Templates filtrables por categoría
El sistema SHALL permitir filtrar templates por categoría para encontrar rápidamente el tipo de objetivo deseado.

#### Scenario: Filtrar por "salud"
- WHEN el usuario selecciona la categoría "salud"
- THEN solo se muestran los templates de salud (ej: "Ejercicio 30 min", "Meditar 10 min").
