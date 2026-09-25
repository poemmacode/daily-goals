## Purpose

Sistema de feature gating con entitlements: define qué features están habilitadas por tier (free, pro, dev), controla el acceso a funcionalidades premium y permite un dev tier toggle para testing.

## ADDED Requirements

### Requirement: Feature enum
El sistema SHALL definir un enum `Feature` con todas las features premium disponibles (AI_COACHING, WEEKLY_REVIEW, FAILURE_ANALYTICS, etc.).

#### Scenario: Listar features
- WHEN se importa `Feature` de `lib/entitlements/`
- THEN contiene todas las features premium definidas.

### Requirement: TIER_FEATURES mapping
El sistema SHALL definir un mapping `TIER_FEATURES` que asocia cada tier (free, pro, dev) con las features habilitadas.

#### Scenario: Tier free
- WHEN el usuario está en tier free
- THEN solo tiene acceso a features básicas (goals, checklist, focus timer, insights básicos).

#### Scenario: Tier pro
- WHEN el usuario está en tier pro
- THEN tiene acceso a todas las features incluyendo AI coaching, weekly review y failure analytics.

### Requirement: Access control functions
El sistema SHALL proporcionar funciones `hasFeature(feature, tier)` y `getEnabledFeatures(tier)` para verificar acceso.

#### Scenario: Verificar acceso a feature
- WHEN se llama `hasFeature("AI_COACHING", "free")`
- THEN retorna `false`.

#### Scenario: Verificar acceso con tier pro
- WHEN se llama `hasFeature("AI_COACHING", "pro")`
- THEN retorna `true`.

### Requirement: Dev tier toggle
La página `/settings SHALL` permitir al usuario cambiar entre tiers (free, pro, dev) para testing sin Stripe.

#### Scenario: Cambiar a dev tier
- WHEN el usuario selecciona "dev" en settings
- THEN tiene acceso a todas las features sin restricciones.

### Requirement: Upgrade prompts
El sistema SHALL mostrar componentes `UpgradePrompt` cuando el usuario intenta acceder a una feature no habilitada en su tier.

#### Scenario: Feature bloqueada
- WHEN el usuario en tier free intenta acceder a AI coaching
- THEN ve un prompt "Upgrade to Pro" con descripción de la feature.
