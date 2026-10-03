# F-001 — Recherche

2026-10-02

## 1. Akgentic : ce qu'on reprend, ce qu'on adapte

| Concept Akgentic | Reprise | Adaptation chez nous |
|------------------|---------|----------------------|
| Acteurs Pykka (threads) | Modèle acteur, une boîte aux lettres par agent | Acteurs asyncio (ADR-003) |
| `AgentCard` (rôle, skills, prompt, `routes_to`) | Oui | Ajout de `department`, `model` (alias), `limits`, `can_hire`, `max_instances` |
| `TeamCard` (agents, point d'entrée, superviseurs) | Oui | Ajout de `approval_gates` et `budget` |
| Catalogues Template / Tool / Agent / Team, validation croisée | Oui | + `Department` ; stockage YAML (global) et Postgres (par tenant) |
| 5 intentions : request, response, notification, instruction, acknowledgment | Oui, telles quelles | — |
| Destinataires contraints par schéma de sortie structurée | Oui | Enum dynamique par agent, généré depuis `routes_to` ∩ équipe |
| Embauche / renvoi dynamique | Oui | Contraint par `can_hire` et `max_instances` |
| `HumanProxy` | Oui | Rattaché à l'utilisateur authentifié ; reçoit aussi les demandes de validation |
| Event sourcing, reprise d'une équipe arrêtée | Oui | Postgres (ADR-004) ; reprise automatique sur perte de lease |
| ToolCard à 3 canaux : tool call, system prompt, command | Oui | Même principe |
| Contexte : checkpoint, rewind, compaction | Compaction | Compaction via `ak-light` ; rewind hors MVP |
| Limites d'usage (tokens) | Oui | Quotas tenant + budget tâche + budget exécution d'équipe |
| Tiers community / department / enterprise | Esprit seulement | MVP = « department » (compose, Redis, base) ; enterprise hors périmètre |
| Frontend Angular (graphe d'agents, flux, inspection) | Fonctionnalités, pas le code | Next.js (F-005), maquettes Figma Make |

Source : https://github.com/b12consulting/akgentic-framework (README, AGPL-3.0).

## 2. Catalogue Scaleway Generative APIs (serverless, Paris, relevé le 2026-10-02)

| Modèle | Entrée €/M | Entrée cache €/M | Sortie €/M | Rôle envisagé |
|--------|-----------|------------------|-----------|---------------|
| deepseek-v4-flash-0731 | 0,40 | 0,08 | 0,80 | Primaire `ak-code`, `ak-reason` |
| qwen3-coder-30b-a3b-instruct | 0,20 | — | 0,80 | Fallback code |
| qwen3.5-397b-a17b | 0,60 | — | 3,60 | Fallback qualité |
| gpt-oss-120b | 0,15 | — | 0,60 | Fallback générique |
| mistral-small-3.2-24b-instruct-2506 | 0,15 | — | 0,35 | Primaire `ak-light` |
| gemma-4-26b-a4b-it | 0,25 | — | 0,50 | Fallback `ak-light` |
| mistral-medium-3.5-128b | 1,50 | — | 7,50 | Option premium éventuelle |
| glm-5.2 | 1,80 | — | 5,50 | Option premium éventuelle |
| qwen3-embedding-8b | 0,10 | — | — | Embeddings (recherche future) |

- Batches API : −50 %, adaptée aux tâches non urgentes à un seul appel (résumés, rapports). Elle ne convient pas aux boucles d'agents, qui enchaînent les appels.
- Limites : tokens par minute et requêtes par minute par compte ; les limites officielles s'appliquent après KYC et carte bancaire.
- Hébergement dédié : 8×H100 SXM ≈ 21 944 €/mois. Exclu pour le MVP.

Source : https://www.scaleway.com/en/pricing/model-as-a-service/

## 3. Estimation de consommation d'une tâche de dev (à valider par mesure)
Une boucle ReAct renvoie tout le contexte à chaque étape.
- Contexte moyen par appel : 20 000 à 60 000 tokens (prompt système, outils, historique, fichiers lus).
- Étapes par tâche : 20 à 50.
- Total : **0,5 à 3 M tokens par tâche**, dont ~80 % en entrée, largement cacheable si le préfixe est stable.

Conséquences sur le design :
- Le **cache de préfixe** est le premier levier de coût (entrée en cache 5× moins chère). D'où l'ordre fixe des prompts et l'interdiction de mettre des éléments variables (date, compteurs) en tête.
- La **compaction** évite que le contexte croisse sans fin.
- Des **budgets par tâche** évitent qu'une boucle défaillante vide le pool d'un tenant.
- Il faut mesurer le taux de cache réel de Scaleway dès la première démo (événement `llm.call.completed`, champ `cached_tokens`).

## 4. Points à vérifier pendant le plan
- Endpoint OpenAI-compatible Scaleway et format du champ `cached_tokens` dans la réponse `usage`.
- Support de la sortie structurée (JSON schema) par chaque modèle des alias. Prévoir un repli en mode « JSON + validation + 1 nouvelle tentative ».
- Syntaxe exacte des `fallbacks`, `num_retries` et `cooldown` de la version de LiteLLM retenue.
- Valeurs effectives des limites TPM/QPM sur notre compte Scaleway.
