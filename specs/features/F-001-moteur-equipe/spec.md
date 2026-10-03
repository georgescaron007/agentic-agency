# F-001 — Moteur d'équipe (Team Runtime)

Version 0.1 · 2026-10-02 · Statut : **en revue**
Dépend de : architecture.md, ADR-001 à ADR-006. Décisions ouvertes : `decisions.md` (D1 à D6).

## 1. Objectif
Fournir le socle générique qui fait vivre une équipe d'agents :
- charger des agents, équipes et départements depuis un **catalogue déclaratif** ;
- faire circuler des **messages typés** entre agents et humains ;
- exécuter la **boucle LLM** de chaque agent avec ses outils ;
- **journaliser** chaque événement et permettre la reprise après panne ;
- **compter les tokens**, appliquer quotas, limites de débit et fallback.

Aucun agent métier n'est défini ici. Les agents Tech Lead, Dev Backend et QA relèvent de F-004. F-001 fournit seulement une **équipe de démonstration** (Manager, Assistant, Expert) pour les tests.

## 2. Acteurs
| Qui | Interaction avec le moteur |
|-----|----------------------------|
| Administrateur plateforme (nous) | Gère le catalogue global (YAML versionné dans le dépôt) |
| Utilisateur client | Crée une équipe, lui écrit, valide ou refuse les demandes d'approbation, arrête ou reprend |
| Agent | Reçoit des messages, appelle des outils, envoie des messages |
| Couches supérieures (API F-005, sandbox F-002) | Appellent l'interface de service du runtime (§8) |

## 3. Concepts
| Concept | Définition |
|---------|-----------|
| `PromptTemplate` | Prompt système avec variables, versionné |
| `ToolCard` | Déclaration d'un outil : nom, description, schéma d'entrée et de sortie, canaux (tool call, prompt système, commande) |
| `AgentCard` | Définition d'un rôle d'agent (§4.1) |
| `Department` | Regroupement d'AgentCards, utilisé pour l'interface et les droits |
| `TeamCard` | Composition d'une équipe : membres, point d'entrée, validations, budget (§4.2) |
| Équipe (instance) | Exécution d'une TeamCard pour un tenant, avec son journal |
| Agent (instance) | Acteur vivant issu d'une AgentCard, nommé `@{role}` ou `@{role}-{n}` |
| `AgentMessage` | Message typé échangé (§5) |
| Événement | Fait journalisé, immuable (§9) |

## 4. Configuration standardisée

### 4.1 AgentCard
```yaml
# catalog/agents/expert.yaml
kind: AgentCard
key: expert
version: 1
name: Expert
department: demo
description: Fournit une expertise approfondie à la demande du Manager.
model: ak-reason                 # alias LiteLLM uniquement
prompt_template: expert-system   # clé dans le TemplateCatalog
prompt_vars:
  domain: architecture logicielle
tools: [planning, workspace_read]
routes_to: [manager]             # destinataires autorisés ; "human" possible
can_hire: []
max_instances: 1
limits:
  max_steps_per_turn: 25         # appels LLM max pour traiter un message
  max_output_tokens_per_call: 8000
  max_tokens_per_task: 2000000   # garde-fou par tâche du planning
```

Contrat (Pydantic v2, extrait normatif) :
```python
class AgentLimits(BaseModel):
    model_config = ConfigDict(extra="forbid")
    max_steps_per_turn: int = Field(25, ge=1, le=200)
    max_output_tokens_per_call: int = Field(8000, ge=256, le=64000)
    max_tokens_per_task: int = Field(2_000_000, ge=10_000)

class AgentCard(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    kind: Literal["AgentCard"]
    key: str = Field(pattern=r"^[a-z][a-z0-9-]{1,40}$")
    version: int = Field(ge=1)
    name: str = Field(min_length=1, max_length=60)
    department: str
    description: str = Field(max_length=500)
    model: Literal["ak-code", "ak-reason", "ak-light"]
    prompt_template: str
    prompt_vars: dict[str, str] = {}
    tools: list[str] = []
    routes_to: list[str] = Field(min_length=1)
    can_hire: list[str] = []
    max_instances: int = Field(1, ge=1, le=10)
    limits: AgentLimits = AgentLimits()
```

### 4.2 TeamCard
```yaml
# catalog/teams/demo-team.yaml
kind: TeamCard
key: demo-team
version: 1
name: Équipe de démonstration
department: demo
entry_point: manager              # reçoit les messages humains par défaut
members:
  - agent: manager
    count: 1
  - agent: assistant
    count: 0                      # embauché à la demande
  - agent: expert
    count: 0
supervisor: manager               # reçoit les notifications d'échec des autres agents
approval_gates:
  - from: manager
    to: expert
    intent: instruction
    reason: Démonstration d'une validation humaine
budget:
  max_tokens_per_run: 5000000     # par exécution d'équipe
```

### 4.3 Department
```yaml
kind: Department
key: technique
name: Département Technique
agents: [tech-lead, dev-frontend, dev-backend, qa]
```

### 4.4 Règles de validation du catalogue
Un catalogue est rejeté au chargement, avec un message qui cite le fichier et le champ, si :
- une référence est inconnue (outil, template, agent, département, alias de modèle) ;
- `routes_to`, `can_hire`, `entry_point`, `supervisor` ou un `approval_gate` vise un agent absent de la TeamCard (sauf `human`) ;
- une variable du template n'est pas fournie par `prompt_vars` ou par le moteur ;
- deux entrées partagent le même couple `(kind, key, version)`.

Les cartes d'un tenant (en base) priment sur les cartes globales de même clé. En MVP, seul l'administrateur plateforme écrit dans le catalogue (voir D5).

## 5. Protocole de messages

```python
class Intent(StrEnum):
    REQUEST = "request"            # attend une response
    RESPONSE = "response"          # répond à un request (in_reply_to obligatoire)
    NOTIFICATION = "notification"  # information, sans réponse attendue
    INSTRUCTION = "instruction"    # directive d'un superviseur
    ACKNOWLEDGMENT = "acknowledgment"

class Attachment(BaseModel):
    path: str                      # chemin dans le workspace de l'équipe
    description: str | None = None

class AgentMessage(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    id: UUID
    team_id: UUID
    sender: str                    # "@expert", "@human"
    recipients: list[str] = Field(min_length=1)
    intent: Intent
    content: str = Field(min_length=1, max_length=50_000)
    attachments: list[Attachment] = []
    in_reply_to: UUID | None = None
    task_id: UUID | None = None
    created_at: datetime
```

**Sortie structurée d'un tour d'agent.** À la fin de sa boucle, l'agent rend :
```python
class OutgoingMessage(BaseModel):
    recipients: list[RecipientEnum]  # enum générée par agent : routes_to ∩ membres présents
    intent: Intent
    content: str
    attachments: list[Attachment] = []
    in_reply_to: UUID | None = None

class AgentTurnOutput(BaseModel):
    messages: list[OutgoingMessage] = Field(min_length=1, max_length=10)
```
Si la sortie ne respecte pas le schéma, le moteur renvoie l'erreur de validation au modèle **une fois**. Au second échec, il émet `error.raised` et notifie le superviseur.

## 6. Boucle d'un agent
À la réception d'un message :
1. Vérifier le quota du tenant, le budget de l'exécution d'équipe et celui de la tâche (§11.4). En cas de dépassement, appliquer la règle D1.
2. Construire le contexte, dans un ordre fixe favorable au cache : template système et variables → prompts des outils → liste des membres de l'équipe → historique de l'agent (compacté si besoin) → nouveau message. Les contenus issus d'outils sont encadrés comme **données non fiables**.
3. Appeler le LLM via l'alias de l'AgentCard. Exécuter les appels d'outils demandés, puis relancer. Maximum `max_steps_per_turn` appels LLM.
4. Produire `AgentTurnOutput`, valider les destinataires et appliquer les `approval_gates`.
5. Journaliser, puis distribuer les messages.

Si `max_steps_per_turn` est atteint, l'agent s'arrête et envoie une `notification` au superviseur et à `@human` avec un résumé de l'état.

## 7. Outils du moteur (Function Calling)
Les outils métier (exécution de code, Git, PDF) viennent dans F-002 et F-004. Le moteur fournit :

| Outil | Fonctions |
|-------|-----------|
| `planning` | `create_task`, `update_task`, `list_tasks` |
| `workspace_read` | `read_file`, `list_files` |
| `workspace_write` | `write_file` |
| `team` | `hire_agent`, `fire_agent`, `get_roster` |

Schémas JSON (normatifs) :
```json
{
  "name": "create_task",
  "description": "Crée une tâche sur le tableau partagé de l'équipe.",
  "parameters": {
    "type": "object",
    "additionalProperties": false,
    "required": ["title", "description"],
    "properties": {
      "title": {"type": "string", "minLength": 3, "maxLength": 120},
      "description": {"type": "string", "maxLength": 4000},
      "assignee": {"type": "string", "description": "Nom d'agent, ex. @dev-backend"},
      "depends_on": {"type": "array", "items": {"type": "string", "format": "uuid"}},
      "acceptance_criteria": {"type": "array", "items": {"type": "string"}, "maxItems": 20}
    }
  }
}
```
```json
{
  "name": "update_task",
  "description": "Met à jour le statut ou l'assignation d'une tâche.",
  "parameters": {
    "type": "object",
    "additionalProperties": false,
    "required": ["task_id"],
    "properties": {
      "task_id": {"type": "string", "format": "uuid"},
      "status": {"type": "string", "enum": ["todo", "in_progress", "blocked", "in_review", "done"]},
      "assignee": {"type": "string"},
      "note": {"type": "string", "maxLength": 2000}
    }
  }
}
```
```json
{
  "name": "write_file",
  "description": "Écrit un fichier texte dans le workspace de l'équipe (remplace s'il existe).",
  "parameters": {
    "type": "object",
    "additionalProperties": false,
    "required": ["path", "content"],
    "properties": {
      "path": {"type": "string", "pattern": "^(?!/)(?!.*\\.\\.)[\\w./-]{1,200}$"},
      "content": {"type": "string", "maxLength": 500000}
    }
  }
}
```
```json
{
  "name": "read_file",
  "description": "Lit un fichier texte du workspace de l'équipe.",
  "parameters": {
    "type": "object",
    "additionalProperties": false,
    "required": ["path"],
    "properties": {
      "path": {"type": "string", "pattern": "^(?!/)(?!.*\\.\\.)[\\w./-]{1,200}$"},
      "max_chars": {"type": "integer", "minimum": 100, "maximum": 200000, "default": 50000}
    }
  }
}
```
```json
{
  "name": "hire_agent",
  "description": "Ajoute un agent à l'équipe. Rôle limité à can_hire de l'appelant.",
  "parameters": {
    "type": "object",
    "additionalProperties": false,
    "required": ["role", "reason"],
    "properties": {
      "role": {"type": "string", "description": "Clé d'AgentCard"},
      "reason": {"type": "string", "maxLength": 500}
    }
  }
}
```
```json
{
  "name": "fire_agent",
  "description": "Retire un agent embauché par l'appelant. Ses tâches ouvertes repassent en todo.",
  "parameters": {
    "type": "object",
    "additionalProperties": false,
    "required": ["name"],
    "properties": {"name": {"type": "string"}}
  }
}
```
Toute erreur d'outil revient au modèle sous forme de résultat d'outil `{"ok": false, "error": "..."}`. Elle n'arrête jamais la boucle à elle seule.

Le workspace de l'équipe, en MVP, est un volume par équipe : `/data/workspaces/{tenant_id}/{team_id}`. Les chemins sont toujours résolus et vérifiés à l'intérieur de cette racine.

## 8. Interface de service du runtime
Utilisée par l'API (F-005). Aucune dépendance HTTP.

| Commande | Entrée | Effet |
|----------|--------|-------|
| `create_team` | `tenant_id`, `team_card_key`, `title` | Crée l'équipe, instancie les membres `count > 0`, statut `running` |
| `send_human_message` | `team_id`, `content`, `recipients?`, `attachments?` | Message de `@human` (vers `entry_point` par défaut) |
| `decide_approval` | `approval_id`, `approved: bool`, `comment?` | Délivre le message retenu, ou le renvoie à l'émetteur avec le commentaire |
| `stop_team` | `team_id` | Termine les tours en cours puis passe en `stopped` |
| `resume_team` | `team_id` | Reconstruit l'équipe depuis le journal, statut `running` |
| `delete_team` | `team_id` | Suppression logique ; données purgées après 30 jours |
| `get_team_state` | `team_id` | Membres, tâches, approbations en attente, consommation |

Statuts d'équipe : `running` ↔ `stopped`, puis `deleted`. Une équipe `running` sans message à traiter est simplement inactive : elle ne consomme rien.

## 9. Événements
Écrits dans `team_events` avant que leur effet soit visible, avec `seq` strictement croissant par équipe.

| Type | Contenu principal |
|------|-------------------|
| `team.created` / `team.stopped` / `team.resumed` / `team.deleted` | carte et version, auteur |
| `agent.hired` / `agent.fired` | nom, rôle, par qui, raison |
| `message.sent` | `AgentMessage` complet |
| `message.held_for_approval` / `approval.decided` | message, gate, décision, commentaire |
| `llm.call.completed` | agent, alias, modèle effectif, `prompt_tokens`, `cached_tokens`, `completion_tokens`, `cost_eur`, `latency_ms`, `fallback_used`, `task_id` |
| `tool.call.completed` | agent, outil, arguments, résultat (tronqué à 20 000 caractères), durée |
| `task.created` / `task.updated` | projection du planning |
| `context.compacted` | agent, tokens avant et après |
| `quota.threshold_reached` | seuil (80 % / 100 %), portée (tenant, exécution, tâche) |
| `error.raised` | agent, code, message |

**Reprise** : le rejeu reconstruit les membres, l'historique LLM de chaque agent, le planning et les approbations. Il ne ré-exécute **jamais** un appel LLM ou un outil déjà journalisé. Les messages `message.sent` sans traitement terminé par leur destinataire sont redistribués.

## 10. Gestion du contexte
- Seuil de compaction : 60 % de la fenêtre de contexte du modèle primaire de l'alias.
- La compaction est faite par `ak-light`. Elle conserve les tâches ouvertes, les décisions, les chemins de fichiers et les 6 derniers échanges intacts.
- Les fichiers sont référencés par leur chemin. Leur contenu n'entre dans le contexte que via `read_file`.
- Aucune donnée variable (date, compteur) dans le préfixe système. La date est fournie dans le dernier message.

## 11. LLM : fallback, limites de débit, suivi des tokens

### 11.1 Fallback (configuré dans LiteLLM)
- Délai max par appel : 120 s pour `ak-code` et `ak-reason`, 30 s pour `ak-light`.
- Sur 429, 5xx ou délai dépassé : 2 nouvelles tentatives avec backoff exponentiel (1 s puis 4 s), puis modèle de fallback suivant (architecture §7).
- Un modèle qui échoue 3 fois en 60 s est mis en *cooldown* 60 s : les appels vont directement au fallback.
- Le fallback est **visible** : `fallback_used=true` et modèle effectif dans `llm.call.completed`.
- Dépassement de contexte : déclencher la compaction, pas le fallback.

Extrait indicatif (syntaxe à confirmer pour la version retenue) :
```yaml
model_list:
  - model_name: ak-code
    litellm_params:
      model: openai/deepseek-v4-flash-0731
      api_base: os.environ/SCW_API_BASE
      api_key: os.environ/SCW_SECRET_KEY
      timeout: 120
  - model_name: ak-code-fb1
    litellm_params:
      model: openai/qwen3-coder-30b-a3b-instruct
      api_base: os.environ/SCW_API_BASE
      api_key: os.environ/SCW_SECRET_KEY
      timeout: 120
router_settings:
  num_retries: 2
  allowed_fails: 3
  cooldown_time: 60
  fallbacks: [{"ak-code": ["ak-code-fb1", "ak-code-fb2"]}]
```

### 11.2 Limites de débit
| Niveau | Règle (valeurs proposées) |
|--------|---------------------------|
| Plateforme | `rpm`/`tpm` par modèle dans LiteLLM, réglés à 80 % des limites Scaleway du compte |
| Tenant | Appels LLM simultanés : Small 3, Business 6 ; équipes actives : Small 2, Business 5 |
| Agent | Un message traité à la fois (boîte aux lettres) |

Un appel qui dépasse une limite **attend** dans une file (sémaphore Redis par tenant). Il n'échoue pas. L'attente est visible dans l'interface.

### 11.3 Suivi des tokens
- Chaque appel produit `llm.call.completed`, puis une ligne `usage_ledger` dans la même transaction.
- Coût en € = `(prompt − cached) × prix_entrée + cached × prix_cache + completion × prix_sortie`, d'après notre table de prix versionnée.
- Agrégats consultables par tenant, mois, équipe, agent et tâche.
- Réconciliation nocturne avec les spend logs LiteLLM ; écart > 1 % → alerte.

### 11.4 Quotas et budgets
| Portée | Source | Contrôle |
|--------|--------|----------|
| Tenant / mois | Forfait | Compteur Redis, réconcilié avec le ledger |
| Exécution d'équipe | `TeamCard.budget.max_tokens_per_run` | Cumul des événements de l'équipe |
| Tâche | `AgentCard.limits.max_tokens_per_task` | Cumul par `task_id` |

À 80 % : `quota.threshold_reached`, notification à l'utilisateur. À 100 % : comportement selon **D1**. L'unité du pool est fixée par **D6**.

## 12. Exigences non fonctionnelles
- `core`, `catalog`, `llm`, `tools` et `runtime` testables sans Postgres ni Redis (implémentations mémoire des ports).
- Temps entre la commande humaine et le premier événement publié : < 1 s, hors temps LLM.
- Reprise après perte d'un worker : < 30 s.
- `mypy --strict`, `ruff`, couverture ≥ 80 %.
- Aucun contenu client dans les logs applicatifs.

## 13. Critères d'acceptation
| ID | Critère |
|----|---------|
| AC-01 | Ajouter un agent par YAML et template seuls (outils existants) le rend utilisable après rechargement du catalogue, sans changement de code. |
| AC-02 | Un catalogue invalide (§4.4) est rejeté avec un message citant fichier et champ ; le catalogue précédent reste actif. |
| AC-03 | Un agent ne peut adresser qu'un membre de `routes_to` présent dans l'équipe. Une sortie non conforme est retentée une fois, puis produit `error.raised` et une notification au superviseur. |
| AC-04 | `hire_agent` réussit pour un rôle de `can_hire` sous `max_instances`, et échoue proprement sinon. |
| AC-05 | Un message correspondant à un `approval_gate` est retenu. Approuvé, il est délivré ; refusé, il revient à l'émetteur avec le commentaire. |
| AC-06 | Un worker tué pendant une exécution : l'équipe est reprise par un autre worker en < 30 s, avec membres, planning et historique identiques, sans ré-exécution d'appel LLM ou d'outil journalisé. |
| AC-07 | Chaque appel LLM produit un `llm.call.completed` avec tokens et coût. La somme du ledger égale la somme des événements (test de réconciliation). |
| AC-08 | Panne simulée du modèle primaire (5xx ou délai) : le fallback est utilisé, `fallback_used=true`, la tâche continue. |
| AC-09 | À 80 % du quota, une notification est émise. À 100 %, le comportement retenu en D1 s'applique. |
| AC-10 | Un agent qui atteint `max_steps_per_turn` s'arrête et notifie superviseur et humain. Aucune boucle infinie possible. |
| AC-11 | Un tenant A ne peut ni lire ni piloter une équipe d'un tenant B, ni via le service runtime ni directement en base (RLS). |
| AC-12 | L'équipe de démo (Manager, Assistant, Expert) réussit le scénario d'Akgentic (« demande à l'Expert son rôle ») en CI avec un LLM simulé, et manuellement avec Scaleway. |
| AC-13 | Au-delà du seuil, la compaction se déclenche et l'agent conserve ses tâches ouvertes et décisions. |
| AC-14 | `write_file` et `read_file` refusent tout chemin sortant du workspace de l'équipe. |
| AC-15 | Aucun module du moteur n'importe `agency.api` (vérifié par import-linter en CI). |

## 14. Hors périmètre
Exécution de code et GitHub (F-002) ; comptes, forfaits et facturation (F-003) ; agents métier (F-004) ; API HTTP et interface (F-005) ; snapshots d'event store ; rewind de contexte ; recherche sémantique dans le planning.

## 15. Points d'attention
- **Injection de prompt entre agents** : un agent peut relayer du contenu externe malveillant. Mitigation : contenu d'outil encadré comme donnée, destinataires contraints par schéma, validations humaines sur les intentions sensibles. À renforcer en F-002, quand les agents exécuteront du code.
- **Boucles coûteuses** : deux agents qui se renvoient indéfiniment des `request`. Mitigation : budgets d'exécution et de tâche ; détection de ping-pong (> 10 échanges consécutifs entre les deux mêmes agents sans changement du planning → notification humaine et pause des deux agents).
- **Sortie structurée selon les modèles** : le support du JSON schema varie selon les modèles de fallback. Mode dégradé prévu (JSON + validation + 1 nouvelle tentative), à tester par modèle dans le plan.
