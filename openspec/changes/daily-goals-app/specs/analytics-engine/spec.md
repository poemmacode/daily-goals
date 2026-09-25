## Purpose

Motor de análisis (`lib/analytics/`) con funciones puras para streaks, goal-health, failure-reasons, insights y weekly-review. Separado de la UI para reutilización. Incluye 38 tests con Vitest.

## ADDED Requirements

### Requirement: Streak calculation
El sistema SHALL calcular la racha actual de días consecutivos con cumplimiento del 100% (o umbral del 80%) usando funciones puras.

#### Scenario: Calcular racha de 3 días
- WHEN hay logs de 3 días consecutivos al 100%
- THEN `calculateStreak()` retorna 3.

### Requirement: Goal health scoring
El sistema SHALL calcular la salud de cada objetivo basado en consistencia, tendencias y tasa de completado, retornando un score numérico y una categoría (healthy, warning, critical).

#### Scenario: Goal saludable
- WHEN un objetivo tiene >80% de cumplimiento en los últimos 7 días
- THEN `goalHealth()` retorna categoría "healthy".

#### Scenario: Goal crítico
- WHEN un objetivo tiene <50% de cumplimiento
- THEN `goalHealth()` retorna categoría "critical".

### Requirement: Failure reasons analysis
El sistema SHALL analizar las razones de fallo más frecuentes y retornar un desglose con conteo y porcentajes.

#### Scenario: Analizar razones
- WHEN hay 5 fallos por "tiempo", 3 por "cansancio", 2 por "olvido"
- THEN `failureReasons()` retorna el desglose ordenado por frecuencia.

### Requirement: Insights generation
El sistema SHALL generar insights derivados del historial del usuario, incluyendo tendencias, patrones y recomendaciones.

#### Scenario: Generar insights
- WHEN se analiza el historial de 30 días
- THEN `generateInsights()` retorna un array de insights con tipo, título y descripción.

### Requirement: Weekly review
El sistema SHALL generar un resumen de revisión semanal con métricas clave: cumplimiento, rachas, tiempo invertido y áreas de mejora.

#### Scenario: Generar weekly review
- WHEN se genera una revisión semanal
- THEN `weeklyReview()` retorna un objeto con completionRate, currentStreak, timeSpent y recommendations.

### Requirement: 38 tests con Vitest
El sistema SHALL tener 38 tests que cubran todas las funciones del analytics engine.

#### Scenario: Ejecutar tests
- WHEN se ejecuta `npx vitest run`
- THEN todos los 38 tests pasan cubriendo streaks, goal-health, failure-reasons e insights.
