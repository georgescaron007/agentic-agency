/**
 * Contrat de données de l'interface — Initiative IA
 * Version 0.3 · 2026-10-04 (connecteurs, base de connaissances, démarrage)
 *
 * Source : specs/features/F-001-moteur-equipe/spec.md v0.2 (§4, §5, §6bis, §9, §11).
 * À fournir à Figma Make : les composants reçoivent ces types en props.
 * Les données fictives en bas de fichier vont dans un dossier `mocks/` du projet généré.
 */

// ─────────────────────────────── Identifiants et bases ───────────────────────────────

export type UUID = string;
export type ISODateTime = string; // ex. "2026-10-03T14:05:00Z"
export type ISODuration = string; // ex. "PT4H", "P2D"

export type ModelAlias = "ak-code" | "ak-reason" | "ak-light";
export type RiskClass = "read" | "write_internal" | "write_external" | "irreversible";
export type ToolPolicy = "auto" | "ask" | "forbid";
export type AutonomyLevel = "autonomous" | "supervised" | "strict";

// ─────────────────────────────── Tenant et utilisateurs ───────────────────────────────

export type PlanKey = "small_team" | "business";
export type TenantStatus = "active" | "trial" | "suspended";
export type UserRole = "owner" | "member";

export interface Tenant {
  id: UUID;
  name: string;
  plan: PlanKey;
  status: TenantStatus;
  maxUsers: number;
  logoUrl?: string;
}

export interface User {
  id: UUID;
  tenantId: UUID;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
}

// ─────────────────────────────── Suites et agents ───────────────────────────────

export type TeamStatus = "running" | "stopped" | "deleted";
export type AgentStatus = "working" | "waiting_human" | "waiting_connection" | "idle" | "paused" | "error";

/** Agent IA */
export interface Agent {
  name: string; // "@lina" (identifiant technique stable)
  firstName: string; // "Lina" (affiché seulement si agentNaming = "first_name_and_role")
  role: string; // "Prospection"
  cardKey: string; // "prospection"
  department: string;
  description: string;
  color: string; // couleur d'avatar stable, ex. "#6366F1"
  status: AgentStatus;
  autonomyLevel: AutonomyLevel;
  tools: ToolSummary[];
  creditsThisMonth: number; // tokens équivalents (D6)
}

export interface ToolSummary {
  key: string; // "send_email"
  label: string; // "Envoyer un email"
  risk: RiskClass;
  policy: ToolPolicy;
  connectorKey?: string; // outil fourni par un connecteur, ex. "hubspot"
}

export type AgentNaming = "first_name_and_role" | "role_only";

/** Libellé à afficher selon le réglage de la suite */
export function agentLabel(agent: Agent, naming: AgentNaming): string {
  return naming === "first_name_and_role" ? `${agent.firstName} · ${agent.role}` : `Agent ${agent.role}`;
}

export interface Branding {
  clientName: string; // "Dupont & Associés"
  logoLightUrl?: string;
  logoDarkUrl?: string;
  accentColor?: string; // choisie dans une palette contrôlée
  showPoweredBy: boolean; // « Propulsé par Initiative IA »
}

export interface Suite {
  id: UUID; // id de l'équipe instanciée
  tenantId: UUID;
  name: string; // "Suite Commerciale"
  templateKey: string; // "commercial"
  status: TeamStatus;
  entryPoint: string; // "@lina" (coordinateur, reçoit les messages adressés à l'équipe)
  agents: Agent[];
  humans: User[];
  branding: Branding;
  agentNaming: AgentNaming;
  enabledViews: Array<"conversations" | "tasks" | "documents" | "activity">;
  welcomeMessage?: string;
  suggestedPrompts: string[];
  lastActivityAt: ISODateTime;
}

// ─────────────────────────────── Conversations ───────────────────────────────

export interface Conversation {
  id: UUID;
  teamId: UUID;
  title: string; // généré automatiquement, modifiable
  kind: "team" | "direct"; // à l'équipe (via le coordinateur) ou directe avec un agent
  directAgent?: string; // si kind = "direct"
  participants: string[]; // agents impliqués, ex. ["@lina", "@hugo"]
  createdBy: UUID;
  createdAt: ISODateTime;
  lastMessageAt: ISODateTime;
  hasPendingRequest: boolean; // point ambre
  hasNewDeliverable: boolean; // triangle bleu vert
}

/** Bloc « Travail en cours » : agrégé côté API à partir des événements (F-001 §9) */
export interface WorkInProgress {
  conversationId: UUID;
  status: "running" | "done" | "stopped" | "error";
  startedAt: ISODateTime;
  items: Array<{
    agent: string;
    label: string; // "rédige la proposition", "consulte le CRM"
    currentTool?: string;
    step: number;
    state: "working" | "waiting_human" | "done" | "error";
  }>;
}

// ─────────────────────────────── Messages ───────────────────────────────

export type Intent = "request" | "response" | "notification" | "instruction" | "acknowledgment";

export interface Attachment {
  path: string;
  description?: string;
  mimeType?: string;
}

export interface AgentMessage {
  id: UUID;
  teamId: UUID;
  conversationId: UUID;
  sender: string; // "@lina" ou "@human"
  senderUserId?: UUID; // si sender = "@human"
  recipients: string[];
  intent: Intent;
  content: string; // markdown
  attachments: Attachment[];
  inReplyTo?: UUID;
  taskId?: UUID;
  createdAt: ISODateTime;
  /** Détail technique repliable, agrégé côté API */
  trace?: {
    steps: number;
    tools: Array<{ key: string; durationMs: number; ok: boolean }>;
    credits: number;
    durationMs: number;
  };
}

// ─────────────────────────────── Demandes humaines (F-001 §6bis) ───────────────────────────────

export type HumanRequestType = "question" | "tool_approval" | "message_approval";
export type HumanRequestStatus = "pending" | "reminded" | "escalated" | "answered" | "expired" | "cancelled";
export type Urgency = "low" | "normal" | "high";
export type Decision = "approve" | "reject" | "edit_and_approve";

interface HumanRequestBase {
  id: UUID;
  teamId: UUID;
  conversationId: UUID;
  suiteName: string;
  agent: string; // "@lina"
  type: HumanRequestType;
  status: HumanRequestStatus;
  assignees: UUID[];
  urgency: Urgency;
  createdAt: ISODateTime;
  dueAt: ISODateTime;
  remindersSent: number;
  resolvedBy?: UUID;
  resolvedAt?: ISODateTime;
  taskId?: UUID;
}

export interface QuestionRequest extends HumanRequestBase {
  type: "question";
  question: string;
  context: string;
  options: string[];
  recommendation?: string;
  blocking: boolean;
  answer?: { text?: string; option?: string };
}

export interface ToolApprovalRequest extends HumanRequestBase {
  type: "tool_approval";
  tool: ToolSummary;
  /** Aperçu lisible de l'effet, calculé côté API */
  effectPreview: {
    title: string; // "Envoyer un email à jean@dupont.be"
    fields: Array<{ label: string; value: string; editable: boolean; multiline?: boolean }>;
  };
  arguments: Record<string, unknown>;
  decision?: { decision: Decision; comment?: string; editedArguments?: Record<string, unknown> };
}

export interface MessageApprovalRequest extends HumanRequestBase {
  type: "message_approval";
  message: AgentMessage;
  gateReason: string;
  decision?: { decision: Decision; comment?: string; editedContent?: string };
}

export type HumanRequest = QuestionRequest | ToolApprovalRequest | MessageApprovalRequest;

// ─────────────────────────────── Tâches, documents, activité ───────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "blocked" | "in_review" | "done";

export interface Task {
  id: UUID;
  teamId: UUID;
  title: string;
  description: string;
  assignee?: string;
  status: TaskStatus;
  acceptanceCriteria: string[];
  dependsOn: UUID[];
  credits: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DocumentItem {
  path: string;
  teamId: UUID;
  title: string;
  mimeType: string;
  author: string; // "@lina" ou id utilisateur
  taskId?: UUID;
  messageId?: UUID;
  sizeBytes: number;
  updatedAt: ISODateTime;
}

export interface ActivityEvent {
  seq: number;
  teamId: UUID;
  type: string; // ex. "task.created", "human_request.answered" (F-001 §9)
  actor: string;
  summary: string; // phrase lisible générée côté API
  createdAt: ISODateTime;
}

// ─────────────────────────────── Consommation (F-001 §11) ───────────────────────────────

export interface UsageSummary {
  tenantId: UUID;
  month: string; // "2026-10"
  creditsIncluded: number;
  creditsUsed: number;
  projectedEndOfMonth: number;
  bySuite: Array<{ suiteId: UUID; name: string; credits: number }>;
  byAgent: Array<{ agent: string; suiteId: UUID; credits: number }>;
  /** Back-office uniquement */
  realCostEur?: number;
  cacheRatio?: number;
  fallbackRate?: number;
}

// ─────────────────────────────── Back-office : harnais et versions (F-001 §4.5) ───────────────────────────────

export type InheritedFrom = "platform_profile" | "tenant_profile" | "agent" | "team_member";

export interface HarnessField<T> {
  value: T;
  inheritedFrom: InheritedFrom;
  overridden: boolean;
  cap?: T; // plafond plateforme ou forfait
  locked?: boolean;
}

export interface HarnessView {
  profile: "autonome" | "supervise" | "strict";
  model: { alias: HarnessField<ModelAlias>; temperature: HarnessField<number>; reasoningEffort: HarnessField<"low" | "medium" | "high"> };
  loop: { maxStepsPerTurn: HarnessField<number>; maxOutputTokensPerCall: HarnessField<number>; parallelToolCalls: HarnessField<boolean> };
  context: { compactionThreshold: HarnessField<number>; keepLastExchanges: HarnessField<number>; teamSummary: HarnessField<boolean> };
  budget: { maxTokensPerTask: HarnessField<number> };
  autonomy: { level: HarnessField<AutonomyLevel>; toolPolicies: Record<RiskClass, HarnessField<ToolPolicy>>; askWhenUncertain: HarnessField<boolean> };
  humanInTheLoop: {
    defaultAssignee: HarnessField<string>;
    channels: HarnessField<Array<"in_app" | "email">>;
    reminderAfter: HarnessField<ISODuration>;
    timeout: HarnessField<ISODuration>;
    onTimeout: HarnessField<"escalate" | "proceed_with_recommendation" | "abandon_task">;
    escalateTo: HarnessField<string>;
    maxOpenRequests: HarnessField<number>;
  };
  guardrails: Array<{ key: string; label: string; enabled: boolean; params: Record<string, unknown> }>;
  effectiveHash: string;
}

export type SuiteVersionStatus = "draft" | "published" | "archived";

export interface SuiteVersion {
  suiteId: UUID;
  version: number;
  status: SuiteVersionStatus;
  author: string;
  notes?: string;
  createdAt: ISODateTime;
  publishedAt?: ISODateTime;
}

// ─────────────────────────────── Connecteurs (F-007) ───────────────────────────────

export type ConnectorCategory = "crm" | "email" | "calendar" | "documents" | "helpdesk" | "accounting" | "code" | "other";
export type ConnectionStatus = "not_connected" | "pending_invite" | "connected" | "expired" | "error";
export type ConnectionScope = "shared" | "per_user"; // un compte pour toute l'équipe, ou un compte par collaborateur
export type AccessLevel = "read" | "read_write";

/** Type d'outil disponible au catalogue (HubSpot, Gmail…) */
export interface ConnectorType {
  key: string; // "hubspot"
  name: string; // "HubSpot"
  category: ConnectorCategory;
  logoUrl?: string;
  authMethod: "oauth" | "api_key";
  defaultScope: ConnectionScope;
  tools: ToolSummary[]; // outils que ce connecteur apporte aux agents
}

/** Connexion d'un client à un outil */
export interface Connection {
  id: UUID;
  tenantId: UUID;
  connectorKey: string;
  scope: ConnectionScope;
  status: ConnectionStatus;
  accountLabel?: string; // "dupont-associes.hubspot.com" ou "sophie@dupont.be"
  ownerUserId?: UUID; // si per_user
  grantedAccess: AccessLevel; // ce que le client a autorisé
  connectedBy?: UUID;
  connectedAt?: ISODateTime;
  expiresAt?: ISODateTime;
  lastError?: string;
  usedByAgents: string[]; // ["@nora"]
  requiredBySuites: UUID[];
}

/** Restriction propre à un agent sur un connecteur (peut être plus stricte que l'accès accordé) */
export interface AgentConnectorAccess {
  agent: string;
  connectorKey: string;
  access: AccessLevel;
  sendAs?: "connected_user" | "shared_account"; // depuis quel compte part l'action
}

// ─────────────────────────────── Base de connaissances ───────────────────────────────

export type KnowledgeStatus = "processing" | "ready" | "error" | "outdated";

export interface KnowledgeDocument {
  id: UUID;
  tenantId: UUID;
  suiteId?: UUID; // absent = partagé par toutes les suites du client
  title: string; // "Grille tarifaire 2026"
  category: "products" | "pricing" | "templates" | "legal" | "procedures" | "other";
  source: "upload" | "connector";
  connectorKey?: string; // ex. synchronisé depuis SharePoint
  mimeType: string;
  status: KnowledgeStatus;
  usedByAgents: string[];
  updatedAt: ISODateTime;
  reviewBefore?: ISODateTime; // date de revue conseillée
}

// ─────────────────────────────── Démarrage d'une suite ───────────────────────────────

export interface OnboardingStep {
  key: string; // "connect_crm"
  label: string; // "Connecter votre CRM"
  description: string; // "Nora en a besoin pour suivre vos opportunités."
  done: boolean;
  blocksAgents: string[]; // agents en attente tant que l'étape n'est pas faite
  action: { kind: "connect" | "upload" | "invite" | "conversation"; target?: string };
}
