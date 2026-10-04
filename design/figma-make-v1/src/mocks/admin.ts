import type {
  HarnessView,
  HumanRequest,
  Suite,
  SuiteVersion,
  Tenant,
  UsageSummary,
  User,
} from "@/contrat-donnees"
import { mockRequests, mockSuite, mockUsage } from "@/mocks/platform"

export const adminRequests: HumanRequest[] = [
  ...mockRequests,
  {
    ...mockRequests[0],
    id: "hr-admin-expired-01",
    status: "expired",
    dueAt: "2026-10-01T11:00:00Z",
  },
]

export const adminTenants: Tenant[] = [
  {
    id: "t-0001",
    name: "Dupont & Associés",
    plan: "small_team",
    status: "active",
    maxUsers: 10,
  },
  {
    id: "t-0002",
    name: "Atelier Nova",
    plan: "business",
    status: "active",
    maxUsers: 25,
  },
  {
    id: "t-0003",
    name: "Maison Delcourt",
    plan: "small_team",
    status: "trial",
    maxUsers: 10,
  },
  {
    id: "t-0004",
    name: "Kanso Services",
    plan: "business",
    status: "suspended",
    maxUsers: 25,
  },
]

export const adminUsers: User[] = [
  ...mockSuite.humans,
  {
    id: "u-21",
    tenantId: "t-0002",
    name: "Émilie Laurent",
    email: "emilie@atelier-nova.be",
    role: "owner",
    active: true,
  },
  {
    id: "u-22",
    tenantId: "t-0002",
    name: "Thomas Leroy",
    email: "thomas@atelier-nova.be",
    role: "member",
    active: true,
  },
  {
    id: "u-31",
    tenantId: "t-0003",
    name: "Claire Delcourt",
    email: "claire@delcourt.be",
    role: "owner",
    active: true,
  },
  {
    id: "u-41",
    tenantId: "t-0004",
    name: "Nicolas Petit",
    email: "nicolas@kanso.be",
    role: "owner",
    active: false,
  },
]

function suiteForTenant(
  id: string,
  tenantId: string,
  name: string,
  templateKey: string,
  lastActivityAt: string,
): Suite {
  return {
    ...mockSuite,
    id,
    tenantId,
    name,
    templateKey,
    branding: {
      ...mockSuite.branding,
      clientName:
        adminTenants.find((tenant) => tenant.id === tenantId)?.name ?? name,
    },
    lastActivityAt,
  }
}

export const adminSuites: Suite[] = [
  mockSuite,
  suiteForTenant(
    "team-nova-service-01",
    "t-0002",
    "Suite Service client",
    "service_client",
    "2026-10-03T15:42:00Z",
  ),
  suiteForTenant(
    "team-nova-rh-01",
    "t-0002",
    "Suite RH",
    "rh",
    "2026-10-03T12:15:00Z",
  ),
  suiteForTenant(
    "team-delcourt-admin-01",
    "t-0003",
    "Suite Administrative",
    "administratif",
    "2026-10-02T16:05:00Z",
  ),
  suiteForTenant(
    "team-kanso-tech-01",
    "t-0004",
    "Suite Technique",
    "technique",
    "2026-09-28T09:30:00Z",
  ),
]

export const adminUsage: UsageSummary[] = [
  {
    ...mockUsage,
    realCostEur: 2.7,
    cacheRatio: 0.42,
    fallbackRate: 0.018,
  },
  {
    tenantId: "t-0002",
    month: "2026-10",
    creditsIncluded: 40_000_000,
    creditsUsed: 34_400_000,
    projectedEndOfMonth: 38_200_000,
    bySuite: [
      {
        suiteId: "team-nova-service-01",
        name: "Suite Service client",
        credits: 21_000_000,
      },
      {
        suiteId: "team-nova-rh-01",
        name: "Suite RH",
        credits: 13_400_000,
      },
    ],
    byAgent: [
      {
        agent: "@lina",
        suiteId: "team-nova-service-01",
        credits: 15_800_000,
      },
      {
        agent: "@hugo",
        suiteId: "team-nova-rh-01",
        credits: 11_200_000,
      },
    ],
    realCostEur: 16.4,
    cacheRatio: 0.28,
    fallbackRate: 0.074,
  },
  {
    tenantId: "t-0003",
    month: "2026-10",
    creditsIncluded: 15_000_000,
    creditsUsed: 4_100_000,
    projectedEndOfMonth: 8_900_000,
    bySuite: [
      {
        suiteId: "team-delcourt-admin-01",
        name: "Suite Administrative",
        credits: 4_100_000,
      },
    ],
    byAgent: [],
    realCostEur: 1.9,
    cacheRatio: 0.51,
    fallbackRate: 0.009,
  },
  {
    tenantId: "t-0004",
    month: "2026-10",
    creditsIncluded: 40_000_000,
    creditsUsed: 7_200_000,
    projectedEndOfMonth: 7_200_000,
    bySuite: [
      {
        suiteId: "team-kanso-tech-01",
        name: "Suite Technique",
        credits: 7_200_000,
      },
    ],
    byAgent: [],
    realCostEur: 3.4,
    cacheRatio: 0.36,
    fallbackRate: 0.031,
  },
]

export const adminInfrastructureCostEur = 30

export const adminDailyCostsEur = [2.4, 3.1, 2.8, 3.5, 3.7, 4.1, 4.8]

export const adminPerformance = {
  firstTokenP95Ms: 780,
  agentTurnP95Seconds: 42,
}

export const adminSuiteVersions: SuiteVersion[] = adminSuites.flatMap(
  (suite, index) => [
    {
      suiteId: suite.id,
      version: index + 2,
      status: "published",
      author: "Léa Bernard",
      notes: "Version actuellement utilisée en production.",
      createdAt: "2026-09-24T10:00:00Z",
      publishedAt: "2026-09-25T14:30:00Z",
    },
    ...(index < 2
      ? [
          {
            suiteId: suite.id,
            version: index + 3,
            status: "draft" as const,
            author: "Léa Bernard",
            notes: "Ajustement du comportement des agents.",
            createdAt: "2026-10-02T09:15:00Z",
          },
        ]
      : []),
  ],
)

function modelSuite(
  id: string,
  name: string,
  templateKey: string,
  welcomeMessage: string,
  agentRoles: string[],
): Suite {
  return {
    ...mockSuite,
    id,
    tenantId: "template",
    name,
    templateKey,
    humans: [],
    branding: {
      clientName: "Initiative IA",
      showPoweredBy: false,
    },
    welcomeMessage,
    agents: agentRoles.map((role, index) => ({
      ...mockSuite.agents[index % mockSuite.agents.length],
      name: `@agent-${templateKey}-${index + 1}`,
      firstName: ["Lina", "Hugo", "Nora", "Milo"][index] ?? `Agent ${index + 1}`,
      role,
      department: templateKey,
      cardKey: index === 0 ? "coordination" : index === 1 ? "redaction" : "crm",
    })),
  }
}

export const adminSuiteModels: Suite[] = [
  modelSuite(
    "model-technique",
    "Technique",
    "technique",
    "Diagnostic, documentation et assistance aux équipes techniques.",
    ["Coordination technique", "Diagnostic", "Documentation"],
  ),
  modelSuite(
    "model-commercial",
    "Commercial",
    "commercial",
    "Prospection, propositions commerciales et suivi CRM.",
    ["Coordination commerciale", "Rédaction de propositions", "Suivi CRM"],
  ),
  modelSuite(
    "model-service-client",
    "Service client",
    "service_client",
    "Qualification et résolution des demandes clients.",
    ["Coordination support", "Qualification", "Résolution"],
  ),
  modelSuite(
    "model-rh",
    "Ressources humaines",
    "rh",
    "Recrutement, intégration et réponses aux collaborateurs.",
    ["Coordination RH", "Recrutement", "Administration RH"],
  ),
  modelSuite(
    "model-administratif",
    "Administratif",
    "administratif",
    "Traitement documentaire, suivi et préparation administrative.",
    ["Coordination administrative", "Documents", "Suivi"],
  ),
]

export const mockHarnessView: HarnessView = {
  profile: "supervise",
  model: {
    alias: {
      value: "ak-reason",
      inheritedFrom: "platform_profile",
      overridden: false,
      locked: false,
    },
    temperature: {
      value: 0.3,
      inheritedFrom: "agent",
      overridden: true,
      cap: 0.8,
    },
    reasoningEffort: {
      value: "medium",
      inheritedFrom: "platform_profile",
      overridden: false,
    },
  },
  loop: {
    maxStepsPerTurn: {
      value: 26,
      inheritedFrom: "tenant_profile",
      overridden: true,
      cap: 24,
    },
    maxOutputTokensPerCall: {
      value: 4_096,
      inheritedFrom: "platform_profile",
      overridden: false,
      cap: 8_192,
    },
    parallelToolCalls: {
      value: true,
      inheritedFrom: "platform_profile",
      overridden: false,
    },
  },
  context: {
    compactionThreshold: {
      value: 0.72,
      inheritedFrom: "platform_profile",
      overridden: false,
      cap: 0.9,
    },
    keepLastExchanges: {
      value: 12,
      inheritedFrom: "agent",
      overridden: true,
      cap: 20,
    },
    teamSummary: {
      value: true,
      inheritedFrom: "platform_profile",
      overridden: false,
    },
  },
  budget: {
    maxTokensPerTask: {
      value: 850_000,
      inheritedFrom: "tenant_profile",
      overridden: true,
      cap: 1_000_000,
    },
  },
  autonomy: {
    level: {
      value: "supervised",
      inheritedFrom: "agent",
      overridden: true,
      locked: false,
    },
    toolPolicies: {
      read: {
        value: "auto",
        inheritedFrom: "platform_profile",
        overridden: false,
      },
      write_internal: {
        value: "auto",
        inheritedFrom: "agent",
        overridden: true,
      },
      write_external: {
        value: "ask",
        inheritedFrom: "platform_profile",
        overridden: false,
      },
      irreversible: {
        value: "ask",
        inheritedFrom: "platform_profile",
        overridden: false,
        locked: true,
      },
    },
    askWhenUncertain: {
      value: true,
      inheritedFrom: "platform_profile",
      overridden: false,
    },
  },
  humanInTheLoop: {
    defaultAssignee: {
      value: "u-01",
      inheritedFrom: "tenant_profile",
      overridden: false,
    },
    channels: {
      value: ["in_app", "email"],
      inheritedFrom: "tenant_profile",
      overridden: false,
    },
    reminderAfter: {
      value: "PT4H",
      inheritedFrom: "platform_profile",
      overridden: false,
    },
    timeout: {
      value: "P2D",
      inheritedFrom: "tenant_profile",
      overridden: true,
    },
    onTimeout: {
      value: "escalate",
      inheritedFrom: "platform_profile",
      overridden: false,
    },
    escalateTo: {
      value: "u-01",
      inheritedFrom: "tenant_profile",
      overridden: false,
    },
    maxOpenRequests: {
      value: 4,
      inheritedFrom: "agent",
      overridden: true,
      cap: 8,
    },
  },
  guardrails: [
    {
      key: "no_secrets",
      label: "Ne jamais exposer de secrets",
      enabled: true,
      params: {},
    },
    {
      key: "pii_filter",
      label: "Filtrer les données personnelles",
      enabled: true,
      params: { mode: "strict" },
    },
    {
      key: "domain_scope",
      label: "Rester dans le périmètre métier",
      enabled: true,
      params: { department: "commercial" },
    },
  ],
  effectiveHash: "sha256:8f2a7c9d14e6b5a0",
}

export const adminAuditEvents = [
  {
    seq: 501,
    teamId: "team-commercial-01",
    type: "suite.published",
    actor: "Léa Bernard",
    summary:
      "a publié la version 3 de Suite Commerciale — ajustement des validations d’envoi.",
    createdAt: "2026-10-03T16:20:00Z",
  },
  {
    seq: 500,
    teamId: "team-commercial-01",
    type: "support.accessed",
    actor: "Admin plateforme",
    summary:
      "a ouvert l’espace de Dupont & Associés en lecture seule — incident signalé sur une proposition.",
    createdAt: "2026-10-03T15:05:00Z",
  },
  {
    seq: 499,
    teamId: "team-nova-service-01",
    type: "harness.updated",
    actor: "Léa Bernard",
    summary:
      "a modifié max_open_requests de 6 à 4 — réduction des sollicitations humaines.",
    createdAt: "2026-10-03T11:42:00Z",
  },
  {
    seq: 498,
    teamId: "team-nova-rh-01",
    type: "guardrail.enabled",
    actor: "Admin plateforme",
    summary:
      "a activé le filtre de données personnelles — conformité demandée par le client.",
    createdAt: "2026-10-02T17:10:00Z",
  },
  {
    seq: 497,
    teamId: "team-commercial-01",
    type: "model_alias.updated",
    actor: "Léa Bernard",
    summary:
      "a remplacé ak-light par gpt-4.1-mini — amélioration du temps de réponse.",
    createdAt: "2026-10-02T09:25:00Z",
  },
] satisfies import("@/contrat-donnees").ActivityEvent[]
