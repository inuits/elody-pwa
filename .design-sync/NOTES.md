# design-sync notes — inuits-dams-pwa

- **BLOCKER (2026-08-13): dit is een Vue 3-bibliotheek (`@storybook/vue3-vite`); de design-sync
  converter/het uploadcontract is React 18+ (previews = React JSX, bundle geconsumeerd als
  React-componenten door de design-agent).** Component-sync is daarmee niet mogelijk zonder een
  Vue→React/web-components-brug, wat buiten "ship what the customer built" valt.
  Project "Elody Design System" (f3d5a66b-647f-465f-8a15-7c5ad84a491e) is aangemaakt en leeg
  achtergelaten — herbruikbaar zodra Vue ondersteund wordt, of veilig te verwijderen.
- Alternatief dat vandaag wél werkt: `~/Downloads/design_handoff_elody_redesign/DESIGN_SYSTEM_BRIEF.md`
  is een kant-en-klare opdracht voor een Claude Design-chat om het design system als .dc.html-
  specimens op te bouwen (tokens/regels uit de codebase, geverifieerd in de redesign-POC).
