## Purpose

Sesión de enfoque por objetivo: cronómetro decremental grande y visual con controles básicos, que registra el tiempo real dedicado y emite una alarma audible al terminar.

## ADDED Requirements

### Requirement: Countdown visual grande
El sistema SHALL mostrar al iniciar una sesión una vista de enfoque con el tiempo restante en grande, un anillo de progreso y los controles iniciar, pausar y reiniciar.

#### Scenario: Iniciar sesión de enfoque
- WHEN el usuario pulsa iniciar en un objetivo de 25 minutos
- THEN la vista muestra 25:00 decreciendo segundo a segundo con el anillo de progreso correspondiente.

### Requirement: Tiempo exacto resistente a segundo plano
El cálculo del tiempo restante SHALL basarse en timestamps (`hora_fin_prevista - ahora`), no en conteo de ticks, de modo que el tiempo sea exacto aunque la pestaña pase a segundo plano.

#### Scenario: Cambiar de pestaña durante la sesión
- WHEN el usuario minimiza la pestaña 5 minutos durante una sesión de 25
- THEN al volver, el tiempo restante refleja los 5 minutos transcurridos reales.

### Requirement: Alarma al finalizar y registro de tiempo
Al llegar a 00:00 el sistema SHALL emitir una alarma audible sintetizada, marcar la sesión como terminada y acumular los segundos reales en el log del día; si el usuario completa manualmente antes, SHALL acumular el tiempo transcurrido hasta ese momento.

#### Scenario: Timer llega a cero
- WHEN el countdown alcanza 00:00
- THEN suena la alarma, el objetivo puede marcarse completado automáticamente (confirmable) y el `time_spent_seconds` del día aumenta.

#### Scenario: Pausar y reanudar
- WHEN el usuario pausa y luego reanuda
- THEN el tiempo restante se congela durante la pausa y continúa desde el mismo punto sin perder segundos.
