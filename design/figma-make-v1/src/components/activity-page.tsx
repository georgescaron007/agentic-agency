import { useMemo, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  MessageSquareText,
  Sparkles,
  TimerReset,
} from "lucide-react"

import ClientPageShell from "@/components/client-page-shell"
import { AgentAvatar, HumanAvatar } from "@/components/foundations"
import { Button } from "@/components/ui/button"
import {
  type ActivityEvent,
  type Conversation,
  type HumanRequest,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

type ActivityView = "timeline" | "summary"
type EventFilter = "all" | "task" | "request" | "document" | "error"
type PeriodFilter = "all" | "seven" | "thirty"

interface ActivityPageProps {
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  requests: HumanRequest[]
  events: ActivityEvent[]
  currentUser: User
}

function eventIcon(type: string) {
  if (type.startsWith("task")) return CheckCircle2
  if (type.startsWith("human_request")) return MessageSquareText
  if (type.startsWith("document")) return FileCheck2
  if (type.includes("error")) return AlertTriangle
  return Sparkles
}

function eventTone(type: string) {
  if (type.includes("error")) return "bg-danger-soft text-danger"
  if (type.startsWith("human_request")) {
    return "bg-waiting-soft text-waiting-strong"
  }
  if (type.startsWith("document")) return "bg-teal-soft text-teal-strong"
  return "bg-action-soft text-action-strong"
}

function matchesType(type: string, filter: EventFilter) {
  if (filter === "all") return true
  if (filter === "task") return type.startsWith("task")
  if (filter === "request") return type.startsWith("human_request")
  if (filter === "document") return type.startsWith("document")
  return type.includes("error")
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function ActivityFilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className="h-8 rounded-full px-3 text-xs"
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

function Timeline({
  events,
  suite,
}: {
  events: ActivityEvent[]
  suite: Suite
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-10 text-center text-sm text-graphite">
        {fr.activityPage.noActivity}
      </div>
    )
  }

  return (
    <div className="relative">
      <span className="absolute bottom-5 left-5 top-5 w-px bg-line sm:left-6" />
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = eventIcon(event.type)
          const agent = suite.agents.find(
            (item) => item.name === event.actor,
          )
          const human = suite.humans.find((item) => item.id === event.actor)
          return (
            <article
              key={event.seq}
              className="relative flex items-start gap-4 rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5"
            >
              <span
                className={cn(
                  "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-paper sm:size-12",
                  eventTone(event.type),
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm leading-6 text-ink">
                    <strong>{agent?.firstName ?? human?.name}</strong>{" "}
                    {event.summary}
                  </p>
                  <span className="shrink-0 font-mono text-xs text-graphite">
                    #{event.seq}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-graphite">
                  {agent && <AgentAvatar agent={agent} size="sm" />}
                  {human && (
                    <HumanAvatar user={human} status="working" size="sm" />
                  )}
                  <span>{formatEventDate(event.createdAt)}</span>
                  <span>·</span>
                  <span>{suite.name}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function WeeklySummary({ events }: { events: ActivityEvent[] }) {
  const taskCount = events.filter((event) =>
    event.type.startsWith("task"),
  ).length
  const documentCount = events.filter((event) =>
    event.type.startsWith("document"),
  ).length
  const decisionCount = events.filter((event) =>
    event.type.startsWith("human_request"),
  ).length
  const estimatedHours = (events.length * 2.3).toFixed(1).replace(".", ",")
  const metrics = [
    {
      label: fr.activityPage.completedTasks,
      value: String(taskCount),
      icon: CheckCircle2,
      tone: "bg-teal-soft text-teal-strong",
    },
    {
      label: fr.activityPage.producedDocuments,
      value: String(documentCount),
      icon: FileCheck2,
      tone: "bg-action-soft text-action-strong",
    },
    {
      label: fr.activityPage.humanDecisions,
      value: String(decisionCount),
      icon: MessageSquareText,
      tone: "bg-waiting-soft text-waiting-strong",
    },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article
            key={label}
            className="rounded-lg border border-line bg-surface p-5 shadow-card"
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                tone,
              )}
            >
              <Icon aria-hidden="true" className="size-4.5" />
            </span>
            <p className="mt-5 font-heading text-3xl font-extrabold text-ink">
              {value}
            </p>
            <p className="mt-1 text-sm text-graphite">{label}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <div className="grid lg:grid-cols-[1fr_1.3fr]">
          <div className="bg-brand-ink p-6 text-white sm:p-8">
            <TimerReset aria-hidden="true" className="size-6 text-teal" />
            <p className="mt-8 text-sm text-white/60">
              {fr.activityPage.timeSaved}
            </p>
            <p className="mt-2 font-heading text-5xl font-extrabold">
              {estimatedHours}
              <span className="ml-2 text-lg font-semibold text-teal">
                {fr.activityPage.hours}
              </span>
            </p>
            <p className="mt-4 text-xs leading-5 text-white/50">
              {fr.activityPage.estimateDescription}
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <BarChart3
                aria-hidden="true"
                className="size-5 text-teal-strong"
              />
              <h3 className="font-heading text-lg font-bold text-ink">
                {fr.activityPage.workCompleted}
              </h3>
            </div>
            <div className="mt-7 space-y-5">
              {[
                [
                  fr.activityPage.commercialProposals,
                  "w-4/5",
                  String(documentCount),
                ],
                [
                  fr.activityPage.crmUpdates,
                  "w-2/3",
                  String(taskCount),
                ],
                [
                  fr.activityPage.preparedFollowUps,
                  "w-1/2",
                  String(decisionCount),
                ],
              ].map(([label, width, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-medium text-ink">{label}</span>
                    <span className="font-mono text-graphite">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full bg-teal", width)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

export default function ActivityPage({
  suites,
  activeSuite,
  conversations,
  requests,
  events,
  currentUser,
}: ActivityPageProps) {
  const [view, setView] = useState<ActivityView>("timeline")
  const [suiteFilter, setSuiteFilter] = useState("all")
  const [agentFilter, setAgentFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<EventFilter>("all")
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all")

  const filteredEvents = useMemo(() => {
    const referenceTime = Math.max(
      ...events.map((event) => new Date(event.createdAt).getTime()),
    )
    return events.filter((event) => {
      const ageInDays =
        (referenceTime - new Date(event.createdAt).getTime()) / 86_400_000
      const periodMatches =
        periodFilter === "all" ||
        (periodFilter === "seven" && ageInDays <= 7) ||
        (periodFilter === "thirty" && ageInDays <= 30)
      return (
        (suiteFilter === "all" || event.teamId === suiteFilter) &&
        (agentFilter === "all" || event.actor === agentFilter) &&
        matchesType(event.type, typeFilter) &&
        periodMatches
      )
    })
  }, [agentFilter, events, periodFilter, suiteFilter, typeFilter])

  return (
    <ClientPageShell
      suites={suites}
      activeSuite={activeSuite}
      conversations={conversations}
      requests={requests}
      currentUser={currentUser}
    >
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.activityPage.eyebrow}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink sm:text-4xl">
            {fr.activityPage.title}
          </h1>
          <p className="mt-2 text-sm text-graphite">
            {fr.activityPage.description}
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <Button
              variant="ghost"
              className={cn(
                "h-9 flex-1 px-4 text-sm lg:flex-none",
                view === "timeline" && "bg-surface text-ink shadow-sm",
              )}
              onClick={() => setView("timeline")}
            >
              {fr.activityPage.timeline}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "h-9 flex-1 px-4 text-sm lg:flex-none",
                view === "summary" && "bg-surface text-ink shadow-sm",
              )}
              onClick={() => setView("summary")}
            >
              {fr.activityPage.weeklySummary}
            </Button>
          </div>
          {view === "timeline" && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter aria-hidden="true" className="size-4 text-graphite" />
              <ActivityFilterButton
                active={suiteFilter === "all"}
                label={fr.activityPage.allSuites}
                onClick={() => setSuiteFilter("all")}
              />
              <ActivityFilterButton
                active={suiteFilter === activeSuite.id}
                label={activeSuite.name}
                onClick={() => setSuiteFilter(activeSuite.id)}
              />
              <span className="mx-1 h-6 w-px bg-line" />
              <ActivityFilterButton
                active={agentFilter === "all"}
                label={fr.activityPage.allAgents}
                onClick={() => setAgentFilter("all")}
              />
              {activeSuite.agents.map((agent) => (
                <ActivityFilterButton
                  key={agent.name}
                  active={agentFilter === agent.name}
                  label={agent.firstName}
                  onClick={() => setAgentFilter(agent.name)}
                />
              ))}
            </div>
          )}
        </div>

        {view === "timeline" && (
          <>
            <div className="my-5 flex flex-wrap gap-2">
              {[
                ["all", fr.activityPage.allTypes],
                ["task", fr.activityPage.tasks],
                ["request", fr.activityPage.requests],
                ["document", fr.activityPage.deliverables],
                ["error", fr.activityPage.errors],
              ].map(([value, label]) => (
                <ActivityFilterButton
                  key={value}
                  active={typeFilter === value}
                  label={label}
                  onClick={() => setTypeFilter(value as EventFilter)}
                />
              ))}
              <span className="mx-1 w-px bg-line" />
              {[
                ["all", fr.activityPage.allPeriods],
                ["seven", fr.activityPage.lastSevenDays],
                ["thirty", fr.activityPage.lastThirtyDays],
              ].map(([value, label]) => (
                <ActivityFilterButton
                  key={value}
                  active={periodFilter === value}
                  label={label}
                  onClick={() => setPeriodFilter(value as PeriodFilter)}
                />
              ))}
            </div>
            <p className="mb-4 text-xs font-semibold text-graphite">
              {filteredEvents.length} {fr.activityPage.events}
            </p>
            <Timeline events={filteredEvents} suite={activeSuite} />
          </>
        )}

        {view === "summary" && (
          <div className="mt-6">
            <WeeklySummary events={filteredEvents} />
          </div>
        )}
      </main>
    </ClientPageShell>
  )
}
