import type { Agent, UsageSummary, User } from "@/contrat-donnees"

const baseAgent: Pick<Agent, "department" | "description" | "autonomyLevel" | "tools" | "creditsThisMonth"> =
  {
    department: "commercial",
    description:
      "Accompagne l’équipe commerciale dans ses tâches quotidiennes.",
    autonomyLevel: "supervised",
    tools: [],
    creditsThisMonth: 0,
  }

export const designAgents: Agent[] = [
  {
    ...baseAgent,
    name: "@lina",
    firstName: "Lina",
    role: "Coordination",
    cardKey: "coordination",
    color: "#0B2545",
    status: "working",
  },
  {
    ...baseAgent,
    name: "@hugo",
    firstName: "Hugo",
    role: "Propositions",
    cardKey: "redaction",
    color: "#14B8A6",
    status: "waiting_human",
  },
  {
    ...baseAgent,
    name: "@nora",
    firstName: "Nora",
    role: "Suivi CRM",
    cardKey: "crm",
    color: "#3B82F6",
    status: "idle",
  },
  {
    ...baseAgent,
    name: "@milo",
    firstName: "Milo",
    role: "Qualification",
    cardKey: "qualification",
    color: "#6B7280",
    status: "paused",
  },
  {
    ...baseAgent,
    name: "@ines",
    firstName: "Inès",
    role: "Analyse",
    cardKey: "analyse",
    color: "#0B2545",
    status: "error",
  },
]

export const designUser: User = {
  id: "u-design-01",
  tenantId: "t-design-01",
  name: "Sophie Martin",
  email: "sophie@dupont.be",
  role: "member",
  active: true,
}

export const usageWithinPlan: UsageSummary = {
  tenantId: "t-design-01",
  month: "2026-10",
  creditsIncluded: 15_000_000,
  creditsUsed: 10_800_000,
  projectedEndOfMonth: 13_900_000,
  bySuite: [],
  byAgent: [],
}

export const usageExceeded: UsageSummary = {
  tenantId: "t-design-01",
  month: "2026-10",
  creditsIncluded: 15_000_000,
  creditsUsed: 16_240_000,
  projectedEndOfMonth: 18_600_000,
  bySuite: [],
  byAgent: [],
}
