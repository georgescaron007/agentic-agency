# F-001 — Moteur d'équipe (Team Runtime)

Version 0.2 · 2026-10-03 · Statut : **en revue**
v0.2 : ajout du harnais configurable par agent (§4.5) et de l'humain dans la boucle (§6bis).
v0.2.1 : ajout des conversations (`conversation_id`) pour l'interface de chat (brief UX §6.3).
Dépend de : architecture.md, ADR-001 à ADR-006. Décisions ouvertes : `decisions.md` (D1 à D8).

## 1. Objectif
Fournir le socle générique qui fait vivre une équipe d'agents :
- charger des agents, équipes et départements depuis un **catalogue déclaratif** ;
- faire circuler des **messages typés** entre agents et humains ;
- exécuter la **boucle LLM** de chaque agent avec ses outils ;
- **journaliser** chaque événement et permettre la reprise après panne ;
- **compter les tokens**, appliquer quotas, limites de débit et fallback ;
- rendre le comportement de chaque agent **configurable** via son harnais ;
- permettre à un agent de **consulter un humain** comme il le ferait avec un collègue.

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
| `HarnessProfile` | Réglages réutilisables de tout ce qui entoure le LLM : modèle, boucle, contexte, budget, autonomie, humain dans la boucle, garde-fous (§4.5) |
| Demande humaine (`HumanRequest`) | Question, validation de message ou validation d'action adressée à un humain, avec échéance et relances (§6bis) |
| `ToolCard` | Déclaration d'un outil : nom, description, schéma d'entrée et de sortie, canaux (tool call, prompt système, commande), **classe de risque** (§4.5.3) |
| `AgentCard` | Définition d'un rôle d'agent (§4.1) |
| `Department` | Regroupement d'AgentCards, utilisé pour l'interface et les droits |
| `TeamCard` | Composition d'une équipe : membres, point d'entrée, validations, budget (§4.2) |
| Équipe (instance) | Exécution d'une TeamCard pour un tenant, avec son journal |
| Agent (instance) | Acteur vivant issu d'une AgentCard, nommé `@{role}` ou `@{role}-{n}`  |
| Conversation | Sujet de discussion entre humains et équipe ; regroupe les messages, tâches, demandes et fichiers qui en découlent |
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
prompt_template: expert-system   # clé dans le TemplateCatalog
prompt_vars:
  domain: architecture logicielle
tools: [planning, workspace_read]
routes_to: [manager]             # destinataires autorisés ; "human" possible
can_hire: []
max_instances: 1
harness_profile: supervise       # profil de harnais (§4.5)
harness:                         # surcharges partielles du profil
  model:
    alias: ak-reason
  loop:
    max_steps_per_turn: 30
```

Contrat (Pydantic v2, extrait normatif) :
```python
class AgentCard(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    kind: Literal["AgentCard"]
    key: str = Field(pattern=r"^[a-z][a-z0-9-]{1,40}$")
    version: int = Field(ge=1)
    name: str = Field(min_length=1, max_length=60)
    department: str
    description: str = Field(max_length=500)
    prompt_template: str
    prompt_vars: dict[str, str] = {}
    tools: list[str] = []
    routes_to: list[str] = Field(min_length=1)
    can_hire: list[str] = []
    max_instances: int = Field(1, ge=1, le=10)
    harness_profile: str = "supervise"
    harness: HarnessOverrides = HarnessOverrides()   # mêmes champs que HarnessSpec, tous optionnels
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
    harness:                      # surcharge propre à cette équipe (optionnelle)
      autonomy:
        level: strict
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
- une référence est inconnue (outil, template, agent, département, profil de harnais, garde-fou, alias de modèle) ;
- un harnais effectif dépasse les plafonds de la plateforme ou du forfait (§4.5.4) ;
- `routes_to`, `can_hire`, `entry_point`, `supervisor` ou un `approval_gate` vise un agent absent de la TeamCard (sauf `human`) ;
- une variable du template n'est pas fournie par `prompt_vars` ou par le moteur ;
- deux entrées partagent le même couple `(kind, key, version)`.

Les cartes d'un tenant (en base) priment sur les cartes globales de même clé. En MVP, seul l'administrateur plateforme écrit dans le catalogue (voir D5).

### 4.5 Harnais (HarnessProfile)
Le **harnais** regroupe tout ce qui entoure le LLM et détermine le comportement d'un agent, hors de son rôle (prompt) et de ses outils. Il est entièrement configurable, agent par agent, sans code.

#### 4.5.1 Profil
```yaml
# catalog/harness/supervise.yaml
kind: HarnessProfile
key: supervise
version: 1
description: Agent qui agit seul en interne et demande avant toute action externe.
model:
  alias: ak-reason               # ak-code | ak-reason | ak-light (ou alias du tenant, D3)
  temperature: 0.2
  reasoning_effort: medium       # low | medium | high ; ignoré si le modèle ne le gère pas
loop:
  max_steps_per_turn: 25         # appels LLM max pour traiter un message
  max_output_tokens_per_call: 8000
  parallel_tool_calls: false
  structured_output_retries: 1
context:
  compaction_threshold: 0.6      # part de la fenêtre de contexte
  keep_last_exchanges: 6
  team_summary: true             # injecter un résumé de l'état de l'équipe
budget:
  max_tokens_per_task: 2000000
autonomy:
  level: supervised              # autonomous | supervised | strict (préréglage des tool_policies)
  tool_policies:                 # par classe de risque (§4.5.3) : auto | ask | forbid
    read: auto
    write_internal: auto
    write_external: ask
    irreversible: ask
  ask_when_uncertain: true       # active ask_human et la consigne associée dans le prompt
human_in_the_loop:
  default_assignee: role:owner   # role:<rôle tenant> | user:<id> | team_owner
  channels: [in_app, email]      # D7
  reminder_after: PT4H           # durées ISO 8601
  timeout: P2D
  on_timeout: escalate           # escalate | proceed_with_recommendation | abandon_task
  escalate_to: role:admin
  max_open_requests: 3           # par agent, contre le harcèlement de questions
guardrails:                      # garde-fous enregistrés dans le code, paramétrables ici
  - key: external_messages_per_day
    params: {limit: 20}
```

Profils fournis : `autonome` (tout `auto` sauf `irreversible: ask`), `supervise` (ci-dessus), `strict` (toute écriture en `ask`, `irreversible: forbid`).

#### 4.5.2 Résolution du harnais effectif
Fusion champ par champ, la dernière couche l'emporte :
1. profil global (catalogue YAML) ;
2. profil du tenant de même clé, s'il existe ;
3. surcharges `harness` de l'AgentCard ;
4. surcharges `harness` du membre dans la TeamCard ;
5. plafonds plateforme et forfait (§4.5.4), appliqués en dernier : ils **bornent**, ils ne se surchargent pas.

Le harnais effectif est figé à l'embauche de l'agent, journalisé (`agent.hired`, avec son empreinte SHA-256) et consultable. Une modification de configuration publiée s'applique au **prochain tour** de l'agent, jamais en cours de tour, et produit `agent.harness_changed`.

#### 4.5.3 Classes de risque des outils
Chaque ToolCard déclare `risk` :

| Classe | Définition | Exemples |
|--------|------------|----------|
| `read` | Lecture, aucun effet | `read_file`, `list_tasks` |
| `write_internal` | Effet limité à la plateforme, réversible | `write_file`, `create_task`, `hire_agent` |
| `write_external` | Effet visible hors de la plateforme, réversible | créer une branche, brouillon CRM |
| `irreversible` | Effet externe difficile à annuler | envoyer un email, merger, supprimer, payer |

La politique `tool_policies` est appliquée **par le moteur**, de façon déterministe, avant l'exécution de l'outil. Elle ne dépend pas du jugement du modèle. Une ToolCard peut aussi déclarer une classe dynamique selon les arguments (ex. `write_file` hors du workspace = interdit).

#### 4.5.4 Plafonds
| Paramètre | Plafond plateforme | Modifiable par |
|-----------|--------------------|----------------|
| `max_steps_per_turn` | 100 | back-office |
| `max_output_tokens_per_call` | 32 000 | back-office |
| `max_tokens_per_task` | 10 M (et ≤ pool restant) | back-office |
| `irreversible: auto` | Interdit sauf autorisation explicite par un administrateur plateforme, journalisée | administrateur plateforme |
| `timeout` humain | ≤ 14 jours | back-office |

Une configuration qui dépasse un plafond est refusée à la publication (AC-20).

#### 4.5.5 Garde-fous
Les garde-fous sont des contrôles **codés et testés** (aucun code arbitraire dans la configuration), activés et paramétrés dans le harnais. Points d'accroche : avant appel LLM, après réponse LLM, avant outil, après outil, avant envoi de message. MVP : `external_messages_per_day`, `pii_in_logs` (masquage dans les logs), `blocked_paths`. Un garde-fou qui bloque produit `guardrail.triggered` et un résultat d'outil `{"ok": false}` explicite pour le modèle.

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
    conversation_id: UUID          # conversation d'origine (sujet) ; propagé aux messages entre agents qui en découlent
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
3. Appeler le LLM via l'alias du harnais effectif. Pour chaque appel d'outil demandé : appliquer les garde-fous et la `tool_policy` de sa classe de risque (`auto` → exécuter ; `ask` → demande humaine de type `tool_approval`, l'outil n'est pas exécuté avant la décision ; `forbid` → résultat d'erreur au modèle). Relancer. Maximum `max_steps_per_turn` appels LLM.
4. Produire `AgentTurnOutput`, valider les destinataires et appliquer les `approval_gates` (demande humaine de type `message_approval`).
5. Journaliser, puis distribuer les messages.

Si `max_steps_per_turn` est atteint, l'agent s'arrête et envoie une `notification` au superviseur et à `@human` avec un résumé de l'état.

## 6bis. L'humain dans la boucle
Un agent travaille avec les humains comme avec des collègues. Trois mécanismes, une seule entité (`HumanRequest`) :

| Type | Déclencheur | Qui décide de demander |
|------|-------------|------------------------|
| `question` | L'agent a un doute raisonnable : ambiguïté, information manquante, arbitrage métier | Le modèle, via l'outil `ask_human` |
| `tool_approval` | Outil dont la classe de risque est en `ask` dans le harnais | Le moteur, de façon déterministe |
| `message_approval` | Message correspondant à un `approval_gate` de la TeamCard | Le moteur, de façon déterministe |

Le modèle ne peut pas contourner les deux derniers. Le premier dépend de son jugement, encadré par une consigne de prompt injectée quand `ask_when_uncertain: true` : demander quand une hypothèse erronée aurait un coût réel ; ne pas demander ce qui est trouvable avec ses outils ; toujours proposer une recommandation.

### 6bis.1 Outil `ask_human`
```json
{
  "name": "ask_human",
  "description": "Pose une question à un humain de l'entreprise quand un doute raisonnable empêche d'avancer correctement. Fournis le contexte nécessaire et ta recommandation.",
  "parameters": {
    "type": "object",
    "additionalProperties": false,
    "required": ["question", "context", "blocking"],
    "properties": {
      "question": {"type": "string", "minLength": 10, "maxLength": 1000},
      "context": {"type": "string", "maxLength": 4000, "description": "Ce que tu sais, ce qui te fait douter, l'impact d'une mauvaise hypothèse."},
      "options": {"type": "array", "items": {"type": "string", "maxLength": 200}, "maxItems": 6},
      "recommendation": {"type": "string", "maxLength": 500, "description": "Ce que tu ferais sans réponse."},
      "blocking": {"type": "boolean", "description": "true : tu attends la réponse avant de continuer cette tâche."},
      "urgency": {"type": "string", "enum": ["low", "normal", "high"], "default": "normal"},
      "assignee": {"type": "string", "description": "Optionnel : role:<rôle> ou user:<id> parmi les destinataires autorisés."}
    }
  }
}
```
Classe de risque : `write_internal`. Résultat immédiat : `{"ok": true, "request_id": "...", "status": "pending"}`.
- **Bloquant** : le tour se termine, l'agent passe en `waiting_human` pour cette tâche. Les autres agents de l'équipe continuent. L'agent peut traiter d'autres messages sans rapport.
- **Non bloquant** : l'agent continue avec sa recommandation et adapte son travail à la réponse quand elle arrive.
- La réponse est délivrée comme `AgentMessage` de `@human` (intention `response`, `in_reply_to` = id de la question), avec le nom de la personne qui a répondu.

### 6bis.2 Cycle de vie d'une demande
`pending` → (`reminded`) → `answered` | `expired` | `escalated` | `cancelled`

- Destinataire : `assignee` de la demande, sinon `default_assignee` du harnais, résolu en utilisateurs du tenant.
- Relance après `reminder_after`, puis à l'échéance (`timeout`) application de `on_timeout` :
  - `escalate` : réassignation à `escalate_to`, nouvelle échéance ;
  - `proceed_with_recommendation` : uniquement pour `question`, jamais pour une validation ; l'agent est informé qu'il n'y a pas eu de réponse ;
  - `abandon_task` : tâche en `blocked`, notification au superviseur.
- Une validation (`tool_approval`, `message_approval`) n'est **jamais** accordée par défaut.
- Au-delà de `max_open_requests`, `ask_human` renvoie une erreur et l'agent doit regrouper ses questions.
- Réponses possibles : texte libre, choix d'une option, ou pour une validation : approuver, refuser avec commentaire, **modifier puis approuver** (arguments d'outil ou contenu du message édités par l'humain ; la version modifiée est journalisée).

### 6bis.3 Canaux
Port `HumanChannel` (envoi de la demande, rappel, réception de la réponse), implémentations :

| Canal | MVP | Notes |
|-------|-----|-------|
| `in_app` | Oui | Boîte « Demandes en attente » + fil de l'équipe (F-005) |
| `email` | Oui, en notification (D7) | Email avec la question et un lien sécurisé à usage unique vers la réponse |
| `email` avec réponse par retour de mail | Non (D7) | Nécessite la réception d'emails entrants et l'authentification de l'expéditeur |
| Slack, Teams | Non | F-007 |

Un même humain répond une fois ; la première réponse valide clôt la demande sur tous les canaux.

## 7. Outils du moteur (Function Calling)
Les outils métier (exécution de code, Git, PDF) viennent dans F-002 et F-004. Le moteur fournit (classe de risque entre parenthèses) :

| Outil | Fonctions |
|-------|-----------|
| `planning` | `create_task`, `update_task` (write_internal), `list_tasks` (read) |
| `workspace_read` | `read_file`, `list_files` (read) |
| `workspace_write` | `write_file` (write_internal) |
| `team` | `hire_agent`, `fire_agent` (write_internal), `get_roster` (read) |
| `human` | `ask_human` (write_internal, §6bis.1) |

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
| `create_conversation` | `team_id`, `user_id`, `kind` (team, direct), `direct_agent?`, `title?` | Crée une conversation ; titre généré par `ak-light` après le premier message si absent |
| `send_human_message` | `team_id`, `conversation_id`, `content`, `recipients?`, `attachments?` | Message de `@human` (vers `entry_point` pour une conversation d'équipe, vers l'agent pour une conversation directe) |
| `stop_conversation_work` | `conversation_id` | Interrompt les tours en cours liés à la conversation (bouton « Arrêter ») |
| `answer_human_request` | `request_id`, `user_id`, `answer?`, `option?`, `decision?` (approve, reject, edit_and_approve), `edited_payload?`, `comment?` | Clôt la demande et délivre la réponse ou applique la décision (§6bis.2) |
| `cancel_human_request` | `request_id`, `reason` | Annule une demande devenue sans objet |
| `stop_team` | `team_id` | Termine les tours en cours puis passe en `stopped` |
| `resume_team` | `team_id` | Reconstruit l'équipe depuis le journal, statut `running` |
| `delete_team` | `team_id` | Suppression logique ; données purgées après 30 jours |
| `get_team_state` | `team_id` | Membres (avec statut, dont `waiting_human`), harnais effectifs, tâches, demandes humaines en attente, consommation |

Statuts d'équipe : `running` ↔ `stopped`, puis `deleted`. Une équipe `running` sans message à traiter est simplement inactive : elle ne consomme rien.

## 9. Événements
Écrits dans `team_events` avant que leur effet soit visible, avec `seq` strictement croissant par équipe.

| Type | Contenu principal |
|------|-------------------|
| `team.created` / `team.stopped` / `team.resumed` / `team.deleted` | carte et version, auteur |
| `agent.hired` / `agent.fired` | nom, rôle, par qui, raison, harnais effectif et empreinte |
| `agent.harness_changed` | agent, ancienne et nouvelle empreinte, diff, auteur |
| `conversation.created` / `conversation.renamed` | id, type, agent direct, titre, auteur |
| `message.sent` | `AgentMessage` complet |
| `human_request.created` / `.reminded` / `.answered` / `.escalated` / `.expired` / `.cancelled` | type, agent, destinataire, canal, contenu, réponse ou décision, auteur, payload modifié éventuel |
| `guardrail.triggered` | agent, garde-fou, point d'accroche, motif |
| `llm.call.completed` | agent, alias, modèle effectif, `prompt_tokens`, `cached_tokens`, `completion_tokens`, `cost_eur`, `latency_ms`, `fallback_used`, `task_id` |
| `tool.call.completed` | agent, outil, arguments, résultat (tronqué à 20 000 caractères), durée |
| `task.created` / `task.updated` | projection du planning |
| `context.compacted` | agent, tokens avant et après |
| `quota.threshold_reached` | seuil (80 % / 100 %), portée (tenant, exécution, tâche) |
| `error.raised` | agent, code, message |

**Reprise** : le rejeu reconstruit les membres et leurs harnais, l'historique LLM de chaque agent, le planning et les demandes humaines en cours (échéances recalculées). Il ne ré-exécute **jamais** un appel LLM ou un outil déjà journalisé. Les messages `message.sent` sans traitement terminé par leur destinataire sont redistribués.

## 10. Gestion du contexte
- Seuil de compaction : `context.compaction_threshold` du harnais (60 % par défaut) de la fenêtre de contexte du modèle primaire de l'alias.
- La compaction est faite par `ak-light`. Elle conserve les tâches ouvertes, les décisions, les réponses humaines, les chemins de fichiers et les `keep_last_exchanges` derniers échanges intacts.
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
| Tâche | `budget.max_tokens_per_task` du harnais | Cumul par `task_id` |

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
| AC-16 | `ask_human` bloquant : l'agent passe en `waiting_human`, les autres agents continuent ; la réponse arrive comme message `@human` lié à la question et l'agent reprend la tâche avec cette réponse dans son contexte. |
| AC-17 | Un outil dont la classe est en `ask` n'est pas exécuté avant décision. Approuvé : exécuté ; refusé : le modèle reçoit le refus et le commentaire ; modifié : exécuté avec les arguments édités, journalisés. En `forbid` : jamais exécuté. |
| AC-18 | Relance après `reminder_after`, puis `on_timeout` appliqué à l'échéance. Une validation n'est jamais accordée par expiration. |
| AC-19 | Le harnais effectif suit l'ordre de résolution §4.5.2, est journalisé avec son empreinte, et une modification publiée s'applique au tour suivant, pas au tour en cours. |
| AC-20 | Une configuration de harnais qui dépasse un plafond §4.5.4 est refusée à la publication avec un message explicite. |
| AC-21 | Au-delà de `max_open_requests`, `ask_human` est refusé avec une erreur exploitable par le modèle. |
| AC-22 | Une réponse donnée sur un canal clôt la demande sur tous les autres ; le lien email est à usage unique et expire avec la demande. |
| AC-23 | Tout message, tâche et demande humaine née d'un message humain porte le `conversation_id` d'origine, y compris à travers les échanges entre agents ; `stop_conversation_work` interrompt uniquement les tours liés à cette conversation. |

## 14. Hors périmètre
Exécution de code et GitHub (F-002) ; comptes, forfaits et facturation (F-003) ; agents métier (F-004) ; API HTTP et interface (F-005) ; snapshots d'event store ; rewind de contexte ; recherche sémantique dans le planning.

## 15. Points d'attention
- **Injection de prompt entre agents** : un agent peut relayer du contenu externe malveillant. Mitigation : contenu d'outil encadré comme donnée, destinataires contraints par schéma, validations humaines sur les intentions sensibles. À renforcer en F-002, quand les agents exécuteront du code.
- **Boucles coûteuses** : deux agents qui se renvoient indéfiniment des `request`. Mitigation : budgets d'exécution et de tâche ; détection de ping-pong (> 10 échanges consécutifs entre les deux mêmes agents sans changement du planning → notification humaine et pause des deux agents).
- **Fatigue de questions** : un agent trop prudent sollicite sans arrêt les humains, qui finissent par valider sans lire. Mitigation : `max_open_requests`, recommandation obligatoire (un clic suffit), regroupement, indicateur « demandes par tâche » visible dans le back-office pour ajuster le harnais.
- **Validation par réflexe** : sur une action `irreversible`, l'interface doit montrer clairement l'effet (destinataire, contenu, montant), pas seulement « Approuver ? ».
- **Sortie structurée selon les modèles** : le support du JSON schema varie selon les modèles de fallback. Mode dégradé prévu (JSON + validation + 1 nouvelle tentative), à tester par modèle dans le plan.
