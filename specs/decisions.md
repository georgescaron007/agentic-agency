# Registre des décisions d'architecture (ADR)

Statuts : **Accepté** (validé par toi) · **Proposé** (à valider) · **Remplacé**.

---

## ADR-001 — S'inspirer d'Akgentic et le réimplémenter
- **Statut** : Accepté (2026-10-02)
- **Contexte** : Akgentic (Yuma) propose un modèle très proche du besoin : acteurs, AgentCard, catalogue YAML, messages typés, event sourcing. Il est sous licence AGPL-3.0. L'utiliser comme dépendance dans un SaaS obligerait à publier tout notre code.
- **Décision** : reprendre les concepts et l'organisation en couches, avec notre propre implémentation et notre stack. Aucune ligne de code copiée.
- **Conséquences** : plus de travail initial, liberté de licence, stack homogène (Postgres plutôt que MongoDB, React plutôt qu'Angular).

## ADR-002 — Stack technique
- **Statut** : Accepté (2026-10-02)
- **Décision** : Next.js + Tailwind + shadcn/ui ; Python 3.12 + FastAPI + Pydantic v2 ; PostgreSQL 16 avec SQLAlchemy 2 et Alembic ; Redis 7 ; LiteLLM Proxy ; GitHub ; Docker compose ; Scaleway (Paris).

## ADR-003 — Acteurs asyncio maison, jobs arq
- **Statut** : Proposé
- **Options** : (a) Pykka, avec threads comme Akgentic ; (b) LangGraph ; (c) acteurs asyncio maison + arq.
- **Décision proposée** : (c). Toute la stack est asynchrone (FastAPI, SQLAlchemy async, client HTTP LiteLLM). Les threads Pykka ajouteraient un pont sync/async partout. LangGraph modélise des graphes fixes, alors que nos équipes sont dynamiques (embauche en cours de route). arq est natif asyncio et utilise Redis, déjà présent. Celery est écarté pour cette raison.
- **Conséquences** : moteur d'acteurs à écrire nous-mêmes (~quelques centaines de lignes, fortement testé).

## ADR-004 — Event store dans PostgreSQL
- **Statut** : Proposé
- **Décision proposée** : table append-only `team_events` dans Postgres, plutôt que MongoDB ou des fichiers YAML comme dans Akgentic. Une seule base à opérer, transactions, RLS, sauvegardes unifiées.
- **Conséquences** : prévoir des snapshots si une équipe dépasse ~50 000 événements (hors MVP).

## ADR-005 — Multi-tenant en schéma partagé avec RLS
- **Statut** : Accepté pour le principe (multi-tenant dockerisé) ; détail RLS proposé.
- **Décision** : une base unique, `tenant_id` sur chaque table métier, Row Level Security active. Le même ensemble d'images peut être déployé pour un seul client (phase 2) avec un tenant unique.
- **Conséquences** : tests d'isolation obligatoires dans la CI.

## ADR-006 — Inférence exclusivement chez Scaleway, via des alias LiteLLM
- **Statut** : Proposé
- **Décision proposée** : tous les modèles par défaut viennent de Scaleway Generative APIs (Paris), y compris les fallbacks. Les agents ne référencent que des alias (`ak-code`, `ak-reason`, `ak-light`).
- **Raisons** : résidence UE, prix fixes en €, une seule facture, fallback sans sortie de l'UE.
- **Conséquences** : un modèle hors Scaleway (ex. Claude) ne pourra être qu'une option explicite par tenant (voir F-001 D3).

## ADR-007 — Exécution de code en conteneurs éphémères isolés
- **Statut** : Accepté pour le principe (Docker) ; détails en F-002.
- **Décision** : un conteneur par tâche, runtime gVisor, réseau en allowlist, service `sandbox-runner` seul détenteur du socket Docker, accès GitHub via GitHub App.

## ADR-008 — Spécifications en Markdown dans Git, sur deux niveaux
- **Statut** : Accepté (2026-10-02)
- **Décision** : niveau global (vision, architecture, ADR) inspiré de BMAD ; niveau fonctionnalité au format léger (`research.md`, `spec.md`, `plan.md`, `decisions.md`).

## ADR-009 — Frontend : SPA React + Vite plutôt que Next.js
- **Statut** : Proposé
- **Contexte** : ADR-002 prévoyait Next.js. La maquette Figma Make (`design/figma-make-v1/`) est une SPA React 19 + Vite + Tailwind 4 de ~13 600 lignes. Les deux applications (espace client et back-office) sont derrière authentification : pas de besoin de SEO ni de rendu serveur. Le backend est FastAPI.
- **Options** : (a) porter la maquette vers Next.js (App Router) ; (b) garder React + Vite en SPA, servie en statique par Caddy, API FastAPI à côté.
- **Décision proposée** : (b). Reprise quasi directe du code de la maquette, un seul langage côté serveur (Python), déploiement plus simple (fichiers statiques), pas de serveur Node en production. Routage : React Router ; données : TanStack Query + client API typé généré depuis l'OpenAPI de FastAPI.
- **Conséquences** : mise à jour d'ADR-002, de `CLAUDE.md` (stack frontend) et de l'architecture (service `web` = fichiers statiques servis par Caddy) si accepté.
