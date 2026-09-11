## Purpose

Gestión del catálogo de objetivos recurrentes: el usuario define cada meta una sola vez con su vigencia y tiempo asignado, y el sistema la activa automáticamente cada día dentro del periodo.

## ADDED Requirements

### Requirement: Crear objetivo con vigencia y tiempo asignado
El sistema SHALL permitir crear un objetivo con título, minutos asignados, fecha de inicio, fecha de fin y días activos de la semana.

#### Scenario: Crear objetivo válido
- WHEN el usuario envía título "Leer 30 min", 30 minutos, inicio 2026-09-10 y fin 2026-10-10
- THEN el objetivo queda guardado como activo y aparece en el checklist del día actual.

#### Scenario: Rechazar rango inválido
- WHEN la fecha de fin es anterior a la fecha de inicio o los minutos son <= 0
- THEN el sistema MUST rechazar la creación con un mensaje de error visible.

### Requirement: Editar y archivar objetivos
El sistema SHALL permitir editar todos los campos de un objetivo activo y archivarlo (soft-delete) sin borrar su historial.

#### Scenario: Archivar objetivo
- WHEN el usuario archiva un objetivo con logs previos
- THEN el objetivo deja de aparecer en el checklist futuro pero su historial permanece consultable en insights.

### Requirement: Vigencia automática por fecha
Un objetivo SHALL considerarse vigente un día dado solo si está activo, la fecha está dentro de `[start_date, end_date]` y el día de la semana está en sus días activos.

#### Scenario: Objetivo fuera de vigencia
- WHEN llega el día siguiente a `end_date`
- THEN el objetivo ya no aparece en el checklist sin necesidad de acción manual.

### Requirement: Alta y edición en modal cerrable
El sistema SHALL abrir el formulario de objetivo en un modal centrado que se puede cerrar con botón ✕, click fuera o tecla Escape, sin perder la posición de scroll de la lista.

#### Scenario: Abrir modal desde lista larga
- WHEN el usuario pulsa "+ Nuevo" con la lista con scroll abajo
- THEN el modal aparece centrado y al cerrarlo la lista conserva su posición.

### Requirement: Login con email y contraseña
El sistema SHALL ofrecer login con email + contraseña (entrar y crear cuenta) además del enlace mágico, redirigiendo al checklist al obtener sesión.

#### Scenario: Entrar con contraseña
- WHEN el usuario entra con credenciales válidas
- THEN aterriza en el checklist del día sin pasar por email.
