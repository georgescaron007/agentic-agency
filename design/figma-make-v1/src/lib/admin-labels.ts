import type {
  AutonomyLevel,
  HarnessView,
  ISODuration,
  KnowledgeDocument,
  KnowledgeStatus,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"

const autonomyLabels: Record<AutonomyLevel, string> = {
  autonomous: fr.agentEditor.autonomous,
  supervised: fr.agentEditor.supervised,
  strict: fr.agentEditor.strict,
}

const profileLabels: Record<HarnessView["profile"], string> = {
  autonome: fr.agentEditor.autonomous,
  supervise: fr.agentEditor.supervised,
  strict: fr.agentEditor.strict,
}

const timeoutActionLabels: Record<string, string> = {
  escalate: fr.agentEditor.escalate,
  proceed_with_recommendation: fr.agentEditor.applyRecommendation,
  abandon_task: fr.agentEditor.pauseTask,
}

const durationLabels: Record<string, string> = {
  PT4H: fr.agentEditor.fourHours,
  P2D: fr.agentEditor.twoDays,
}

const channelLabels: Record<string, string> = {
  in_app: fr.agentEditor.application,
  email: fr.agentEditor.email,
}

const departmentLabels: Record<string, string> = {
  commercial: fr.admin.commercial,
  technique: fr.admin.technique,
  service_client: fr.admin.customerService,
  rh: fr.admin.hr,
  administratif: fr.admin.administrative,
}

const reasoningLabels: Record<string, string> = {
  low: fr.agentEditor.reasoningLow,
  medium: fr.agentEditor.reasoningMedium,
  high: fr.agentEditor.reasoningHigh,
}

const toolPolicyLabels: Record<string, string> = {
  auto: fr.agentEditor.automatic,
  ask: fr.agentEditor.ask,
  forbid: fr.agentEditor.forbid,
}

const connectorLabels: Record<string, string> = {
  sharepoint: "SharePoint",
  gmail: "Gmail",
  hubspot: "HubSpot",
}

const knowledgeStatusLabels: Record<KnowledgeStatus, string> = {
  ready: fr.knowledge.ready,
  processing: fr.knowledge.processing,
  outdated: fr.knowledge.outdated,
  error: fr.knowledge.error,
}

const knowledgeCategoryLabels: Record<
  KnowledgeDocument["category"],
  string
> = {
  pricing: fr.knowledge.pricing,
  templates: fr.knowledge.templates,
  legal: fr.knowledge.legal,
  products: fr.knowledge.products,
  procedures: fr.knowledge.procedures,
  other: fr.knowledge.other,
}

export function autonomyLabel(value: AutonomyLevel) {
  return autonomyLabels[value]
}

export function profileLabel(value: HarnessView["profile"]) {
  return profileLabels[value]
}

export function timeoutActionLabel(value: string) {
  return timeoutActionLabels[value] ?? value
}

export function durationLabel(value: ISODuration) {
  return durationLabels[value] ?? value
}

export function channelLabel(value: string) {
  return channelLabels[value] ?? value
}

export function departmentLabel(value: string) {
  return departmentLabels[value] ?? value
}

export function connectorLabel(value?: string) {
  if (!value) return ""
  return connectorLabels[value.toLowerCase()] ?? value
}

export function toolPolicyLabel(value: string) {
  return toolPolicyLabels[value] ?? value
}

export function knowledgeStatusLabel(value: KnowledgeStatus) {
  return knowledgeStatusLabels[value]
}

export function knowledgeCategoryLabel(
  value: KnowledgeDocument["category"],
) {
  return knowledgeCategoryLabels[value]
}

export function adminValueLabel(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? fr.agentEditor.enabled : fr.agentEditor.disabled
  }
  if (typeof value === "string") {
    if (value in autonomyLabels) {
      return autonomyLabel(value as AutonomyLevel)
    }
    if (value in profileLabels) {
      return profileLabel(value as HarnessView["profile"])
    }
    if (value in timeoutActionLabels) return timeoutActionLabel(value)
    if (value in durationLabels) return durationLabel(value)
    if (value in channelLabels) return channelLabel(value)
    if (value in departmentLabels) return departmentLabel(value)
    if (value in reasoningLabels) return reasoningLabels[value]
    if (value in toolPolicyLabels) return toolPolicyLabel(value)
  }
  if (Array.isArray(value)) return value.map(channelLabel).join(", ")
  return String(value)
}
