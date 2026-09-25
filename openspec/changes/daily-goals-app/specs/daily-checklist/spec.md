## Purpose

Checklist diario auto-generado a partir de los objetivos vigentes en la ruta `/today`: muestra qué hacer hoy, permite marcar completado, calcula el porcentaje de cumplimiento del día y muestra el estado de focus en tiempo real sin necesidad de reinicios manuales.

## ADDED Requirements

### Requirement: Generar checklist del día en /today
El sistema SHALL mostrar cada día solo los objetivos vigentes para esa fecha en la ruta `/today`, cada uno con su checkbox en estado pendiente salvo que ya exista un log completado para hoy.

#### Scenario: Abrir la app un día nuevo
- WHEN el usuario abre `/today` en una fecha sin logs previos
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

### Requirement: Tiempo total estimado y restante del día
El sistema SHALL mostrar en la vista principal el tiempo total estimado (suma de minutos asignados de los vigentes) y el tiempo restante para concluir (descontando lo completado y los minutos ya registrados), recalculados en tiempo real.

#### Scenario: Ver tiempos del día
- WHEN hay 2 objetivos vigentes de 30 y 60 min y uno de 30 ya completado
- THEN el total muestra 90 min y el restante 60 min.

### Requirement: Badge "In Progress" con tiempo restante
El sistema SHALL mostrar un badge "⏱ X:XX restantes" en vez del botón Focus para el goal que tenga una sesión de focus activa (running o paused). El badge SHALL ser un link clicable a `/focus/[goalId]`.

#### Scenario: Goal con sesión activa
- WHEN hay una sesión de focus activa para el goal "Leer" con 14:32 restantes
- THEN el goal "Leer" muestra badge `⏱ 14:32 restantes` clicable en vez del botón "Focus".

#### Scenario: Actualización en tiempo real
- WHEN el badge se muestra
- THEN el tiempo restante se actualiza cada 2 segundos reflejando el countdown real.

#### Scenario: Click en badge
- WHEN el usuario hace click en el badge "In Progress"
- THEN navega a `/focus/[goalId]` para ver el timer completo.

### Requirement: Redirect a /today desde focus
El sistema SHALL redirigir a `/today` (no a `/`) cuando el timer de focus termina, cuando el goal no se encuentra, y cuando se presiona el botón "Back" en la vista focus.

#### Scenario: Timer termina
- WHEN el countdown llega a 00:00
- THEN después de 3 segundos redirige a `/today` mostrando el checklist actualizado.

#### Scenario: Botón Back en focus
- WHEN el usuario presiona "Back" en la vista focus
- THEN navega a `/today`.
