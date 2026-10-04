import {
  type HumanRequest,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"

const pendingStatuses = ["pending", "reminded", "escalated"] as const

export function isPendingRequest(request: HumanRequest) {
  return pendingStatuses.some((status) => status === request.status)
}

export function pendingRequestsForUser(
  requests: HumanRequest[],
  userId: User["id"],
) {
  return requests.filter(
    (request) =>
      isPendingRequest(request) && request.assignees.includes(userId),
  )
}

export function pendingItemCount(
  requests: HumanRequest[],
  currentUser: User,
  suite: Suite,
) {
  const connectionRequired = suite.agents.some(
    (agent) =>
      agent.status === "waiting_connection" ||
      (agent.status === "idle" &&
        agent.tools.some((tool) => tool.connectorKey === "gmail")),
  )
  return (
    pendingRequestsForUser(requests, currentUser.id).length +
    Number(connectionRequired)
  )
}

export function humanRequestTitle(request: HumanRequest) {
  if (request.type === "question") return request.question
  if (request.type === "tool_approval") return request.effectPreview.title
  return fr.humanRequest.firstEmailTitle
}

export function reminderCountLabel(count: number) {
  return `${count} ${
    count === 1 ? fr.humanRequest.reminder : fr.humanRequest.reminders
  }`
}
