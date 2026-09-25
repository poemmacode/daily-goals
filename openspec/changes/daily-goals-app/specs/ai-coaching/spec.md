## Purpose

Integración con IA para coaching personalizado: provider abstraction con soporte para OpenAI BYOK (Bring Your Own Key), system prompts para Goal Coach y Weekly Review, y key-store con encriptación placeholder.

## ADDED Requirements

### Requirement: AI provider abstraction
El sistema SHALL proporcionar una interfaz `AIProvider` con implementaciones concretas que permitan cambiar de proveedor sin modificar la UI.

#### Scenario: Usar OpenAI como provider
- WHEN el usuario configura una key de OpenAI en `/settings`
- THEN el sistema usa OpenAI como proveedor de IA.

### Requirement: BYOK (Bring Your Own Key)
El sistema SHALL permitir al usuario ingresar su propia API key de OpenAI en la página de settings. La key SHALL persistirse en localStorage (key-store con encriptación placeholder).

#### Scenario: Configurar key de OpenAI
- WHEN el usuario ingresa su API key de OpenAI en settings
- THEN la key se guarda en localStorage y el sistema la usa para llamadas de IA.

#### Scenario: Sin key configurada
- WHEN el usuario no ha configurado ninguna API key
- THEN las funciones de IA muestran un mensaje indicando que se necesita configurar una key.

### Requirement: System prompts para Goal Coach
El sistema SHALL usar system prompts específicos para coaching de objetivos que analizan el historial del usuario y dan consejos personalizados.

#### Scenario: Pedir consejo de IA
- WHEN el usuario pide consejo sobre un objetivo
- THEN la IA responde con consejos basados en su historial de cumplimiento y patrones de fallo.

### Requirement: System prompts para Weekly Review
El sistema SHALL usar system prompts para generar resúmenes de revisión semanal que analizan el progreso de la semana.

#### Scenario: Generar weekly review con IA
- WHEN el usuario solicita una revisión semanal
- THEN la IA genera un resumen con insights sobre cumplimiento, rachas y áreas de mejora.

### Requirement: Settings page con BYOK
La página `/settings SHALL` permitir al usuario configurar su API key de OpenAI, ver el estado de la conexión y gestionar sus preferencias de IA.

#### Scenario: Ver estado de key
- WHEN el usuario visita `/settings`
- THEN ve si tiene una key configurada y puede actualizarla o eliminarla.
