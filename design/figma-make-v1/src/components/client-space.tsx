import { useState } from "react"
import {
  Activity,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  File,
  FileText,
  FolderOpen,
  Home,
  Menu,
  MessageSquarePlus,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Triangle,
  UserRound,
  X,
} from "lucide-react"

import { AgentAvatar, CreditsGauge } from "@/components/foundations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type Conversation,
  type DocumentItem,
  type HumanRequest,
  type OnboardingStep,
  type Suite,
  type Task,
  type UsageSummary,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import {
  humanRequestTitle,
  pendingItemCount,
} from "@/lib/human-requests"
import { cn } from "@/lib/utils"

type ClientPageState = "ready" | "loading" | "error" | "empty"

interface ClientSpaceProps {
  suites: Suite[]
  activeSuite: Suite
  currentUser: User
  conversations: Conversation[]
  requests: HumanRequest[]
  usage: UsageSummary
  tasks: Task[]
  documents: DocumentItem[]
  onboarding: OnboardingStep[]
  state?: ClientPageState
  supportMode?: boolean
}

function userInitials(user: User) {
  return user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

function requestType(request: HumanRequest) {
  return request.type === "question" ? fr.client.question : fr.client.approval
}

function authorAgent(suite: Suite, author: string) {
  return suite.agents.find((agent) => agent.name === author)
}

function documentType(document: DocumentItem) {
  if (document.mimeType === "application/pdf") return fr.client.pdfDocument
  if (document.mimeType.includes("csv")) return fr.client.tableDocument
  return fr.client.textDocument
}

function conversationGroups(conversations: Conversation[]) {
  const ordered = [...conversations].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  )
  const newestDay = ordered[0]?.lastMessageAt.slice(0, 10)
  const newestTime = newestDay
    ? new Date(`${newestDay}T00:00:00Z`).getTime()
    : 0

  return [
    {
      label: fr.client.todayGroup,
      items: ordered.filter(
        (conversation) => conversation.lastMessageAt.slice(0, 10) === newestDay,
      ),
    },
    {
      label: fr.client.yesterdayGroup,
      items: ordered.filter((conversation) => {
        const day = new Date(
          `${conversation.lastMessageAt.slice(0, 10)}T00:00:00Z`,
        ).getTime()
        return newestTime - day === 86_400_000
      }),
    },
    {
      label: fr.client.earlierGroup,
      items: ordered.filter((conversation) => {
        const day = new Date(
          `${conversation.lastMessageAt.slice(0, 10)}T00:00:00Z`,
        ).getTime()
        return newestTime - day > 86_400_000
      }),
    },
  ].filter((group) => group.items.length > 0)
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function ClientLogo({ suite }: { suite: Suite }) {
  const logoUrl = suite.branding.logoDarkUrl ?? suite.branding.logoLightUrl
  return (
    <div className="flex min-w-0 items-center gap-3">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="size-9 rounded-lg border border-line bg-surface object-contain p-1"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal text-white shadow-sm">
          <Building2 aria-hidden="true" className="size-5" />
        </span>
      )}
      <span className="truncate font-heading text-sm font-bold text-paper">
        {suite.branding.clientName}
      </span>
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof Home
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "relative h-10 w-full justify-start px-3 text-paper/70 hover:bg-white/8 hover:text-paper",
        active && "bg-white/10 text-paper hover:bg-white/10",
      )}
      onClick={onClick}
    >
      {active && (
        <span className="absolute -left-0.5 h-6 w-1 rounded-full bg-teal" />
      )}
      <Icon aria-hidden="true" className="size-4.5" />
      <span className="flex-1 text-left">{label}</span>
      {!!badge && (
        <span className="flex min-w-5 items-center justify-center rounded-full bg-waiting px-1.5 py-0.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </Button>
  )
}

export function ClientSidebar({
  suites,
  activeSuite,
  conversations,
  pendingCount,
  isOwner,
  onClose,
  activeConversationId,
}: {
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  pendingCount: number
  isOwner: boolean
  onClose: () => void
  activeConversationId?: string
}) {
  return (
    <aside className="client-sidebar flex h-full w-72 flex-col bg-brand-ink text-white">
      <div className="flex h-17 items-center justify-between border-b border-white/10 px-5">
        <ClientLogo suite={activeSuite} />
        <Button
          variant="ghost"
          size="icon"
          className="text-paper/60 hover:bg-white/10 hover:text-paper lg:hidden"
          onClick={onClose}
          aria-label={fr.client.closeNavigation}
        >
          <PanelLeftClose aria-hidden="true" className="size-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          <NavItem
            icon={Home}
            label={fr.client.home}
            active={window.location.pathname === "/app"}
            onClick={() => window.location.assign("/app")}
          />
        </div>

        <div className="mb-2 mt-7 flex items-center justify-between px-3">
          <p className="text-xs font-bold uppercase tracking-wider text-paper/40">
            {fr.client.mySuites}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-paper/50 hover:bg-white/10 hover:text-paper"
            aria-label={fr.client.newConversation}
          >
            <Plus aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="space-y-1">
          {suites.map((suite) => {
            const active = suite.id === activeSuite.id
            return (
              <div key={suite.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 w-full justify-start px-3 text-paper/75 hover:bg-white/8 hover:text-paper",
                    active && "bg-white/8 text-paper",
                  )}
                >
                  {active ? (
                    <ChevronDown aria-hidden="true" className="size-4" />
                  ) : (
                    <ChevronRight aria-hidden="true" className="size-4" />
                  )}
                  <span className="truncate">{suite.name}</span>
                </Button>

                {active && (
                  <div className="ml-5 border-l border-white/10 py-1 pl-3">
                    {conversationGroups(conversations).map((group) => (
                      <div key={group.label} className="mb-2">
                        <p className="px-2 pb-1 pt-2 text-xs font-semibold text-paper/30">
                          {group.label}
                        </p>
                        {group.items.map((conversation) => {
                          return (
                            <Button
                              key={conversation.id}
                              variant="ghost"
                              className={cn(
                                "group h-9 w-full justify-start gap-2 px-2 text-left text-xs font-medium text-paper/55 hover:bg-white/8 hover:text-paper",
                                activeConversationId === conversation.id &&
                                  "bg-white/10 text-paper hover:bg-white/10",
                              )}
                              onClick={() =>
                                window.location.assign(
                                  `/app/suites/${activeSuite.id}/conversations/${conversation.id}`,
                                )
                              }
                            >
                              <span className="truncate flex-1">
                                {conversation.title}
                              </span>
                              <span className="flex items-center">
                                {conversation.hasPendingRequest ? (
                                  <span className="size-1.5 shrink-0 rounded-full bg-waiting" />
                                ) : conversation.hasNewDeliverable ? (
                                  <Triangle
                                    aria-label={fr.client.deliverableReady}
                                    className="size-2.5 shrink-0 fill-teal text-teal"
                                  />
                                ) : null}
                              </span>
                            </Button>
                          )
                        })}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      className="mt-1 h-9 w-full justify-start px-2 text-xs text-teal hover:bg-white/8 hover:text-teal"
                    >
                      <MessageSquarePlus
                        aria-hidden="true"
                        className="size-3.5"
                      />
                      {fr.client.newConversation}
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 space-y-1 border-t border-white/10 pt-5">
          <NavItem
            icon={CircleAlert}
            label={fr.client.requests}
            badge={pendingCount}
            active={window.location.pathname === "/app/demandes"}
            onClick={() => window.location.assign("/app/demandes")}
          />
          <NavItem
            icon={FolderOpen}
            label={fr.client.documents}
            active={window.location.pathname === "/app/documents"}
            onClick={() => window.location.assign("/app/documents")}
          />
          <NavItem
            icon={Activity}
            label={fr.client.activity}
            active={window.location.pathname === "/app/activite"}
            onClick={() => window.location.assign("/app/activite")}
          />
          {isOwner && (
            <>
              <NavItem
                icon={Settings}
                label={fr.client.settings}
                active={window.location.pathname.startsWith("/app/parametres")}
                onClick={() => window.location.assign("/app/parametres")}
              />
            </>
          )}
        </div>
      </nav>

      {activeSuite.branding.showPoweredBy && (
        <div className="border-t border-white/10 px-5 py-4">
          <p className="flex items-center gap-2 text-xs font-medium text-paper/40">
            <Sparkles aria-hidden="true" className="size-3.5 text-teal" />
            {fr.client.poweredBy}
          </p>
        </div>
      )}
    </aside>
  )
}

export function ClientAppHeader({
  currentUser,
  pendingCount,
  onOpenNavigation,
  supportMode = false,
}: {
  currentUser: User
  pendingCount: number
  onOpenNavigation: () => void
  supportMode?: boolean
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-17 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8",
        supportMode && "top-10",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenNavigation}
        aria-label={fr.client.openNavigation}
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>

      <div className="relative max-w-xl flex-1">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite"
        />
        <Input
          aria-label={fr.client.searchLabel}
          placeholder={fr.client.searchPlaceholder}
          className="border-transparent bg-muted pl-9 focus-visible:bg-surface"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="relative shrink-0"
        aria-label={fr.client.notifications}
      >
        <Bell aria-hidden="true" className="size-5" />
        {!!pendingCount && (
          <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-surface bg-waiting" />
        )}
      </Button>

      <span className="hidden h-7 w-px bg-line sm:block" />

      <Button
        variant="ghost"
        className="h-11 shrink-0 px-1.5 sm:pr-2"
        aria-label={fr.client.userMenu}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">
          {userInitials(currentUser)}
        </span>
        <span className="hidden text-left md:block">
          <span className="block max-w-32 truncate text-sm font-semibold text-ink">
            {currentUser.name}
          </span>
          <span className="block text-xs font-normal text-graphite">
            {currentUser.role === "owner"
              ? fr.client.ownerRole
              : fr.client.memberRole}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="hidden size-4 text-graphite md:block"
        />
      </Button>
    </header>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

function LoadingHome() {
  return (
    <div aria-label={fr.client.loadingLabel} className="space-y-8">
      <div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-4 h-10 w-80 max-w-full" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-44 w-full rounded-lg" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </div>
  )
}

function ErrorHome() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-lg border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <CircleAlert aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-bold text-ink">
          {fr.client.errorTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-graphite">
          {fr.client.errorDescription}
        </p>
        <Button className="mt-6">{fr.client.retry}</Button>
      </div>
    </div>
  )
}

interface FirstDayProps {
  suite: Suite
  currentUser: User
}

function FirstDay({ suite, currentUser }: FirstDayProps) {
  return (
    <section className="relative overflow-hidden rounded-lg bg-ink p-6 text-paper shadow-card sm:p-9">
      <div className="absolute right-8 top-0 h-24 w-2 rounded-b-full bg-teal" />
      <p className="text-xs font-bold uppercase tracking-wider text-teal">
        {fr.client.firstDayEyebrow}
      </p>
      <h1 className="mt-3 max-w-xl font-heading text-3xl font-extrabold">
        {fr.client.greeting} {currentUser.name.split(" ")[0]}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-paper/70">
        {suite.welcomeMessage}
      </p>
      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {suite.suggestedPrompts.map((prompt) => (
          <Button
            key={prompt}
            variant="ghost"
            className="h-auto min-h-24 justify-start whitespace-normal rounded-lg border border-white/15 bg-white/8 p-4 text-left text-sm leading-5 text-paper hover:bg-white/12 hover:text-paper"
          >
            <MessageSquarePlus
              aria-hidden="true"
              className="size-4 shrink-0 text-teal"
            />
            <span>
              <span className="mb-1 block text-xs font-normal text-paper/45">
                {fr.client.tryPrompt}
              </span>
              {prompt}
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}

function WaitingRequests({
  requests,
  suite,
}: {
  requests: HumanRequest[]
  suite: Suite
}) {
  const urgencyOrder = { high: 0, normal: 1, low: 2 }
  const visibleRequests = [...requests]
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    .slice(0, 3)

  return (
    <section className="overflow-hidden rounded-lg border border-waiting/25 bg-waiting-soft shadow-card">
      <div className="flex items-start gap-4 border-b border-waiting/20 px-5 py-4 sm:px-6">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-waiting text-white">
          <CircleAlert aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            {fr.client.waitingTitle}
          </h2>
          <p className="mt-1 text-sm text-graphite">
            {fr.client.waitingDescription}
          </p>
        </div>
      </div>
      <div className="divide-y divide-waiting/15 bg-surface/55">
        {visibleRequests.map((request) => {
          const agent = authorAgent(suite, request.agent)
          return (
            <article
              key={request.id}
              className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {agent ? (
                  <AgentAvatar agent={agent} size="sm" />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-lg bg-ink text-paper">
                    <UserRound aria-hidden="true" className="size-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-waiting-strong">
                      {requestType(request)}
                    </span>
                    {request.urgency === "high" && (
                      <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">
                        {fr.client.highPriority}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-ink">
                    {humanRequestTitle(request)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-graphite">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    {fr.client.dueSoon} · {request.suiteName}
                  </p>
                </div>
              </div>
              <Button size="default" className="sm:self-center">
                {fr.client.respond}
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function OnboardingChecklist({
  steps,
  suite,
}: {
  steps: OnboardingStep[]
  suite: Suite
}) {
  const done = steps.filter((step) => step.done).length
  if (done === steps.length) return null
  const progress =
    done === 0
      ? "w-0"
      : done / steps.length <= 0.25
        ? "w-1/4"
        : done / steps.length <= 0.5
          ? "w-1/2"
          : done / steps.length <= 0.75
            ? "w-3/4"
            : "w-full"

  return (
    <section className="overflow-hidden rounded-lg border border-action/25 bg-surface shadow-card">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <div
            role="heading"
            aria-level={2}
            className="font-heading text-lg font-bold text-ink"
          >
            {fr.onboarding.title}
          </div>
          <p className="mt-1 text-xs font-semibold text-graphite">
            {done} sur {steps.length} {fr.onboarding.progress}
          </p>
        </div>
        <div className="w-40">
          <div className="h-2 rounded-full bg-muted">
            <div className={cn("h-full rounded-full bg-teal", progress)} />
          </div>
        </div>
      </div>
      <div className="divide-y divide-line">
        {steps.map((step) => {
          const blockingAgents = step.blocksAgents
            .map((name) => suite.agents.find((agent) => agent.name === name))
            .filter((agent) => agent !== undefined)
          return (
            <article
              key={step.key}
              className={cn(
                "flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6",
                step.done && "bg-teal-soft/35",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                  step.done
                    ? "border-teal bg-teal text-white"
                    : "border-line bg-surface text-graphite",
                )}
              >
                {step.done ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <span className="size-2 rounded-full bg-graphite/35" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{step.label}</p>
                <p className="mt-1 text-xs leading-5 text-graphite">
                  {step.description}
                </p>
                {!step.done && blockingAgents.length > 0 && (
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-waiting-strong">
                    <span className="size-2 rounded-full bg-waiting" />
                    {blockingAgents.map((agent) => agent.firstName).join(", ")}{" "}
                    {fr.onboarding.waiting}
                  </p>
                )}
              </div>
              {step.done ? (
                <span className="text-xs font-bold text-teal-strong">
                  {fr.onboarding.done}
                </span>
              ) : (
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    if (step.action.kind === "connect") {
                      window.location.assign("/app/parametres/outils")
                    } else if (step.action.kind === "upload") {
                      window.location.assign("/app/parametres/connaissances")
                    }
                  }}
                >
                  {fr.onboarding.continue}
                  <ChevronRight aria-hidden="true" className="size-4" />
                </Button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

interface SuiteCardProps {
  suite: Suite
  taskCount: number
}

function SuiteCard({ suite, taskCount }: SuiteCardProps) {
  return (
    <article className="rounded-lg border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-strong">
            {fr.client.mySuites}
          </p>
          <h3 className="mt-2 font-heading text-xl font-bold text-ink">
            {suite.name}
          </h3>
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-teal-soft text-teal-strong">
          <Activity aria-hidden="true" className="size-4.5" />
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex -space-x-2">
          {suite.agents.map((agent) => (
            <span
              key={agent.name}
              className="rounded-lg ring-2 ring-surface"
              title={agent.firstName}
            >
              <AgentAvatar agent={agent} size="sm" />
            </span>
          ))}
        </div>
        <p className="text-sm font-semibold text-ink">
          {taskCount}{" "}
          <span className="font-normal text-graphite">
            {fr.client.ongoingTasks}
          </span>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <p className="text-xs text-graphite">
          {fr.client.lastActivity}{" "}
          <span className="font-semibold text-ink">
            {formatActivityDate(suite.lastActivityAt)}
          </span>
        </p>
        <Button variant="outline" size="default">
          <Plus aria-hidden="true" className="size-4" />
          {fr.client.newConversation}
        </Button>
      </div>
    </article>
  )
}

function DeliveredThisWeek({
  documents,
  suite,
}: {
  documents: DocumentItem[]
  suite: Suite
}) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="font-heading text-xl font-bold text-ink">
          {fr.client.deliveredTitle}
        </h2>
        <p className="mt-1 text-sm text-graphite">
          {fr.client.deliveredDescription}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {documents.slice(0, 3).map((document) => {
          const agent = authorAgent(suite, document.author)
          return (
            <article
              key={document.path}
              className="group relative rounded-lg border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-teal/40"
            >
              <span className="absolute right-4 top-0 h-0 w-0 border-x-6 border-t-8 border-x-transparent border-t-teal" />
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-teal-soft text-teal-strong">
                  {document.mimeType === "application/pdf" ? (
                    <FileText aria-hidden="true" className="size-5" />
                  ) : (
                    <File aria-hidden="true" className="size-5" />
                  )}
                </span>
                {agent && <AgentAvatar agent={agent} size="sm" />}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-graphite">
                {documentType(document)}
              </p>
              <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink">
                {document.title}
              </h3>
              <Button
                variant="ghost"
                className="mt-4 h-auto p-0 text-action-strong hover:bg-transparent hover:text-action"
              >
                {fr.client.open}
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ClientHome({
  suites,
  activeSuite,
  currentUser,
  requests,
  usage,
  tasks,
  documents,
  onboarding,
  state,
}: Omit<ClientSpaceProps, "conversations">) {
  if (state === "loading") return <LoadingHome />
  if (state === "error") return <ErrorHome />
  if (state === "empty") {
    return <FirstDay suite={activeSuite} currentUser={currentUser} />
  }

  const openTasks = tasks.filter((task) => task.status !== "done")
  const blockedTaskIds = new Set(
    requests
      .filter(
        (request) =>
          request.type === "question" &&
          request.blocking &&
          !["answered", "expired", "cancelled"].includes(request.status),
      )
      .map((request) => request.taskId),
  )
  const deliveredDocuments = documents.filter(
    (document) => !document.taskId || !blockedTaskIds.has(document.taskId),
  )

  return (
    <div className="space-y-9">
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
          {fr.client.overview}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {fr.client.greeting} {currentUser.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-graphite">{fr.client.homeIntro}</p>
      </section>

      <WaitingRequests requests={requests} suite={activeSuite} />
      <OnboardingChecklist steps={onboarding} suite={activeSuite} />

      <section>
        <div className="mb-5">
          <h2 className="font-heading text-xl font-bold text-ink">
            {fr.client.suitesTitle}
          </h2>
          <p className="mt-1 text-sm text-graphite">
            {fr.client.suitesDescription}
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {suites.map((suite) => (
            <SuiteCard
              key={suite.id}
              suite={suite}
              taskCount={
                openTasks.filter((task) => task.teamId === suite.id).length
              }
            />
          ))}
        </div>
      </section>

      <DeliveredThisWeek
        documents={deliveredDocuments}
        suite={activeSuite}
      />

      {currentUser.role === "owner" && (
        <section>
          <h2 className="mb-5 font-heading text-xl font-bold text-ink">
            {fr.client.creditsTitle}
          </h2>
          <div className="max-w-2xl">
            <CreditsGauge usage={usage} />
          </div>
        </section>
      )}
    </div>
  )
}

export default function ClientSpace({
  suites,
  activeSuite,
  currentUser,
  conversations,
  requests,
  usage,
  tasks,
  documents,
  onboarding,
  state = "ready",
  supportMode = false,
}: ClientSpaceProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const pendingCount = pendingItemCount(requests, currentUser, activeSuite)

  return (
    <div className="min-h-screen bg-paper text-ink">
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

      <div className="lg:pl-72">
        {supportMode && (
          <div className="sticky top-0 z-50 flex h-10 items-center justify-center gap-4 bg-waiting px-4 text-xs font-bold text-brand-ink">
            <span className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {fr.admin.supportBanner}
            </span>
            <span className="rounded-full bg-brand-ink/10 px-2 py-0.5">
              {fr.admin.readOnly}
            </span>
            <Button
              variant="ghost"
              className="h-7 px-2 text-xs text-brand-ink hover:bg-brand-ink/10"
              onClick={() =>
                window.location.assign("/admin/clients/t-0001")
              }
            >
              {fr.admin.exitSupport}
            </Button>
          </div>
        )}
        <ClientAppHeader
          currentUser={currentUser}
          pendingCount={pendingCount}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
          supportMode={supportMode}
        />
        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          <ClientHome
            suites={suites}
            activeSuite={activeSuite}
            currentUser={currentUser}
            requests={requests}
            usage={usage}
            tasks={tasks}
            documents={documents}
            onboarding={onboarding}
            state={state}
          />
        </main>
      </div>
    </div>
  )
}
