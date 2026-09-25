## Purpose

Banner de consentimiento para Google Analytics en la UE: detecta usuarios de la UE por timezone, muestra banner de consentimiento y aplica GA consent mode (analytics_storage denied hasta aceptar).

## ADDED Requirements

### Requirement: Detección de EU por timezone
El sistema SHALL detectar si el usuario está en la UE usando una heurística de timezone (no es 100% precisa pero es una aproximación sin geo-lookup).

#### Scenario: Usuario en EU
- WHEN el usuario tiene timezone Europe/* (ej: Europe/Madrid)
- THEN se muestra el banner de consentimiento.

#### Scenario: Usuario fuera de EU
- WHEN el usuario tiene timezone America/* (ej: America/New_York)
- THEN NO se muestra el banner (GA está habilitado por defecto).

### Requirement: Banner de consentimiento
El sistema SHALL mostrar un banner con mensaje explicativo y botones "Accept" / "Decline".

#### Scenario: Ver banner
- WHEN un usuario de EU carga la página por primera vez
- THEN ve el banner de consentimiento con explicación del uso de cookies.

#### Scenario: Aceptar cookies
- WHEN el usuario hace click en "Accept"
- THEN GA se habilita, el banner desaparece y la preferencia se guarda en localStorage.

#### Scenario: Rechazar cookies
- WHEN el usuario hace click en "Decline"
- THEN GA permanece deshabilitado, el banner desaparece y la preferencia se guarda en localStorage.

### Requirement: GA consent mode
El sistema SHALL inicializar GA con `analytics_storage: "denied"` hasta que el usuario acepte. Después de aceptar, SHALL enviar un evento de consentimiento.

#### Scenario: GA denied hasta aceptar
- WHEN el usuario carga la página sin haber aceptado
- THEN GA está cargado pero con `analytics_storage: "denied"` (no envía datos).

#### Scenario: GA granted después de aceptar
- WHEN el usuario acepta cookies
- THEN se envía `consent_update` con `analytics_storage: "granted"` y GA comienza a rastrear.

### Requirement: Persistencia en localStorage
El sistema SHALL guardar la preferencia de consentimiento en localStorage para no mostrar el banner en visitas futuras.

#### Scenario: Visita futura
- WHEN el usuario ya aceptó cookies y vuelve a cargar la página
- THEN NO se muestra el banner y GA está habilitado.
