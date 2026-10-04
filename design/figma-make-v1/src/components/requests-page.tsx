import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Columns3,
  CircleAlert,
  Filter,
  HelpCircle,
  List,
  ShieldCheck,
  X,
} from "lucide-react"

import {
  ClientAppHeader,
  ClientSidebar,
} from "@/components/client-space"
import { AgentAvatar, RiskBadge } from "@/components/foundations"
import HumanRequestCard from "@/components/human-request-card"
import { ConnectionRequiredCard } from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import {
  type Conversation,
  type Connection,
  type ConnectorType,
  type HumanRequest,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import {
  humanRequestTitle,
  pendingItemCount,
  pendingRequestsForUser,
  reminderCountLabel,
} from "@/lib/human-requests"
import { cn } from "@/lib/utils"

type ScopeFilter = "mine" | "team" | "all"
type TypeFilter = "all" | "question" | "approval"
type StatusFilter = "all" | "pending" | "resolved" | "expired"
type ViewMode = "list" | "kanban"
type KanbanColumnId =
  | "pending"
  | "reminded"
  | "escalated"
  | "resolved"
  | "archived"

interface RequestsPageProps {
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  requests: HumanRequest[]
  currentUser: User
  connectorTypes: ConnectorType[]
  connections: Connection[]
}

function typeForRequest(request: HumanRequest) {
  return request.type === "question"
    ? fr.humanRequest.question
    : request.type === "tool_approval"
      ? fr.humanRequest.actionApproval
      : fr.humanRequest.messageApproval
}

function urgencyLabel(request: HumanRequest) {
  if (request.urgency === "high") return fr.requestsPage.urgencyHigh
  if (request.urgency === "low") return fr.requestsPage.urgencyLow
  return fr.requestsPage.urgencyNormal
}

function statusMatches(request: HumanRequest, filter: StatusFilter) {
  if (filter === "all") return true
  if (filter === "pending") {
    return ["pending", "reminded", "escalated"].includes(request.status)
  }
  if (filter === "resolved") {
    return ["answered", "cancelled"].includes(request.status)
  }
  return request.status === "expired"
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className="h-8 rounded-full px-3 text-xs"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function RequestListItem({
  request,
  suite,
  active,
  onClick,
}: {
  request: HumanRequest
  suite: Suite
  active: boolean
  onClick: () => void
}) {
  const agent = suite.agents.find((item) => item.name === request.agent)
  const pending = ["pending", "reminded", "escalated"].includes(request.status)

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto w-full justify-start rounded-none border-b border-line px-4 py-4 text-left hover:bg-paper sm:px-5",
        active && "bg-action-soft hover:bg-action-soft",
      )}
      onClick={onClick}
    >
      {active && (
        <span className="absolute left-0 h-12 w-1 rounded-r-full bg-teal" />
      )}
      {agent && <AgentAvatar agent={agent} size="sm" />}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-graphite">
            {typeForRequest(request)}
          </span>
          {request.urgency === "high" && (
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">
              {urgencyLabel(request)}
            </span>
          )}
        </span>
        <span className="mt-1.5 line-clamp-2 whitespace-normal text-sm font-semibold leading-5 text-ink">
          {humanRequestTitle(request)}
        </span>
        <span className="mt-2 flex items-center gap-2 text-xs font-normal text-graphite">
          {request.suiteName}
          <span>·</span>
          {reminderCountLabel(request.remindersSent)}
        </span>
      </span>
      <span className="flex flex-col items-end gap-2">
        {pending && <span className="size-2 rounded-full bg-waiting" />}
        <ChevronRight aria-hidden="true" className="size-4 text-graphite" />
      </span>
    </Button>
  )
}

interface RequestFiltersProps {
  scope: ScopeFilter
  type: TypeFilter
  status: StatusFilter
  onScopeChange: (value: ScopeFilter) => void
  onTypeChange: (value: TypeFilter) => void
  onStatusChange: (value: StatusFilter) => void
}

function RequestFilters({
  scope,
  type,
  status,
  onScopeChange,
  onTypeChange,
  onStatusChange,
}: RequestFiltersProps) {
  return (
    <div className="space-y-3 bg-paper px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-graphite">
        <Filter aria-hidden="true" className="size-3.5" />
        {fr.requestsPage.filters}
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={scope === "mine"}
          onClick={() => onScopeChange("mine")}
        >
          {fr.requestsPage.assignedToMe}
        </FilterPill>
        <FilterPill
          active={scope === "team"}
          onClick={() => onScopeChange("team")}
        >
          {fr.requestsPage.assignedToTeam}
        </FilterPill>
        <FilterPill
          active={scope === "all"}
          onClick={() => onScopeChange("all")}
        >
          {fr.requestsPage.all}
        </FilterPill>
        <span className="mx-1 w-px bg-line" />
        <FilterPill
          active={type === "all"}
          onClick={() => onTypeChange("all")}
        >
          {fr.requestsPage.allTypes}
        </FilterPill>
        <FilterPill
          active={type === "question"}
          onClick={() => onTypeChange("question")}
        >
          {fr.requestsPage.questions}
        </FilterPill>
        <FilterPill
          active={type === "approval"}
          onClick={() => onTypeChange("approval")}
        >
          {fr.requestsPage.approvals}
        </FilterPill>
        <span className="mx-1 w-px bg-line" />
        <FilterPill
          active={status === "all"}
          onClick={() => onStatusChange("all")}
        >
          {fr.requestsPage.allStatuses}
        </FilterPill>
        <FilterPill
          active={status === "pending"}
          onClick={() => onStatusChange("pending")}
        >
          {fr.requestsPage.pendingStatuses}
        </FilterPill>
        <FilterPill
          active={status === "resolved"}
          onClick={() => onStatusChange("resolved")}
        >
          {fr.requestsPage.resolvedStatuses}
        </FilterPill>
        <FilterPill
          active={status === "expired"}
          onClick={() => onStatusChange("expired")}
        >
          {fr.requestsPage.expiredStatuses}
        </FilterPill>
      </div>
    </div>
  )
}

function requestColumn(request: HumanRequest): KanbanColumnId {
  if (request.status === "reminded") return "reminded"
  if (request.status === "escalated") return "escalated"
  if (request.status === "answered") return "resolved"
  if (request.status === "expired" || request.status === "cancelled") {
    return "archived"
  }
  return "pending"
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

interface KanbanCardProps {
  request: HumanRequest
  suite: Suite
  active: boolean
  onClick: () => void
}

function KanbanCard({
  request,
  suite,
  active,
  onClick,
}: KanbanCardProps) {
  const agent = suite.agents.find((item) => item.name === request.agent)
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto w-full flex-col items-stretch gap-0 whitespace-normal rounded-lg border border-line bg-surface p-3 text-left shadow-sm hover:border-action/40 hover:bg-surface",
        active && "border-action ring-2 ring-action/15",
      )}
      onClick={onClick}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {agent && <AgentAvatar agent={agent} size="sm" />}
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold text-ink">
              {agent?.firstName ?? fr.client.unknownAgent}
            </span>
            <span className="mt-0.5 block text-xs font-normal text-graphite">
              {typeForRequest(request)}
            </span>
          </span>
        </span>
        {request.urgency === "high" && (
          <span className="size-2 shrink-0 rounded-full bg-danger" />
        )}
      </span>
      <span className="mt-3 line-clamp-3 text-sm font-semibold leading-5 text-ink">
        {humanRequestTitle(request)}
      </span>
      {request.type === "tool_approval" && (
        <span className="mt-3">
          <RiskBadge risk={request.tool.risk} />
        </span>
      )}
      <span className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs font-normal text-graphite">
        <span>
          {fr.requestsPage.due} · {formatDueDate(request.dueAt)}
        </span>
        {request.remindersSent > 0 && (
          <span className="rounded-full bg-waiting-soft px-2 py-0.5 font-semibold text-waiting-strong">
            {reminderCountLabel(request.remindersSent)}
          </span>
        )}
      </span>
    </Button>
  )
}

interface KanbanBoardProps {
  requests: HumanRequest[]
  suite: Suite
  selectedId?: string
  onSelect: (id: string) => void
}

function KanbanBoard({
  requests,
  suite,
  selectedId,
  onSelect,
}: KanbanBoardProps) {
  const columns: Array<{
    id: KanbanColumnId
    label: string
    tone: string
  }> = [
    {
      id: "pending",
      label: fr.requestsPage.kanbanPending,
      tone: "bg-waiting",
    },
    {
      id: "reminded",
      label: fr.requestsPage.kanbanReminded,
      tone: "bg-action",
    },
    {
      id: "escalated",
      label: fr.requestsPage.kanbanEscalated,
      tone: "bg-danger",
    },
    {
      id: "resolved",
      label: fr.requestsPage.kanbanResolved,
      tone: "bg-teal",
    },
    {
      id: "archived",
      label: fr.requestsPage.kanbanArchived,
      tone: "bg-graphite",
    },
  ]

  return (
    <div className="flex min-h-full min-w-max gap-3 p-4">
      {columns.map((column) => {
        const columnRequests = requests.filter(
          (request) => requestColumn(request) === column.id,
        )
        return (
          <section
            key={column.id}
            className="flex w-72 shrink-0 flex-col rounded-lg border border-line bg-paper"
          >
            <header className="flex items-center justify-between border-b border-line px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-5 w-1 rounded-full", column.tone)} />
                <h2 className="text-xs font-bold uppercase tracking-wide text-ink">
                  {column.label}
                </h2>
              </div>
              <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-xs text-graphite">
                {columnRequests.length}
              </span>
            </header>
            <div className="flex-1 space-y-2 p-2">
              {columnRequests.length > 0 ? (
                columnRequests.map((request) => (
                  <KanbanCard
                    key={request.id}
                    request={request}
                    suite={suite}
                    active={selectedId === request.id}
                    onClick={() => onSelect(request.id)}
                  />
                ))
              ) : (
                <p className="rounded-md border border-dashed border-line p-4 text-center text-xs text-graphite">
                  {fr.requestsPage.emptyColumn}
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function RequestsPage({
  suites,
  activeSuite,
  conversations,
  requests,
  currentUser,
  connectorTypes,
  connections,
}: RequestsPageProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [scope, setScope] = useState<ScopeFilter>("mine")
  const [type, setType] = useState<TypeFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("pending")
  const [view, setView] = useState<ViewMode>("list")
  const [selectedId, setSelectedId] = useState(
    pendingRequestsForUser(requests, currentUser.id)[0]?.id,
  )
  const [kanbanModalOpen, setKanbanModalOpen] = useState(false)

  const filteredRequests = useMemo(() => {
    const urgencyOrder = { high: 0, normal: 1, low: 2 }
    return requests
      .filter((request) => {
        if (scope === "mine" && !request.assignees.includes(currentUser.id)) {
          return false
        }
        if (
          scope === "team" &&
          !request.assignees.some((id) =>
            activeSuite.humans.some((user) => user.id === id),
          )
        ) {
          return false
        }
        if (type === "question" && request.type !== "question") return false
        if (type === "approval" && request.type === "question") return false
        return statusMatches(request, status)
      })
      .sort((a, b) => {
        const urgency =
          urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        if (urgency !== 0) return urgency
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      })
  }, [activeSuite.humans, currentUser.id, requests, scope, status, type])

  const selectedRequest =
    filteredRequests.find((request) => request.id === selectedId) ??
    filteredRequests[0]
  const pendingCount = pendingItemCount(requests, currentUser, activeSuite)
  const expiredConnection = connections.find(
    (connection) => connection.status === "expired",
  )
  const expiredConnector = connectorTypes.find(
    (connector) => connector.key === expiredConnection?.connectorKey,
  )

  useEffect(() => {
    if (!kanbanModalOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setKanbanModalOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [kanbanModalOpen])

  return (
    <div className="h-screen overflow-hidden bg-paper text-ink">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">
        <ClientSidebar
          suites={suites}
          activeSuite={activeSuite}
          conversations={conversations}
          pendingCount={pendingCount}
          isOwner={currentUser.role === "owner"}
          onClose={() => setMobileNavigationOpen(false)}
        />
      </div>

      {mobileNavigationOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <Button
            variant="ghost"
            className="absolute inset-0 h-full w-full rounded-none bg-ink/45 p-0 backdrop-blur-sm"
            onClick={() => setMobileNavigationOpen(false)}
            aria-label={fr.client.closeNavigation}
          >
            <X aria-hidden="true" className="sr-only" />
          </Button>
          <div className="relative h-full w-72 shadow-2xl">
            <ClientSidebar
              suites={suites}
              activeSuite={activeSuite}
              conversations={conversations}
              pendingCount={pendingCount}
              isOwner={currentUser.role === "owner"}
              onClose={() => setMobileNavigationOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex h-full flex-col lg:pl-72">
        <ClientAppHeader
          currentUser={currentUser}
          pendingCount={pendingCount}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
        />

        <header className="shrink-0 border-b border-line bg-surface px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.requestsPage.eyebrow}
          </p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-extrabold text-ink">
                {fr.requestsPage.title}
              </h1>
              <p className="mt-1 hidden text-sm text-graphite sm:block">
                {fr.requestsPage.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex rounded-lg bg-muted p-1"
                aria-label={fr.requestsPage.viewMode}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "h-8 px-3 text-xs",
                    view === "list" && "bg-surface text-ink shadow-sm",
                  )}
                  onClick={() => {
                    setView("list")
                    setMobileDetailOpen(false)
                    setKanbanModalOpen(false)
                  }}
                >
                  <List aria-hidden="true" className="size-4" />
                  {fr.requestsPage.listView}
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-8 px-3 text-xs",
                    view === "kanban" && "bg-surface text-ink shadow-sm",
                  )}
                  onClick={() => {
                    setView("kanban")
                    setMobileDetailOpen(false)
                    setKanbanModalOpen(false)
                  }}
                >
                  <Columns3 aria-hidden="true" className="size-4" />
                  {fr.requestsPage.kanbanView}
                </Button>
              </div>
              <span className="rounded-full bg-waiting-soft px-3 py-1.5 text-xs font-bold text-waiting-strong">
                {pendingCount} {fr.humanRequest.statusPending.toLowerCase()}
              </span>
            </div>
          </div>
        </header>

        <div
          className={cn(
            "shrink-0 border-b border-line",
            mobileDetailOpen && "hidden lg:block",
          )}
        >
          <RequestFilters
            scope={scope}
            type={type}
            status={status}
            onScopeChange={setScope}
            onTypeChange={setType}
            onStatusChange={setStatus}
          />
          {expiredConnection && expiredConnector && (
            <div className="px-4 pb-4">
              <ConnectionRequiredCard
                connection={expiredConnection}
                connector={expiredConnector}
                userRole={currentUser.role}
                compact
              />
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1">
          {view === "list" ? (
            <section
              className={cn(
                "flex w-full min-w-0 flex-col border-r border-line bg-surface lg:w-[40%] lg:max-w-lg",
                mobileDetailOpen && "hidden lg:flex",
              )}
            >
              <div className="flex-1 overflow-y-auto">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <RequestListItem
                      key={request.id}
                      request={request}
                      suite={activeSuite}
                      active={request.id === selectedRequest?.id}
                      onClick={() => {
                        setSelectedId(request.id)
                        setMobileDetailOpen(true)
                      }}
                    />
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-8 text-teal"
                    />
                    <p className="mt-3 text-sm text-graphite">
                      {fr.requestsPage.noRequests}
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section
              className={cn(
                "min-w-0 flex-1 overflow-x-auto bg-surface",
                mobileDetailOpen && "hidden lg:block",
              )}
            >
              <KanbanBoard
                requests={filteredRequests}
                suite={activeSuite}
                selectedId={selectedRequest?.id}
                onSelect={(id) => {
                  setSelectedId(id)
                  setKanbanModalOpen(true)
                }}
              />
            </section>
          )}

          {view === "list" && (
            <section
              className={cn(
                "min-w-0 flex-1 overflow-y-auto bg-paper p-4 sm:p-6 lg:p-8",
                !mobileDetailOpen && "hidden lg:block",
              )}
            >
              {selectedRequest ? (
                <div className="mx-auto max-w-3xl">
                  <Button
                    variant="ghost"
                    className="mb-4 pl-0 lg:hidden"
                    onClick={() => setMobileDetailOpen(false)}
                  >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    {fr.requestsPage.backToList}
                  </Button>
                  <HumanRequestCard
                    key={selectedRequest.id}
                    request={selectedRequest}
                    suite={activeSuite}
                    users={activeSuite.humans}
                    connectorTypes={connectorTypes}
                    connections={connections}
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <HelpCircle
                    aria-hidden="true"
                    className="size-8 text-graphite"
                  />
                  <p className="mt-3 text-sm text-graphite">
                    {fr.requestsPage.selectRequest}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {view === "kanban" && kanbanModalOpen && selectedRequest && (
        <div
          className="fixed inset-0 z-60 flex flex-col bg-paper"
          role="dialog"
          aria-modal="true"
          aria-label={humanRequestTitle(selectedRequest)}
        >
          <header className="sticky top-0 z-10 flex h-17 shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
                {typeForRequest(selectedRequest)} ·{" "}
                {selectedRequest.suiteName}
              </p>
              <h2 className="mt-1 truncate font-heading text-lg font-bold text-ink">
                {humanRequestTitle(selectedRequest)}
              </h2>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-10 shrink-0"
              onClick={() => setKanbanModalOpen(false)}
              aria-label={fr.requestsPage.closeRequest}
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:py-10">
            <div className="mx-auto max-w-4xl">
              <HumanRequestCard
                key={selectedRequest.id}
                request={selectedRequest}
                suite={activeSuite}
                users={activeSuite.humans}
                connectorTypes={connectorTypes}
                connections={connections}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
