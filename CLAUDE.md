# Règles de travail pour Claude Code

## Méthode
- Spec-Driven Development strict : aucun code sans `spec.md` **et** `plan.md` validés dans `specs/features/F-xxx/`.
- Avant chaque tâche, lire dans l'ordre : `specs/01-architecture/architecture.md`, `specs/decisions.md`, puis le dossier `F-xxx` concerné.
- Une tâche du plan correspond à une branche (`f-xxx/tache-nn-slug`) et à une PR.
- Si une décision non couverte apparaît, l'ajouter au `decisions.md` du F-xxx et s'arrêter pour demander.
- Si le code s'écarte de l'architecture, proposer la mise à jour de `architecture.md` dans la même PR.

## Code
- Backend : Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 (async) avec Alembic, arq. `mypy --strict` et `ruff` doivent passer.
- Frontend : TypeScript strict, Next.js, Tailwind, shadcn/ui.
- Ni pseudocode ni `TODO`. Couverture de tests ≥ 80 % sur `backend/`.
- Les modules `core`, `llm`, `tools`, `catalog` et `runtime` n'importent jamais `api`. Cette règle est vérifiée par import-linter.
- Tout agent et tout outil déclare ses schémas d'entrée et de sortie en Pydantic.
- Aucun appel LLM direct : tout passe par le proxy LiteLLM, via un alias de modèle (`ak-code`, `ak-reason`, `ak-light`).

## Environnement
- Ce VPS est un environnement de **développement**. Il ne doit contenir ni données clients réelles ni secrets de production.
- Les secrets vont dans `.env`, non versionné. `.env.example` est tenu à jour.
- Les commandes standard (`make up`, `make test`, `make lint`, `make migrate`) sont créées par la première tâche du plan F-001.
