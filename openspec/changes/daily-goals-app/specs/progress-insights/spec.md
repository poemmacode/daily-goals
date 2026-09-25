## Purpose

Insights de progreso y gamificación: rachas, historial de cumplimiento, contribution graph y estadísticas por objetivo para reforzar las rutinas a lo largo del periodo de vigencia. El analytics engine (`lib/analytics/`) proporciona funciones puras con 38 tests.

## ADDED Requirements

### Requirement: Racha de cumplimiento (streak)
El sistema SHALL calcular la racha actual de días consecutivos con cumplimiento del 100% (o umbral definido del 80%) y mostrarla de forma destacada.

#### Scenario: Ver racha activa
- WHEN el usuario completó el 100% los últimos 3 días
- THEN el indicador muestra racha de 3 días.

#### Scenario: Romper la racha
- WHEN un día queda por debajo del umbral
- THEN la racha se reinicia a 0 al día siguiente.

### Requirement: Historial y detalle por objetivo
El sistema SHALL mostrar el historial de los últimos 30 días (vista tipo heatmap) y, por cada objetivo, su tasa de éxito y tiempo total invertido vs planeado en su vigencia.

#### Scenario: Revisar progreso de un objetivo
- WHEN el usuario abre el detalle de "Leer 30 min" con 20 días de vigencia
- THEN ve días completados/total, % de éxito y minutos acumulados frente a los planeados.

### Requirement: Contribution graph 2 columnas
El sistema SHALL mostrar un contribution graph estilo GitHub en layout de 2 columnas: estadísticas a la izquierda (w-36) y heatmap a la derecha (flex-1). Las celdas SHALL ser `aspect-square` con `gap-px`.

#### Scenario: Ver contribution graph
- WHEN el usuario abre la página de insights
- THEN ve un heatmap de 30 días con celdas cuadradas y estadísticas a la izquierda.

#### Scenario: Tooltip en celda
- WHEN el usuario hace hover sobre una celda del heatmap
- THEN ve un tooltip con la fecha y el porcentaje de cumplimiento de ese día.

### Requirement: Tarjetas compactas de insights
El sistema SHALL mostrar las tarjetas de insights con diseño compacto (p-3, text-2xl para números) para maximizar la información visible sin scroll excesivo.

#### Scenario: Ver insights en móvil
- WHEN el usuario abre insights en un móvil
- THEN las tarjetas muestran números grandes y texto conciso sin necesidad de scroll excesivo.

### Requirement: Goal Health Badge
El sistema SHALL calcular y mostrar un badge de salud para cada objetivo basado en consistencia, tendencias y tasa de completado. Los badges SHALL ser: "healthy" (verde), "warning" (amarillo), "critical" (rojo).

#### Scenario: Goal saludable
- WHEN un objetivo tiene >80% de cumplimiento en los últimos 7 días
- THEN muestra badge verde "healthy".

#### Scenario: Goal en riesgo
- WHEN un objetivo tiene entre 50-80% de cumplimiento
- THEN muestra badge amarillo "warning".

### Requirement: Failure reasons (razones de fallo)
El sistema SHALL permitir al usuario seleccionar una razón cuando falla un objetivo (tiempo, cansancio, olvido, otro) y mostrar un dashboard de insights con las razones más frecuentes.

#### Scenario: Registrar razón de fallo
- WHEN el usuario desmarca un objetivo completado
- THEN aparece un selector de razones para explicar por qué no se completó.

#### Scenario: Dashboard de razones
- WHEN el usuario abre insights
- THEN ve un desglose de las razones de fallo más frecuentes.

### Requirement: Analytics engine con tests
El sistema SHALL proporcionar un motor de análisis (`lib/analytics/`) con funciones puras para streaks, goal-health, failure-reasons, insights y weekly-review. SHALL tener 38 tests con Vitest.

#### Scenario: Ejecutar tests
- WHEN se ejecuta `npx vitest run`
- THEN todos los 38 tests pasan sin errores.
