# Maquette Figma Make v1 — référence de design

Code exporté de Figma Make le 2026-10-04 (espace client `/app` et back-office `/admin`), après les passes de corrections P8–P10 et R1–R5.

**Statut : référence, pas du code de production.**
- Composants de présentation uniquement, données fictives dans `src/mocks/`, types dans `src/contrat-donnees.ts`.
- Sert de source de vérité visuelle pour F-005 (espace client) et F-006 (back-office) : les composants seront repris dans `frontend/` puis branchés sur l'API.
- Points à corriger à l'intégration : `specs/02-ux/reliquat-integration.md`.
- Ne pas modifier ce dossier : les évolutions de design se font dans `frontend/`.

## Lancer en local
```bash
cd design/figma-make-v1
pnpm install   # ou npm install
pnpm dev       # http://localhost:8443
```
Le build de production (`vite build`) passe (vérifié le 2026-10-04 ; un seul bundle de ~670 ko, à découper à l'intégration).

## Stack
React 19, Vite 8, TypeScript 5.7, Tailwind CSS 4, lucide-react, polices Plus Jakarta Sans / Inter / JetBrains Mono. Voir ADR-009 sur le choix Vite plutôt que Next.js.
