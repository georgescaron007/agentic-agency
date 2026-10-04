import { useMemo, useState, type ReactNode } from "react"
import {
  ArrowDown,
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  File,
  FileText,
  KanbanSquare,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  PanelRight,
  Send,
  Square,
  Users,
  WifiOff,
  X,
} from "lucide-react"

import { ClientAppHeader, ClientSidebar } from "@/components/client-space"
import AgentProfilePanel from "@/components/agent-profile-panel"
import {
  AgentAvatar,
  AgentStatusBadge,
  HumanAvatar,
} from "@/components/foundations"
import HumanRequestCard from "@/components/human-request-card"
import { ConnectionRequiredCard } from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  agentLabel,
  type ActivityEvent,
  type Agent,
  type AgentMessage,
  type Conversation,
  type Connection,
  type ConnectorType,
  type DocumentItem,
  type HumanRequest,
  type Suite,
  type Task,
  type TaskStatus,
  type UsageSummary,
  type User,
  type WorkInProgress,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { pendingItemCount } from "@/lib/human-requests"
import { cn } from "@/lib/utils"

interface ConversationPageProps {
  suite: Suite
  suites: Suite[]
  conversation: Conversation
  conversations: Conversation[]
  messages: AgentMessage[]
  workInProgress: WorkInProgress
  tasks: Task[]
  documents: DocumentItem[]
  requests: HumanRequest[]
  usage: UsageSummary
  currentUser: User
  activityEvents: ActivityEvent[]
  connectorTypes: ConnectorType[]
  connections: Connection[]
  connectionLost?: boolean
  hasNewMessages?: boolean
}

function messageTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function findAgent(suite: Suite, name: string) {
  return suite.agents.find((agent) => agent.name === name)
}

function AgentMessageBlock({
  message,
  agent,
  suite,
}: {
  message: AgentMessage
  agent: Agent
  suite: Suite
}) {
  return (
    <article className="flex max-w-2xl items-start gap-3">
      <AgentAvatar agent={agent} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-sm font-bold text-ink">
            {agentLabel(agent, suite.agentNaming)}
          </p>
          <span className="text-xs font-medium text-graphite">
            {fr.common.agent} · {messageTime(message.createdAt)}
          </span>
        </div>
        <div className="mt-2 rounded-lg border border-line bg-surface p-4 shadow-card">
          <p className="whitespace-pre-wrap text-sm leading-6 text-ink">
            {message.content}
          </p>
          {message.attachments.map((attachment) => (
            <div
              key={attachment.path}
              className="mt-4 flex items-center gap-3 rounded-md border border-line bg-paper p-3"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-action-soft text-action-strong">
                <FileText aria-hidden="true" className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">
                  {attachment.description ?? attachment.path}
                </p>
                <p className="mt-0.5 text-xs text-graphite">
                  {fr.conversation.attachment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function HumanMessageBubble({
  message,
  user,
  isCurrentUser,
}: {
  message: AgentMessage
  user: User
  isCurrentUser: boolean
}) {
  return (
    <article
      className={cn(
        "flex max-w-xl items-end gap-3",
        isCurrentUser && "ml-auto flex-row-reverse",
      )}
    >
      <HumanAvatar user={user} status="working" size="sm" />
      <div>
        <div
          className={cn(
            "rounded-lg px-4 py-3 shadow-sm",
            isCurrentUser
              ? "rounded-br-sm bg-ink text-paper"
              : "rounded-bl-sm border border-line bg-surface text-ink",
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.content}
          </p>
        </div>
        {message.attachments.map((attachment) => (
          <div
            key={attachment.path}
            className="mt-2 flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2"
          >
            <Paperclip aria-hidden="true" className="size-3.5 text-graphite" />
            <span className="max-w-64 truncate text-xs font-medium text-ink">
              {attachment.description ?? attachment.path}
            </span>
          </div>
        ))}
        <p
          className={cn(
            "mt-1.5 text-xs text-graphite",
            isCurrentUser && "text-right",
          )}
        >
          {user.name} · {messageTime(message.createdAt)}
        </p>
      </div>
    </article>
  )
}

function WorkItemState({
  state,
}: {
  state: WorkInProgress["items"][number]["state"]
}) {
  if (state === "done") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-lime text-brand-ink">
        <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
      </span>
    )
  }
  if (state === "waiting_human") {
    return (
      <span className="size-2.5 rounded-full bg-waiting ring-4 ring-waiting-soft" />
    )
  }
  if (state === "error") {
    return <CircleAlert aria-hidden="true" className="size-4 text-danger" />
  }
  return (
    <span className="relative flex size-2.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-40" />
      <span className="relative inline-flex size-2.5 rounded-full bg-teal" />
    </span>
  )
}

function WorkInProgressBlock({
  work,
  suite,
  internalMessages,
}: {
  work: WorkInProgress
  suite: Suite
  internalMessages: AgentMessage[]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="ml-0 max-w-2xl overflow-hidden rounded-lg border border-teal/25 bg-surface shadow-card sm:ml-14">
      <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
            <BriefcaseBusiness aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink">
              {fr.conversation.workTitle}
            </h3>
            <p className="mt-0.5 text-xs text-graphite">
              {fr.conversation.workDescription}
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-graphite">
          <Clock3 aria-hidden="true" className="size-3.5" />
          14 min {fr.conversation.elapsed}
        </span>
      </div>

      <div className="space-y-1 px-4 py-3">
        {work.items.map((item) => {
          const agent = findAgent(suite, item.agent)
          return (
            <div
              key={item.agent}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2.5",
                item.state === "waiting_human" && "bg-waiting-soft",
              )}
            >
              <WorkItemState state={item.state} />
              <p className="min-w-0 flex-1 text-sm text-ink">
                <span className="font-bold">
                  {agent?.firstName ?? item.agent}
                </span>
                {" — "}
                <span
                  className={cn(
                    "text-graphite",
                    item.state === "waiting_human" && "text-waiting-strong",
                  )}
                >
                  {item.label}
                </span>
              </p>
              <span className="shrink-0 font-mono text-xs text-graphite">
                {fr.conversation.step} {item.step}
              </span>
            </div>
          )
        })}
      </div>

      {expanded && (
        <div className="border-t border-line bg-paper/60 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-graphite">
            {fr.conversation.internalExchanges}
          </p>
          <div className="mt-3 space-y-3">
            {internalMessages.map((message) => {
              const agent = findAgent(suite, message.sender)
              return (
                <div
                  key={message.id}
                  className="flex items-start gap-2.5 text-xs leading-5"
                >
                  {agent && <AgentAvatar agent={agent} size="sm" />}
                  <p className="rounded-md border border-line bg-surface px-3 py-2 text-graphite">
                    <strong className="text-ink">
                      {agent?.firstName ?? message.sender}
                    </strong>
                    {" · "}
                    {message.content}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-md border border-line bg-surface p-3">
            <p className="text-xs font-bold text-ink">
              {fr.conversation.technicalDetails}
            </p>
            <p className="mt-1 font-mono text-xs leading-5 text-graphite">
              create_task · write_file · crm_read
              <br />3 agents · 4 étapes · 430,4 k crédits
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
        <Button
          variant="ghost"
          className="h-8 px-2 text-xs text-graphite"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? (
            <ChevronDown aria-hidden="true" className="size-3.5" />
          ) : (
            <ChevronRight aria-hidden="true" className="size-3.5" />
          )}
          {expanded ? fr.conversation.hideDetails : fr.conversation.showDetails}
        </Button>
        <Button
          variant="outline"
          className="h-8 px-3 text-xs text-danger hover:bg-danger-soft"
        >
          <Square aria-hidden="true" className="size-3" />
          {fr.conversation.stop}
        </Button>
      </div>
    </section>
  )
}

function TaskCreatedLine({ task }: { task: Task }) {
  return (
    <Button
      variant="ghost"
      className="ml-0 h-auto max-w-2xl justify-start rounded-md border border-line bg-surface px-3 py-2 text-xs text-graphite sm:ml-14"
    >
      <KanbanSquare aria-hidden="true" className="size-4 text-action" />
      {fr.conversation.taskCreated} :
      <span className="font-semibold text-ink">{task.title}</span>
      <ChevronRight aria-hidden="true" className="ml-auto size-3.5" />
    </Button>
  )
}

function DeliverableCard({
  document,
  agent,
  draft = false,
}: {
  document: DocumentItem
  agent?: Agent
  draft?: boolean
}) {
  return (
    <article
      className={cn(
        "ml-0 max-w-2xl overflow-hidden rounded-lg border bg-surface shadow-card sm:ml-14",
        draft ? "border-line" : "border-teal/30",
      )}
    >
      <div className="relative flex items-start gap-4 p-5">
        {!draft && (
          <span className="absolute right-5 top-0 h-0 w-0 border-x-8 border-t-10 border-x-transparent border-t-teal" />
        )}
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal-strong">
          <FileText aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-graphite">
              {draft
                ? fr.conversation.document
                : fr.conversation.deliverable}
            </p>
            {draft && (
              <span className="rounded-full bg-graphite-soft px-2.5 py-1 text-xs font-bold text-graphite">
                {fr.conversation.draft}
              </span>
            )}
          </div>
          <div
            role="heading"
            aria-level={3}
            className="mt-1.5 font-heading text-base font-bold text-ink"
          >
            {document.title}
          </div>
          <p className="mt-1 text-xs text-graphite">
            PDF · 842 ko
            {agent && ` · ${fr.conversation.sentBy} ${agent.firstName}`}
          </p>
        </div>
      </div>
      <div className="mx-5 rounded-t-md border border-b-0 border-line bg-paper p-4">
        <div className="space-y-2">
          <span className="block h-2 w-1/3 rounded-full bg-ink/15" />
          <span className="block h-1.5 w-full rounded-full bg-graphite/15" />
          <span className="block h-1.5 w-5/6 rounded-full bg-graphite/15" />
          <span className="block h-1.5 w-4/6 rounded-full bg-graphite/15" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line p-3">
        <Button className="h-9">
          {fr.conversation.open}
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
        <Button variant="outline" className="h-9">
          <Download aria-hidden="true" className="size-4" />
          {fr.conversation.download}
        </Button>
        <Button variant="ghost" className="h-9 text-action-strong">
          <MessageSquarePlus aria-hidden="true" className="size-4" />
          {fr.conversation.requestChange}
        </Button>
      </div>
    </article>
  )
}

function ConversationComposer({
  suite,
  conversation,
}: {
  suite: Suite
  conversation: Conversation
}) {
  const [value, setValue] = useState("")
  const [dragging, setDragging] = useState(false)
  const showMentions = value.endsWith("@")
  const directAgent =
    conversation.kind === "direct"
      ? findAgent(suite, conversation.directAgent ?? "")
      : undefined
  const placeholder = directAgent
    ? `${fr.conversation.writeToAgent} ${directAgent.firstName}…`
    : fr.conversation.writeToTeam

  return (
    <div className="relative mx-auto max-w-3xl">
      {showMentions && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-lg border border-line bg-surface p-2 shadow-xl">
          <p className="px-2 pb-2 pt-1 text-xs font-semibold text-graphite">
            {fr.conversation.mentionAgents}
          </p>
          {suite.agents.map((agent) => (
            <Button
              key={agent.name}
              variant="ghost"
              className="h-auto w-full justify-start px-2 py-2"
              onClick={() =>
                setValue(`${value.slice(0, -1)}@${agent.firstName} `)
              }
            >
              <AgentAvatar agent={agent} size="sm" />
              <span className="text-left">
                <span className="block text-sm font-semibold text-ink">
                  {agent.firstName}
                </span>
                <span className="block text-xs font-normal text-graphite">
                  {agent.role}
                </span>
              </span>
            </Button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "rounded-lg border border-line bg-surface p-2 shadow-lg transition",
          dragging && "border-action bg-action-soft ring-2 ring-action/20",
        )}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
      >
        {dragging && (
          <div className="flex h-20 items-center justify-center gap-2 rounded-md border border-dashed border-action text-sm font-semibold text-action-strong">
            <Paperclip aria-hidden="true" className="size-4" />
            {fr.conversation.dropFiles}
          </div>
        )}
        {!dragging && (
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="min-h-16 border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
          />
        )}
        <div className="flex items-center justify-between gap-3 px-1 pb-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={fr.conversation.attachFile}
          >
            <Paperclip aria-hidden="true" className="size-4.5" />
          </Button>
          <Button
            size="icon"
            disabled={!value.trim()}
            aria-label={fr.conversation.send}
          >
            <Send aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const taskLabels: Record<TaskStatus, string> = {
  todo: fr.conversation.todo,
  in_progress: fr.conversation.inProgress,
  blocked: fr.conversation.blocked,
  in_review: fr.conversation.inReview,
  done: fr.conversation.done,
}

function TeamPanel({
  suite,
  onOpenProfile,
}: {
  suite: Suite
  onOpenProfile: (agent: Agent) => void
}) {
  return (
    <div className="space-y-3 p-4">
      {suite.agents.map((agent) => (
        <article
          key={agent.name}
          className="rounded-lg border border-line bg-surface p-3"
        >
          <div className="flex items-start gap-3">
            <AgentAvatar agent={agent} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">
                {agentLabel(agent, suite.agentNaming)}
              </p>
              <p className="mt-1 text-xs text-graphite">{agent.role}</p>
            </div>
          </div>
          <div className="mt-3">
            {agent.name === "@hugo" && agent.status === "idle" ? (
              <span className="inline-flex rounded-full bg-graphite-soft px-2.5 py-1 text-xs font-bold text-graphite">
                {fr.agentProfile.idleGmailStatus}
              </span>
            ) : (
              <AgentStatusBadge status={agent.status} />
            )}
          </div>
          <div className="mt-3 flex gap-1 border-t border-line pt-2">
            <Button
              variant="ghost"
              className="h-8 flex-1 px-2 text-xs text-action-strong"
            >
              {fr.conversation.writeToThisAgent}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={fr.conversation.viewProfile}
              onClick={() => onOpenProfile(agent)}
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}

function TasksPanel({ tasks }: { tasks: Task[] }) {
  const statuses: TaskStatus[] = [
    "todo",
    "in_progress",
    "blocked",
    "in_review",
    "done",
  ]
  return (
    <div className="space-y-4 p-4">
      {statuses.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status)
        return (
          <section key={status}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-graphite">
                {taskLabels[status]}
              </p>
              <span className="font-mono text-xs text-graphite">
                {statusTasks.length}
              </span>
            </div>
            {statusTasks.length > 0 ? (
              statusTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "mb-2 rounded-md border border-line bg-surface p-3 text-xs font-semibold text-ink",
                    status === "blocked" && "border-waiting/30",
                  )}
                >
                  {task.title}
                </div>
              ))
            ) : (
              <div className="h-7 rounded-md border border-dashed border-line" />
            )}
          </section>
        )
      })}
    </div>
  )
}

function FilesPanel({ documents }: { documents: DocumentItem[] }) {
  return (
    <div className="space-y-2 p-4">
      {documents.length > 0 ? (
        documents.map((document) => (
          <Button
            key={document.path}
            variant="ghost"
            className="h-auto w-full justify-start rounded-lg border border-line bg-surface p-3 text-left"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-strong">
              <File aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-ink">
                {document.title}
              </span>
              <span className="mt-1 block text-xs font-normal text-graphite">
                {document.mimeType}
              </span>
            </span>
          </Button>
        ))
      ) : (
        <p className="p-4 text-center text-sm text-graphite">
          {fr.conversation.noFiles}
        </p>
      )}
    </div>
  )
}

type ContextTab = "team" | "tasks" | "files"

function ContextPanel({
  suite,
  tasks,
  documents,
  onClose,
  onOpenProfile,
}: {
  suite: Suite
  tasks: Task[]
  documents: DocumentItem[]
  onClose: () => void
  onOpenProfile: (agent: Agent) => void
}) {
  const [tab, setTab] = useState<ContextTab>("team")
  const tabs: Array<{
    id: ContextTab
    label: string
    icon: typeof Users
  }> = [
    { id: "team", label: fr.conversation.rightTeam, icon: Users },
    { id: "tasks", label: fr.conversation.rightTasks, icon: KanbanSquare },
    { id: "files", label: fr.conversation.rightFiles, icon: File },
  ]

  return (
    <aside className="flex h-full w-80 flex-col border-l border-line bg-paper">
      <div className="flex h-14 items-center border-b border-line bg-surface px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            className={cn(
              "relative h-14 flex-1 rounded-none px-2 text-xs text-graphite",
              tab === id && "text-ink",
            )}
            onClick={() => setTab(id)}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
            {tab === id && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-teal" />
            )}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 size-8 shrink-0"
          onClick={onClose}
          aria-label={fr.conversation.closeDetails}
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "team" && (
          <TeamPanel suite={suite} onOpenProfile={onOpenProfile} />
        )}
        {tab === "tasks" && <TasksPanel tasks={tasks} />}
        {tab === "files" && <FilesPanel documents={documents} />}
      </div>
    </aside>
  )
}

function ConversationEmptyState({
  suite,
  children,
}: {
  suite: Suite
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center py-10 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-teal text-white">
        <Users aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-bold text-ink">
        {fr.conversation.welcomeConversation}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-graphite">
        {suite.welcomeMessage}
      </p>
      <div className="mt-7 grid gap-2 sm:grid-cols-3">
        {suite.suggestedPrompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            className="h-auto min-h-24 whitespace-normal p-3 text-left text-xs leading-5"
          >
            {prompt}
          </Button>
        ))}
      </div>
      {children}
    </div>
  )
}

export default function ConversationPage({
  suite,
  suites,
  conversation,
  conversations,
  messages,
  workInProgress,
  tasks,
  documents,
  requests,
  currentUser,
  activityEvents,
  connectorTypes,
  connections,
  connectionLost = false,
  hasNewMessages = false,
}: ConversationPageProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent>()
  const [contextOpen, setContextOpen] = useState(
    () => window.matchMedia("(min-width: 1280px)").matches,
  )
  const pendingCount = pendingItemCount(requests, currentUser, suite)
  const conversationMessages = messages.filter(
    (message) => message.conversationId === conversation.id,
  )
  const visibleMessages = conversationMessages.filter(
    (message) =>
      message.sender === "@human" || message.recipients.includes("@human"),
  )
  const internalMessages = conversationMessages.filter(
    (message) =>
      message.sender !== "@human" && !message.recipients.includes("@human"),
  )
  const directAgent =
    conversation.kind === "direct"
      ? findAgent(suite, conversation.directAgent ?? "")
      : undefined

  const firstHumanMessage = visibleMessages.find(
    (message) => message.sender === "@human",
  )
  const acknowledgement = visibleMessages.find(
    (message) => message.intent === "acknowledgment",
  )
  const finalMessages = visibleMessages.filter(
    (message) =>
      message.id !== firstHumanMessage?.id &&
      message.id !== acknowledgement?.id,
  )
  const conversationUser =
    suite.humans.find((user) => user.id === firstHumanMessage?.senderUserId) ??
    currentUser
  const relatedTasks = tasks.filter(
    (task) =>
      visibleMessages.some((message) => message.taskId === task.id) ||
      task.teamId === suite.id,
  )
  const relatedDocuments = documents.filter(
    (document) =>
      document.teamId === suite.id &&
      (!document.taskId ||
        relatedTasks.some((task) => task.id === document.taskId)),
  )
  const relatedRequest = requests.find(
    (request) => request.conversationId === conversation.id,
  )
  const expiredConnection = connections.find(
    (connection) => connection.status === "expired",
  )
  const expiredConnector = connectorTypes.find(
    (connector) => connector.key === expiredConnection?.connectorKey,
  )

  const conversationSubtitle = useMemo(() => {
    if (directAgent) {
      return `${fr.conversation.directConversation} · ${agentLabel(directAgent, suite.agentNaming)}`
    }
    return `${fr.conversation.teamConversation} · ${conversation.participants.length} ${fr.conversation.membersActive}`
  }, [conversation.participants.length, directAgent, suite.agentNaming])

  const empty = conversationMessages.length === 0

  return (
    <div className="h-screen overflow-hidden bg-paper text-ink">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">
        <ClientSidebar
          suites={suites}
          activeSuite={suite}
          conversations={conversations}
          pendingCount={pendingCount}
          isOwner={currentUser.role === "owner"}
          onClose={() => setMobileNavigationOpen(false)}
          activeConversationId={conversation.id}
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
              activeSuite={suite}
              conversations={conversations}
              pendingCount={pendingCount}
              isOwner={currentUser.role === "owner"}
              onClose={() => setMobileNavigationOpen(false)}
              activeConversationId={conversation.id}
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

        {connectionLost && (
          <div className="flex items-center justify-center gap-2 border-b border-waiting/25 bg-waiting-soft px-4 py-2 text-xs font-medium text-waiting-strong">
            <WifiOff aria-hidden="true" className="size-3.5" />
            <span>{fr.conversation.connectionLost}</span>
            <span className="hidden text-graphite sm:inline">
              · {fr.conversation.reconnecting}
            </span>
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <section className="flex min-w-0 flex-1 flex-col bg-paper">
            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileNavigationOpen(true)}
                aria-label={fr.conversation.backToConversations}
              >
                <ArrowLeft aria-hidden="true" className="size-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-heading text-base font-bold text-ink sm:text-lg">
                  {conversation.title}
                </h1>
                <p className="mt-0.5 truncate text-xs text-graphite">
                  {conversationSubtitle}
                </p>
              </div>
              <div className="hidden -space-x-2 sm:flex">
                {conversation.participants.slice(0, 3).map((participant) => {
                  const agent = findAgent(suite, participant)
                  return (
                    agent && (
                      <span
                        key={agent.name}
                        className="rounded-lg ring-2 ring-surface"
                      >
                        <AgentAvatar agent={agent} size="sm" />
                      </span>
                    )
                  )
                })}
              </div>
              {!contextOpen && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setContextOpen(true)}
                  aria-label={fr.conversation.details}
                >
                  <PanelRight aria-hidden="true" className="size-4" />
                </Button>
              )}
            </header>

            <div className="relative min-h-0 flex-1 overflow-y-auto">
              {empty ? (
                <ConversationEmptyState suite={suite}>
                  <div className="mt-8">
                    <ConversationComposer
                      suite={suite}
                      conversation={conversation}
                    />
                  </div>
                </ConversationEmptyState>
              ) : (
                <div className="mx-auto max-w-3xl space-y-7 px-4 py-8 sm:px-6 sm:py-10">
                  {firstHumanMessage && (
                    <HumanMessageBubble
                      message={firstHumanMessage}
                      user={conversationUser}
                      isCurrentUser={conversationUser.id === currentUser.id}
                    />
                  )}
                  {acknowledgement &&
                    findAgent(suite, acknowledgement.sender) && (
                      <AgentMessageBlock
                        message={acknowledgement}
                        agent={
                          findAgent(suite, acknowledgement.sender) as Agent
                        }
                        suite={suite}
                      />
                    )}
                  {relatedTasks[0] && (
                    <TaskCreatedLine task={relatedTasks[0]} />
                  )}
                  <WorkInProgressBlock
                    work={workInProgress}
                    suite={suite}
                    internalMessages={internalMessages}
                  />
                  {relatedRequest && (
                    <div className="ml-0 max-w-2xl sm:ml-14">
                      <HumanRequestCard
                        request={relatedRequest}
                        suite={suite}
                        users={suite.humans}
                        compact
                        connectorTypes={connectorTypes}
                        connections={connections}
                      />
                    </div>
                  )}
                  {expiredConnection && expiredConnector && (
                    <div className="ml-0 max-w-2xl sm:ml-14">
                      <ConnectionRequiredCard
                        connection={expiredConnection}
                        connector={expiredConnector}
                        userRole={currentUser.role}
                      />
                    </div>
                  )}
                  {finalMessages.map((message) => {
                    const agent = findAgent(suite, message.sender)
                    return (
                      agent && (
                        <AgentMessageBlock
                          key={message.id}
                          message={message}
                          agent={agent}
                          suite={suite}
                        />
                      )
                    )
                  })}
                  {relatedDocuments[0] && (
                    <DeliverableCard
                      document={relatedDocuments[0]}
                      agent={findAgent(suite, relatedDocuments[0].author)}
                      draft={
                        relatedRequest?.type === "question" &&
                        relatedRequest.blocking &&
                        !["answered", "expired", "cancelled"].includes(
                          relatedRequest.status,
                        )
                      }
                    />
                  )}
                  <div className="h-2" />
                </div>
              )}

              {hasNewMessages && (
                <Button className="sticky bottom-3 left-1/2 z-10 h-9 -translate-x-1/2 rounded-full bg-action px-4 text-xs shadow-lg hover:bg-action-strong">
                  <ArrowDown aria-hidden="true" className="size-4" />3{" "}
                  {fr.conversation.newMessages}
                </Button>
              )}
            </div>

            {!empty && (
              <div className="shrink-0 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:px-6">
                <ConversationComposer
                  suite={suite}
                  conversation={conversation}
                />
              </div>
            )}
          </section>

          {contextOpen && (
            <div className="hidden xl:block">
              <ContextPanel
                suite={suite}
                tasks={relatedTasks}
                documents={relatedDocuments}
                onClose={() => setContextOpen(false)}
                onOpenProfile={setSelectedAgent}
              />
            </div>
          )}
        </div>
      </div>

      {contextOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <Button
            variant="ghost"
            className="absolute inset-0 h-full w-full rounded-none bg-ink/45 p-0 backdrop-blur-sm"
            onClick={() => setContextOpen(false)}
            aria-label={fr.conversation.closeDetails}
          >
            <X aria-hidden="true" className="sr-only" />
          </Button>
          <div className="absolute inset-y-0 right-0 shadow-2xl">
            <ContextPanel
              suite={suite}
              tasks={relatedTasks}
              documents={relatedDocuments}
              onClose={() => setContextOpen(false)}
              onOpenProfile={setSelectedAgent}
            />
          </div>
        </div>
      )}
      {selectedAgent && (
        <AgentProfilePanel
          agent={selectedAgent}
          suite={suite}
          events={activityEvents}
          connectorTypes={connectorTypes}
          connections={connections}
          onClose={() => setSelectedAgent(undefined)}
          onWrite={() => {
            const directConversation = conversations.find(
              (item) =>
                item.kind === "direct" &&
                item.directAgent === selectedAgent.name,
            )
            if (directConversation) {
              window.location.assign(
                `/app/suites/${suite.id}/conversations/${directConversation.id}`,
              )
            }
          }}
        />
      )}
    </div>
  )
}
