## Purpose

Checklist diario auto-generado a partir de los objetivos vigentes: muestra qué hacer hoy, permite marcar completado y calcula el porcentaje de cumplimiento del día sin necesidad de reinicios manuales.

## ADDED Requirements

### Requirement: Generar checklist del día
El sistema SHALL mostrar cada día solo los objetivos vigentes para esa fecha, cada uno con su checkbox en estado pendiente salvo que ya exista un log completado para hoy.

#### Scenario: Abrir la app un día nuevo
- WHEN el usuario abre la app en una fecha sin logs previos
- THEN todos los objetivos vigentes aparecen con checkbox desactivado y el progreso del día es 0%.

#### Scenario: Checklist filtra por vigencia
- WHEN un objetivo terminó ayer y otro sigue vigente
- THEN solo el vigente aparece en el checklist de hoy.

### Requirement: Marcar completado manual
El sistema SHALL permitir marcar/desmarcar un objetivo del día, persistiendo el estado y la hora de completado.

#### Scenario: Completar un objetivo
- WHEN el usuario marca el checkbox de un objetivo pendiente
- THEN el log del día queda en `completed=true` con `completed_at` registrado y el progreso diario se recalcula.

### Requirement: Porcentaje de cumplimiento diario
El sistema SHALL calcular y mostrar el porcentaje `completados / vigentes * 100` del día actual en tiempo real.

#### Scenario: Ver progreso del día
- WHEN hay 4 objetivos vigentes y 3 completados
- THEN el indicador muestra 75% inmediatamente tras cada cambio.
