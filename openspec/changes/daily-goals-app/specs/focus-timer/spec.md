## Purpose

Sesión de enfoque por objetivo: cronómetro decremental grande y visual con controles básicos, que registra el tiempo real dedicado y emite una alarma audible al terminar. La sesión se persiste en localStorage para sobrevivir cierres de pestaña.

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
- THEN suena la alarma, el objetivo queda marcado completado automáticamente sin confirmación manual y la app redirige a `/today` mostrando el check.

#### Scenario: Pausar y reanudar
- WHEN el usuario pausa y luego reanuda
- THEN el tiempo restante se congela durante la pausa y continúa desde el mismo punto sin perder segundos.

### Requirement: Sesión persistente entre pestañas
El sistema SHALL persistir la sesión de focus (goal, total y timestamp objetivo) en localStorage de modo que al cerrar y reabrir la pestaña el cronómetro muestre el restante real descontando el tiempo fuera.

#### Scenario: Reabrir con tiempo restante
- WHEN el usuario cierra la pestaña 5 minutos y la reabre
- THEN el timer continúa desde el restante real sin reiniciarse.

#### Scenario: Timer vencido fuera de la app
- WHEN el tiempo se agotó con la pestaña cerrada
- THEN al volver muestra 00:00 pendiente y se completa al pulsar el botón, con alarma.

### Requirement: Redirect a /today al completar
El sistema SHALL redirigir a `/today` cuando la sesión de focus termina (timer llega a cero), cuando el goal no se encuentra, y cuando se presiona el botón "Back".

#### Scenario: Timer termina
- WHEN el countdown alcanza 00:00
- THEN después de 3 segundos redirige a `/today`.

#### Scenario: Goal no encontrado
- WHEN el goal con el id dado no existe en la base de datos
- THEN muestra mensaje de error con link a `/today`.

#### Scenario: Botón Back
- WHEN el usuario presiona "Back"
- THEN navega a `/today`.

### Requirement: Detección de sesión de otro goal
El sistema SHALL detectar si hay una sesión activa de OTRO goal y mostrar un aviso con link para volver a esa sesión, previniendo dos timers simultáneos.

#### Scenario: Sesión activa de otro goal
- WHEN el usuario intenta iniciar focus en goal B pero goal A tiene una sesión activa
- THEN muestra aviso "Hay una sesión en curso en [Goal A]" con link para volver a ella.
