# Agentic Agency — dépôt de spécifications

Plateforme d'agence web IA multi-agents, multi-tenant, hébergée en UE (Scaleway).
Méthode : **Spec-Driven Development (SDD)**, suivant la synthèse des séminaires Yuma d'avril 2026.

## Structure

```
specs/
  00-vision/vision.md               PRD global : problème, cibles, offre, périmètre MVP
  01-architecture/architecture.md   Architecture cible, source de vérité technique
  02-ux/                            Brief UX/UI, prompts Figma Make, contrat de données TypeScript
  decisions.md                      Registre des décisions d'architecture (ADR)
  features/
    F-001-moteur-equipe/
      research.md    exploration (Akgentic, Scaleway, coûts)
      spec.md        QUOI : comportement, contrats, critères d'acceptation
      decisions.md   questions ouvertes à arbitrer par un humain
      plan.md        COMMENT : créé uniquement après validation de spec.md
CLAUDE.md            règles de travail pour Claude Code sur le VPS
```

## Workflow

1. Rédaction de `spec.md`, puis validation humaine.
2. Rédaction de `plan.md` (tâches atomiques et séquentielles), puis validation humaine.
3. Implémentation tâche par tâche : une branche et une PR par tâche, avec revue.
4. Toute décision transverse est consignée dans `specs/decisions.md`, et `architecture.md` est mis à jour dans la même PR.

Une évolution d'une fonctionnalité déjà livrée ouvre un **nouveau** dossier `F-xxx`. On ne réécrit pas l'historique.

## Statut

| ID | Fonctionnalité | Statut |
|----|----------------|--------|
| F-001 | Moteur d'équipe (agents, messages, catalogue, événements, tokens) | Spec en revue |
| F-002 | Sandbox d'exécution Docker et intégration GitHub (PR) | À spécifier |
| F-003 | Multi-tenant : comptes, forfaits, quotas, facturation | À spécifier |
| F-004 | Département Technique MVP : Tech Lead, Dev Backend, QA | À spécifier |
| F-005 | API temps réel et interface client (après maquettes Figma Make) | À spécifier |
| F-006 | Back-office : tenants, suites, configuration des interfaces, supervision | À spécifier |
| F-007 | Connecteurs métier via MCP (CRM, email, helpdesk) | À spécifier |
| F-008 | Onboarding : import d'historique (exports ChatGPT / Claude) | Idée, hors MVP |
| F-009 | Serveur MCP de la plateforme : les agents d'une suite accessibles depuis le compte Claude ou ChatGPT personnel de l'utilisateur | Idée, hors MVP |
