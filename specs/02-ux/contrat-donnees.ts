/**
 * Contrat de données de l'interface — Initiative IA
 * Version 0.2 · 2026-10-03 (conversations, marque blanche, nommage des agents)
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
export type AgentStatus = "working" | "waiting_human" | "idle" | "paused" | "error";

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

// ─────────────────────────────── Données fictives (mocks/) ───────────────────────────────

export const mockTenant: Tenant = {
  id: "t-0001",
  name: "Dupont & Associés",
  plan: "small_team",
  status: "active",
  maxUsers: 10,
};

export const mockUsers: User[] = [
  { id: "u-01", tenantId: "t-0001", name: "Marc Dupont", email: "marc@dupont.be", role: "owner", active: true },
  { id: "u-02", tenantId: "t-0001", name: "Sophie Martin", email: "sophie@dupont.be", role: "member", active: true },
];

export const mockSuite: Suite = {
  id: "team-commercial-01",
  tenantId: "t-0001",
  name: "Suite Commerciale",
  templateKey: "commercial",
  status: "running",
  entryPoint: "@lina",
  humans: mockUsers,
  branding: { clientName: "Dupont & Associés", showPoweredBy: true },
  agentNaming: "first_name_and_role",
  enabledViews: ["conversations", "tasks", "documents", "activity"],
  welcomeMessage: "Bonjour ! Vos agents commerciaux sont prêts. Confiez-leur une prospection, une proposition ou un suivi.",
  suggestedPrompts: [
    "Prépare une proposition pour Dupont SA à partir du dernier échange",
    "Liste les 10 prospects à relancer cette semaine",
    "Résume les opportunités ouvertes dans le CRM",
  ],
  lastActivityAt: "2026-10-03T14:12:00Z",
  agents: [
    {
      name: "@lina", firstName: "Lina", role: "Coordination commerciale", cardKey: "coordination",
      department: "commercial", description: "Reçoit vos demandes, répartit le travail et vous rend compte.",
      color: "#6366F1", status: "waiting_human", autonomyLevel: "supervised", creditsThisMonth: 1_240_000,
      tools: [
        { key: "create_task", label: "Créer une tâche", risk: "write_internal", policy: "auto" },
        { key: "ask_human", label: "Vous poser une question", risk: "write_internal", policy: "auto" },
      ],
    },
    {
      name: "@hugo", firstName: "Hugo", role: "Rédaction de propositions", cardKey: "redaction",
      department: "commercial", description: "Rédige propositions, devis et emails.",
      color: "#0EA5E9", status: "working", autonomyLevel: "supervised", creditsThisMonth: 3_870_000,
      tools: [
        { key: "write_file", label: "Écrire un document", risk: "write_internal", policy: "auto" },
        { key: "send_email", label: "Envoyer un email", risk: "irreversible", policy: "ask" },
      ],
    },
    {
      name: "@nora", firstName: "Nora", role: "Suivi CRM", cardKey: "crm",
      department: "commercial", description: "Met à jour le CRM et prépare les relances.",
      color: "#10B981", status: "idle", autonomyLevel: "strict", creditsThisMonth: 610_000,
      tools: [
        { key: "crm_read", label: "Consulter le CRM", risk: "read", policy: "auto" },
        { key: "crm_update", label: "Modifier une fiche CRM", risk: "write_external", policy: "ask" },
      ],
    },
  ],
};

export const mockMessages: AgentMessage[] = [
  {
    id: "m-01", teamId: "team-commercial-01", conversationId: "conv-01", sender: "@human", senderUserId: "u-02", recipients: ["@lina"],
    intent: "request", content: "Prépare une proposition pour Dupont SA à partir de notre dernier échange.",
    attachments: [], createdAt: "2026-10-03T13:58:00Z",
  },
  {
    id: "m-02", teamId: "team-commercial-01", conversationId: "conv-01", sender: "@lina", recipients: ["@human"], intent: "acknowledgment",
    content: "Bien reçu Sophie. Je confie la rédaction à Hugo et je reviens vers vous si un point est ambigu.",
    attachments: [], inReplyTo: "m-01", taskId: "task-01", createdAt: "2026-10-03T13:58:20Z",
    trace: { steps: 3, tools: [{ key: "create_task", durationMs: 40, ok: true }], credits: 18_400, durationMs: 6_200 },
  },
  {
    id: "m-03", teamId: "team-commercial-01", conversationId: "conv-01", sender: "@lina", recipients: ["@hugo"], intent: "instruction",
    content: "Rédige une proposition commerciale pour Dupont SA. Base-toi sur le compte rendu du 28/09 joint.",
    attachments: [{ path: "inputs/cr-dupont-2809.md", description: "Compte rendu de réunion" }],
    taskId: "task-01", createdAt: "2026-10-03T13:58:25Z",
  },
];

export const mockRequests: HumanRequest[] = [
  {
    id: "hr-01", teamId: "team-commercial-01", conversationId: "conv-01", suiteName: "Suite Commerciale", agent: "@lina", type: "question",
    status: "pending", assignees: ["u-02"], urgency: "normal", createdAt: "2026-10-03T14:05:00Z",
    dueAt: "2026-10-05T14:05:00Z", remindersSent: 0, taskId: "task-01",
    question: "Quelle remise appliquer pour Dupont SA ?",
    context: "Le compte rendu mentionne « un geste commercial » sans chiffre. Nos propositions récentes vont de 5 % à 10 %.",
    options: ["Aucune remise", "5 %", "10 %"], recommendation: "5 %, cohérent avec les deux dernières propositions acceptées.",
    blocking: true,
  },
  {
    id: "hr-02", teamId: "team-commercial-01", conversationId: "conv-02", suiteName: "Suite Commerciale", agent: "@hugo", type: "tool_approval",
    status: "pending", assignees: ["u-01"], urgency: "high", createdAt: "2026-10-03T14:10:00Z",
    dueAt: "2026-10-04T14:10:00Z", remindersSent: 1, taskId: "task-02",
    tool: { key: "send_email", label: "Envoyer un email", risk: "irreversible", policy: "ask" },
    effectPreview: {
      title: "Envoyer un email à jean.leroy@dupont-sa.be",
      fields: [
        { label: "À", value: "jean.leroy@dupont-sa.be", editable: true },
        { label: "Objet", value: "Votre proposition commerciale — octobre 2026", editable: true },
        { label: "Message", value: "Bonjour Monsieur Leroy,\n\nVeuillez trouver ci-joint notre proposition…", editable: true, multiline: true },
        { label: "Pièce jointe", value: "proposition-dupont-sa-v1.pdf", editable: false },
      ],
    },
    arguments: { to: "jean.leroy@dupont-sa.be", subject: "Votre proposition commerciale — octobre 2026" },
  },
];

export const mockTasks: Task[] = [
  {
    id: "task-01", teamId: "team-commercial-01", title: "Proposition commerciale Dupont SA",
    description: "Rédiger la proposition à partir du compte rendu du 28/09.", assignee: "@hugo", status: "blocked",
    acceptanceCriteria: ["Reprend les 3 besoins exprimés", "Prix et remise validés", "PDF prêt à envoyer"],
    dependsOn: [], credits: 412_000, createdAt: "2026-10-03T13:58:20Z", updatedAt: "2026-10-03T14:05:00Z",
  },
];

export const mockUsage: UsageSummary = {
  tenantId: "t-0001", month: "2026-10", creditsIncluded: 15_000_000, creditsUsed: 5_720_000, projectedEndOfMonth: 13_900_000,
  bySuite: [{ suiteId: "team-commercial-01", name: "Suite Commerciale", credits: 5_720_000 }],
  byAgent: [
    { agent: "@hugo", suiteId: "team-commercial-01", credits: 3_870_000 },
    { agent: "@lina", suiteId: "team-commercial-01", credits: 1_240_000 },
    { agent: "@nora", suiteId: "team-commercial-01", credits: 610_000 },
  ],
};

export const mockConversations: Conversation[] = [
  {
    id: "conv-01", teamId: "team-commercial-01", title: "Proposition Dupont SA", kind: "team",
    participants: ["@lina", "@hugo", "@nora"], createdBy: "u-02", createdAt: "2026-10-03T13:58:00Z",
    lastMessageAt: "2026-10-03T14:05:00Z", hasPendingRequest: true, hasNewDeliverable: false,
  },
  {
    id: "conv-02", teamId: "team-commercial-01", title: "Envoi de la proposition à M. Leroy", kind: "direct",
    directAgent: "@hugo", participants: ["@hugo"], createdBy: "u-01", createdAt: "2026-10-03T14:08:00Z",
    lastMessageAt: "2026-10-03T14:10:00Z", hasPendingRequest: true, hasNewDeliverable: true,
  },
  {
    id: "conv-03", teamId: "team-commercial-01", title: "Prospects à relancer cette semaine", kind: "team",
    participants: ["@lina", "@nora"], createdBy: "u-02", createdAt: "2026-10-01T09:12:00Z",
    lastMessageAt: "2026-10-01T09:40:00Z", hasPendingRequest: false, hasNewDeliverable: false,
  },
];

export const mockWorkInProgress: WorkInProgress = {
  conversationId: "conv-01",
  status: "running",
  startedAt: "2026-10-03T13:58:25Z",
  items: [
    { agent: "@hugo", label: "rédige la proposition", currentTool: "write_file", step: 3, state: "working" },
    { agent: "@nora", label: "vérifie l'historique CRM de Dupont SA", step: 2, state: "done" },
    { agent: "@lina", label: "attend votre réponse sur la remise", step: 4, state: "waiting_human" },
  ],
};
