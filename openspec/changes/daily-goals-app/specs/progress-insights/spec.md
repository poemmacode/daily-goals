## Purpose

Insights de progreso y gamificación: rachas, historial de cumplimiento y estadísticas por objetivo para reforzar las rutinas a lo largo del periodo de vigencia.

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
El sistema SHALL mostrar el historial de los últimos 30/60 días (vista tipo heatmap o barras) y, por cada objetivo, su tasa de éxito y tiempo total invertido vs planeado en su vigencia.

#### Scenario: Revisar progreso de un objetivo
- WHEN el usuario abre el detalle de "Leer 30 min" con 20 días de vigencia
- THEN ve días completados/total, % de éxito y minutos acumulados frente a los planeados.
