import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit3,
  MessageSquareText,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react"

import { AgentAvatar, RiskBadge } from "@/components/foundations"
import { ConnectorLogo } from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  agentLabel,
  type Agent,
  type Decision,
  type Connection,
  type ConnectorType,
  type HumanRequest,
  type HumanRequestStatus,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

interface HumanRequestCardProps {
  request: HumanRequest
  suite: Suite
  users: User[]
  onResolved?: (decision: Decision | "answer") => void
  compact?: boolean
  connectorTypes?: ConnectorType[]
  connections?: Connection[]
}

const statusLabels: Record<HumanRequestStatus, string> = {
  pending: fr.humanRequest.statusPending,
  reminded: fr.humanRequest.statusReminded,
  escalated: fr.humanRequest.statusEscalated,
  answered: fr.humanRequest.statusAnswered,
  expired: fr.humanRequest.statusExpired,
  cancelled: fr.humanRequest.statusCancelled,
}

const statusStyles: Record<HumanRequestStatus, string> = {
  pending: "bg-waiting-soft text-waiting-strong",
  reminded: "bg-waiting-soft text-waiting-strong",
  escalated: "bg-danger-soft text-danger",
  answered: "bg-teal-soft text-teal-strong",
  expired: "bg-graphite-soft text-graphite",
  cancelled: "bg-graphite-soft text-graphite",
}

function formatResolvedDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatResolvedTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value))
}

function dueLabel(request: HumanRequest) {
  if (request.status === "expired") return fr.humanRequest.overdue
  const duration =
    new Date(request.dueAt).getTime() - new Date(request.createdAt).getTime()
  const hours = Math.max(1, Math.round(duration / 3_600_000))
  return `${fr.humanRequest.dueIn} ${hours} h`
}

function RequestMeta({
  request,
  users,
}: {
  request: HumanRequest
  users: User[]
}) {
  const resolvedBy = users.find((user) => user.id === request.resolvedBy)
  const reminderLabel =
    request.remindersSent === 0
      ? fr.humanRequest.noReminder
      : `${request.remindersSent} ${
          request.remindersSent === 1
            ? fr.humanRequest.reminder
            : fr.humanRequest.reminders
        }`

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-5 py-3 text-xs text-graphite sm:px-6">
      <span className="flex items-center gap-1.5 font-semibold">
        <Clock3 aria-hidden="true" className="size-3.5" />
        {dueLabel(request)}
      </span>
      <span className="flex items-center gap-1.5">
        <RefreshCw aria-hidden="true" className="size-3.5" />
        {reminderLabel}
      </span>
      {request.status === "answered" && request.resolvedAt && (
        <span className="ml-auto font-medium text-teal-strong">
          {fr.humanRequest.answeredBy}{" "}
          {resolvedBy?.name ?? fr.common.human} {fr.humanRequest.at}{" "}
          {formatResolvedDate(request.resolvedAt)}
        </span>
      )}
    </div>
  )
}

function RequestState({
  request,
  users,
}: {
  request: HumanRequest
  users: User[]
}) {
  if (
    request.status !== "answered" &&
    request.status !== "expired" &&
    request.status !== "cancelled"
  ) {
    return null
  }

  const resolvedBy = users.find((user) => user.id === request.resolvedBy)
  const content =
    request.status === "expired"
      ? fr.humanRequest.expiredDescription
      : request.status === "cancelled"
        ? fr.humanRequest.cancelledDescription
        : `${fr.humanRequest.resolvedDescription}${
            resolvedBy ? ` ${fr.humanRequest.answeredBy} ${resolvedBy.name}.` : ""
          }`

  return (
    <div
      className={cn(
        "mx-5 mb-5 flex items-start gap-3 rounded-lg p-4 text-sm sm:mx-6",
        request.status === "answered"
          ? "bg-teal-soft text-teal-strong"
          : "bg-graphite-soft text-graphite",
      )}
    >
      {request.status === "answered" ? (
        <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      ) : (
        <X aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      )}
      <p className="leading-6">{content}</p>
    </div>
  )
}

function QuestionContent({
  request,
  agent,
  onResolved,
}: {
  request: Extract<HumanRequest, { type: "question" }>
  agent?: Agent
  onResolved?: (decision: Decision | "answer") => void
}) {
  const [contextOpen, setContextOpen] = useState(false)
  const [answer, setAnswer] = useState("")
  const [selectedOption, setSelectedOption] = useState<string>()
  const actionable = !["answered", "expired", "cancelled"].includes(
    request.status,
  )

  return (
    <div className="px-5 pb-6 sm:px-6">
      <h2 className="max-w-2xl font-heading text-2xl font-bold leading-tight text-ink">
        {request.question}
      </h2>

      <Button
        variant="ghost"
        className="mt-3 h-8 px-0 text-xs text-graphite hover:bg-transparent"
        onClick={() => setContextOpen((value) => !value)}
      >
        {contextOpen ? (
          <ChevronUp aria-hidden="true" className="size-4" />
        ) : (
          <ChevronDown aria-hidden="true" className="size-4" />
        )}
        {contextOpen
          ? fr.humanRequest.hideContext
          : fr.humanRequest.showContext}
      </Button>

      {contextOpen && (
        <div className="mt-2 rounded-lg border border-line bg-paper p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-graphite">
            {fr.humanRequest.context}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink">{request.context}</p>
        </div>
      )}

      {request.recommendation && (
        <div className="mt-5 border-l-4 border-teal bg-teal-soft px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.humanRequest.recommendation}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-6 text-ink">
            {request.recommendation}
          </p>
        </div>
      )}

      {request.blocking && actionable && (
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-waiting-strong">
          <span className="size-2 rounded-full bg-waiting" />
          {agent?.firstName ?? fr.client.unknownAgent}{" "}
          {fr.humanRequest.blocking}
        </p>
      )}

      {actionable && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-graphite">
            {fr.humanRequest.chooseAnswer}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {request.options.map((option) => {
              const recommended = request.recommendation
                ?.trim()
                .startsWith(option)

              return (
                <Button
                  key={option}
                  variant={selectedOption === option ? "default" : "outline"}
                  className={cn(
                    recommended &&
                      "border-teal hover:border-teal hover:bg-teal-soft",
                  )}
                  onClick={() => {
                    setSelectedOption(option)
                    onResolved?.("answer")
                  }}
                >
                  {selectedOption === option && (
                    <Check aria-hidden="true" className="size-4" />
                  )}
                  {option}
                  {recommended && (
                    <span className="text-xs font-bold text-teal-strong">
                      {fr.humanRequest.recommendedOption}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-graphite">
              {fr.humanRequest.freeAnswer}
            </label>
            <Textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={fr.humanRequest.freeAnswerPlaceholder}
              className="mt-2"
            />
            <Button
              className="mt-3"
              disabled={!answer.trim()}
              onClick={() => onResolved?.("answer")}
            >
              {fr.humanRequest.sendAnswer}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ApprovalActionsProps {
  irreversible: boolean
  editing: boolean
  onEdit: () => void
  onResolved?: (decision: Decision | "answer") => void
}

function ApprovalActions({
  irreversible,
  editing,
  onEdit,
  onResolved,
}: ApprovalActionsProps) {
  const [confirmingIrreversible, setConfirmingIrreversible] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [comment, setComment] = useState("")

  if (confirmingIrreversible) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-soft p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-danger"
          />
          <div>
            <p className="text-sm font-bold text-danger">
              {fr.humanRequest.irreversibleTitle}
            </p>
            <p className="mt-1 text-xs leading-5 text-graphite">
              {fr.humanRequest.irreversibleDescription}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            className="bg-danger text-white hover:bg-danger/90"
            onClick={() => onResolved?.("approve")}
          >
            {fr.humanRequest.confirmIrreversible}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setConfirmingIrreversible(false)}
          >
            {fr.humanRequest.statusCancelled}
          </Button>
        </div>
      </div>
    )
  }

  if (rejecting) {
    return (
      <div className="rounded-lg border border-danger/25 bg-danger-soft p-4">
        <label className="text-sm font-bold text-danger">
          {fr.humanRequest.rejectComment}
        </label>
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={fr.humanRequest.rejectCommentPlaceholder}
          className="mt-2 bg-surface"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            className="bg-danger text-white hover:bg-danger/90"
            disabled={!comment.trim()}
            onClick={() => onResolved?.("reject")}
          >
            {fr.humanRequest.confirmReject}
          </Button>
          <Button variant="ghost" onClick={() => setRejecting(false)}>
            {fr.humanRequest.statusCancelled}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {irreversible && (
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-danger">
          <AlertTriangle aria-hidden="true" className="size-4" />
          {fr.humanRequest.noBulkAction}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            irreversible
              ? setConfirmingIrreversible(true)
              : onResolved?.("approve")
          }
        >
          <Check aria-hidden="true" className="size-4" />
          {fr.humanRequest.approve}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!editing) {
              onEdit()
              return
            }
            if (irreversible) {
              setConfirmingIrreversible(true)
              return
            }
            onResolved?.("edit_and_approve")
          }}
        >
          <Edit3 aria-hidden="true" className="size-4" />
          {fr.humanRequest.editAndApprove}
        </Button>
        <Button
          variant="ghost"
          className="text-danger hover:bg-danger-soft hover:text-danger"
          onClick={() => setRejecting(true)}
        >
          <X aria-hidden="true" className="size-4" />
          {fr.humanRequest.reject}
        </Button>
      </div>
    </div>
  )
}

function ToolApprovalContent({
  request,
  onResolved,
  connectorTypes = [],
  connections = [],
}: {
  request: Extract<HumanRequest, { type: "tool_approval" }>
  onResolved?: (decision: Decision | "answer") => void
  connectorTypes?: ConnectorType[]
  connections?: Connection[]
}) {
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState(() =>
    request.effectPreview.fields.map((field) => field.value),
  )
  const actionable = !["answered", "expired", "cancelled"].includes(
    request.status,
  )
  const connector = connectorTypes.find(
    (item) => item.key === request.tool.connectorKey,
  )
  const connection = connections.find(
    (item) =>
      item.connectorKey === request.tool.connectorKey &&
      item.status === "connected",
  )

  return (
    <div className="px-5 pb-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-2xl font-bold text-ink">
          {request.tool.label}
        </h2>
        <RiskBadge risk={request.tool.risk} />
      </div>
      {connector && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-paper p-3">
          <ConnectorLogo connector={connector} size="sm" />
          <p className="text-xs leading-5 text-graphite">
            {fr.connectors.sentFrom}{" "}
            <strong className="text-ink">
              {connection?.accountLabel ?? "—"}
            </strong>{" "}
            {fr.connectors.via}{" "}
            <strong className="text-ink">{connector.name}</strong>
          </p>
        </div>
      )}
      <div className="mt-5 overflow-hidden rounded-lg border border-line">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-graphite">
              {fr.humanRequest.effectPreview}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {request.effectPreview.title}
            </p>
          </div>
          {actionable && (
            <Button
              variant="ghost"
              className="h-8 text-xs text-action-strong"
              onClick={() => setEditing((value) => !value)}
            >
              <Edit3 aria-hidden="true" className="size-3.5" />
              {fr.humanRequest.edit}
            </Button>
          )}
        </div>
        <div className="divide-y divide-line">
          {request.effectPreview.fields.map((field, index) => (
            <div
              key={field.label}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[8rem_1fr]"
            >
              <p className="text-xs font-semibold text-graphite">
                {field.label}
              </p>
              {editing && field.editable ? (
                field.multiline ? (
                  <Textarea
                    value={values[index]}
                    onChange={(event) =>
                      setValues((current) =>
                        current.map((value, valueIndex) =>
                          valueIndex === index ? event.target.value : value,
                        ),
                      )
                    }
                    className="min-h-24"
                  />
                ) : (
                  <Input
                    value={values[index]}
                    onChange={(event) =>
                      setValues((current) =>
                        current.map((value, valueIndex) =>
                          valueIndex === index ? event.target.value : value,
                        ),
                      )
                    }
                  />
                )
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-5 text-ink">
                  {values[index]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      {actionable && (
        <div className="mt-5">
          <ApprovalActions
            irreversible={request.tool.risk === "irreversible"}
            editing={editing}
            onEdit={() => setEditing(true)}
            onResolved={onResolved}
          />
        </div>
      )}
    </div>
  )
}

function MessageApprovalContent({
  request,
  onResolved,
}: {
  request: Extract<HumanRequest, { type: "message_approval" }>
  onResolved?: (decision: Decision | "answer") => void
}) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(request.message.content)
  const actionable = !["answered", "expired", "cancelled"].includes(
    request.status,
  )

  return (
    <div className="px-5 pb-6 sm:px-6">
      <div
        role="heading"
        aria-level={2}
        className="font-heading text-2xl font-bold text-ink"
      >
        {fr.humanRequest.firstEmailTitle}
      </div>
      <div className="mt-5 rounded-lg border border-line bg-paper p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-graphite">
            {fr.humanRequest.recipient} ·{" "}
            <span className="normal-case text-ink">
              {request.message.recipients.join(", ")}
            </span>
          </p>
          {actionable && (
            <Button
              variant="ghost"
              className="h-8 text-xs text-action-strong"
              onClick={() => setEditing((value) => !value)}
            >
              <Edit3 aria-hidden="true" className="size-3.5" />
              {fr.humanRequest.edit}
            </Button>
          )}
        </div>
        {editing ? (
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="mt-3 min-h-40 bg-surface"
          />
        ) : (
          <p className="mt-3 whitespace-pre-wrap rounded-md bg-surface p-4 text-sm leading-6 text-ink">
            {content}
          </p>
        )}
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md bg-waiting-soft p-3 text-xs leading-5 text-waiting-strong">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong>{fr.humanRequest.ruleReason} :</strong> {request.gateReason}
        </p>
      </div>
      {actionable && (
        <div className="mt-5">
          <ApprovalActions
            irreversible={false}
            editing={editing}
            onEdit={() => setEditing(true)}
            onResolved={onResolved}
          />
        </div>
      )}
    </div>
  )
}

export default function HumanRequestCard({
  request,
  suite,
  users,
  onResolved,
  compact = false,
  connectorTypes = [],
  connections = [],
}: HumanRequestCardProps) {
  const [resolvedExpanded, setResolvedExpanded] = useState(false)
  const agent = useMemo(
    () => suite.agents.find((item) => item.name === request.agent),
    [request.agent, suite.agents],
  )
  const typeLabel =
    request.type === "question"
      ? fr.humanRequest.question
      : request.type === "tool_approval"
        ? fr.humanRequest.actionApproval
        : fr.humanRequest.messageApproval
  const resolvedAt = request.resolvedAt
  const collapsedAnsweredQuestion =
    compact &&
    request.type === "question" &&
    request.status === "answered" &&
    Boolean(resolvedAt)
  const resolvedBy = users.find((user) => user.id === request.resolvedBy)
  const answer =
    request.type === "question"
      ? request.answer?.option ?? request.answer?.text
      : undefined
  const answerSubject =
    request.type === "question" &&
    request.question.toLocaleLowerCase("fr").includes("remise")
      ? fr.humanRequest.discount
      : request.type === "question"
        ? request.question
        : ""
  const resolvedSummary =
    collapsedAnsweredQuestion && answer && resolvedAt
      ? `${answerSubject} : ${answer} — ${fr.humanRequest.answeredByLower} ${
          resolvedBy?.name.split(" ")[0] ?? fr.common.human
        } à ${formatResolvedTime(resolvedAt)}`
      : ""

  if (collapsedAnsweredQuestion && !resolvedExpanded) {
    return (
      <article className="overflow-hidden rounded-lg border border-teal/30 bg-surface shadow-none">
        <Button
          variant="ghost"
          className="h-auto w-full justify-start rounded-none px-4 py-3 text-left text-ink hover:bg-teal-soft"
          onClick={() => setResolvedExpanded(true)}
          aria-expanded={false}
        >
          <Check
            aria-hidden="true"
            className="size-4 shrink-0 text-teal-strong"
          />
          <span className="min-w-0 flex-1 whitespace-normal text-sm font-semibold">
            {resolvedSummary}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-graphite"
          />
        </Button>
      </article>
    )
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-surface shadow-card",
        request.status === "escalated" && "border-danger/35",
        request.status === "pending" && "border-waiting/25",
        compact && "shadow-none",
      )}
    >
      {collapsedAnsweredQuestion && (
        <Button
          variant="ghost"
          className="h-auto w-full justify-start rounded-none border-b border-line px-4 py-3 text-left text-ink hover:bg-teal-soft"
          onClick={() => setResolvedExpanded(false)}
          aria-expanded={true}
        >
          <Check
            aria-hidden="true"
            className="size-4 shrink-0 text-teal-strong"
          />
          <span className="min-w-0 flex-1 whitespace-normal text-sm font-semibold">
            {resolvedSummary}
          </span>
          <ChevronUp
            aria-hidden="true"
            className="size-4 shrink-0 text-graphite"
          />
        </Button>
      )}
      <header className="flex flex-wrap items-start justify-between gap-4 px-5 pb-5 pt-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {agent && <AgentAvatar agent={agent} />}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-graphite">
              {typeLabel}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">
              {agent
                ? agentLabel(agent, suite.agentNaming)
                : fr.client.unknownAgent}
              <span className="font-normal text-graphite">
                {" "}
                · {request.suiteName}
              </span>
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold",
            statusStyles[request.status],
          )}
        >
          {statusLabels[request.status]}
        </span>
      </header>

      {request.type === "question" && (
        <QuestionContent
          request={request}
          agent={agent}
          onResolved={onResolved}
        />
      )}
      {request.type === "tool_approval" && (
        <ToolApprovalContent
          request={request}
          onResolved={onResolved}
          connectorTypes={connectorTypes}
          connections={connections}
        />
      )}
      {request.type === "message_approval" && (
        <MessageApprovalContent request={request} onResolved={onResolved} />
      )}

      <RequestState request={request} users={users} />
      <RequestMeta request={request} users={users} />
    </article>
  )
}
