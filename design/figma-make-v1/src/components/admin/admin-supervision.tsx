import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  Coins,
  Database,
  Gauge,
  ServerCog,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { AgentAvatar } from "@/components/foundations"
import { Button } from "@/components/ui/button"
import {
  type ActivityEvent,
  type AgentMessage,
  type Suite,
  type Tenant,
  type UsageSummary,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

interface AdminSupervisionProps {
  tenants: Tenant[]
  suites: Suite[]
  usage: UsageSummary[]
  events: ActivityEvent[]
  messages: AgentMessage[]
  dailyCostsEur: number[]
  firstTokenP95Ms: number
  agentTurnP95Seconds: number
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function AdminSupervision({
  tenants,
  suites,
  usage,
  events,
  dailyCostsEur,
  firstTokenP95Ms,
  agentTurnP95Seconds,
}: AdminSupervisionProps) {
  const totalCost = usage.reduce(
    (sum, item) => sum + (item.realCostEur ?? 0),
    0,
  )
  const weightedCache =
    usage.reduce(
      (sum, item) => sum + (item.cacheRatio ?? 0) * item.creditsUsed,
      0,
    ) / Math.max(usage.reduce((sum, item) => sum + item.creditsUsed, 0), 1)
  const weightedFallback =
    usage.reduce(
      (sum, item) => sum + (item.fallbackRate ?? 0) * item.creditsUsed,
      0,
    ) / Math.max(usage.reduce((sum, item) => sum + item.creditsUsed, 0), 1)
  const activeSuites = suites.filter((suite) => suite.status === "running")
  const errors = events.filter((event) => event.type.includes("error"))
  const highestDailyCost = Math.max(...dailyCostsEur, 1)
  const dailyCosts = dailyCostsEur.map((value, index) => ({
      day: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(
        new Date(Date.UTC(2026, 9, index + 1)),
      ),
      value,
      ratio: value / highestDailyCost,
    }))

  const metrics = [
    {
      label: fr.supervisionPage.cacheShare,
      value: `${Math.round(weightedCache * 100)} %`,
      icon: Database,
      tone: "text-teal-strong bg-teal-soft",
    },
    {
      label: fr.supervisionPage.fallbackRate,
      value: `${(weightedFallback * 100).toFixed(1)} %`,
      icon: ServerCog,
      tone: "text-external-strong bg-external-soft",
    },
    {
      label: fr.supervisionPage.latency,
      value: `${firstTokenP95Ms} ms`,
      icon: Clock3,
      tone: "text-action-strong bg-action-soft",
    },
    {
      label: fr.supervisionPage.agentTurnDuration,
      value: `${agentTurnP95Seconds} s`,
      icon: Gauge,
      tone: "text-action-strong bg-action-soft",
    },
    {
      label: fr.supervisionPage.activeTeams,
      value: String(activeSuites.length),
      icon: Activity,
      tone: "text-graphite bg-graphite-soft",
    },
  ]

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.admin.overview}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink">
            {fr.supervisionPage.title}
          </h1>
          <p className="mt-2 text-sm text-graphite">
            {fr.supervisionPage.description}
          </p>
        </header>

        <section className="mt-7 grid grid-cols-5 gap-4">
          {metrics.map(({ label, value, icon: Icon, tone }) => (
            <article
              key={label}
              className="rounded-lg border border-line bg-surface p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-graphite">{label}</p>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md",
                    tone,
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-4 font-heading text-2xl font-extrabold text-ink">
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid grid-cols-[1.2fr_0.8fr] gap-5">
          <article className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.supervisionPage.costsByDay}
              </h2>
              <p className="font-heading text-xl font-extrabold text-ink">
                {formatEuro(totalCost)}
              </p>
            </div>
            <div className="mt-6 flex h-56 items-end gap-4 border-b border-line px-2">
              {dailyCosts.map((item) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-2 font-mono text-xs text-graphite">
                    {formatEuro(item.value)}
                  </span>
                  <span
                    className={cn(
                      "w-full max-w-12 rounded-t bg-teal",
                      item.ratio < 0.7
                        ? "h-1/2"
                        : item.ratio < 0.85
                          ? "h-2/3"
                          : "h-4/5",
                    )}
                  />
                  <span className="py-2 text-xs capitalize text-graphite">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <h2 className="font-heading text-lg font-bold text-ink">
              {fr.supervisionPage.costsByModel}
            </h2>
            <div className="mt-6 space-y-5">
              {[
                ["ak-reason", 0.58],
                ["ak-code", 0.28],
                ["ak-light", 0.14],
              ].map(([model, ratio]) => (
                <div key={String(model)}>
                  <div className="mb-2 flex justify-between text-xs">
                    <code className="font-bold text-ink">{model}</code>
                    <span className="font-mono text-graphite">
                      {formatEuro(totalCost * Number(ratio))}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-action",
                        Number(ratio) > 0.5
                          ? "w-3/4"
                          : Number(ratio) > 0.2
                            ? "w-1/2"
                            : "w-1/4",
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-5 grid grid-cols-[0.8fr_1.2fr] gap-5">
          <article className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <h2 className="font-heading text-lg font-bold text-ink">
              {fr.supervisionPage.costsByClient}
            </h2>
            <div className="mt-5 space-y-4">
              {usage.map((item) => {
                const tenant = tenants.find(
                  (candidate) => candidate.id === item.tenantId,
                )
                const ratio = (item.realCostEur ?? 0) / Math.max(totalCost, 1)
                return (
                  <div key={item.tenantId}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-semibold text-ink">
                        {tenant?.name}
                      </span>
                      <span className="font-mono text-graphite">
                        {formatEuro(item.realCostEur ?? 0)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full bg-teal",
                          ratio > 0.5
                            ? "w-full"
                            : ratio > 0.2
                              ? "w-1/2"
                              : "w-1/4",
                        )}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.supervisionPage.activeTeams}
              </h2>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-strong">
                <span className="size-2 rounded-full bg-teal" />
                {fr.supervisionPage.queueHealthy}
              </span>
            </div>
            <div className="divide-y divide-line">
              {activeSuites.map((suite) => (
                <div
                  key={suite.id}
                  className="grid grid-cols-[1fr_0.6fr_0.5fr_auto] items-center gap-4 px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-ink">{suite.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-graphite">
                      {suite.id}
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    {suite.agents.slice(0, 3).map((agent) => (
                      <span
                        key={agent.name}
                        className="rounded-lg ring-2 ring-surface"
                      >
                        <AgentAvatar agent={agent} size="sm" />
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-xs text-graphite">
                    {suite.agents.filter((agent) => agent.status === "working").length}{" "}
                    actifs
                  </span>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs text-action-strong"
                    onClick={() =>
                      window.location.assign(
                        `/admin/supervision/equipes/${suite.id}/journal`,
                      )
                    }
                  >
                    {fr.supervisionPage.openJournal}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-5 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-heading text-lg font-bold text-ink">
              {fr.supervisionPage.recentErrors}
            </h2>
            <AlertTriangle aria-hidden="true" className="size-5 text-danger" />
          </div>
          {errors.length > 0 ? (
            <div className="divide-y divide-line">
              {errors.map((event) => (
                <div
                  key={event.seq}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <span className="flex size-8 items-center justify-center rounded-md bg-danger-soft text-danger">
                    <AlertTriangle aria-hidden="true" className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {event.summary}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-graphite">
                      {event.actor} · #{event.seq}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-8 text-xs text-action-strong"
                    onClick={() =>
                      window.location.assign(
                        `/admin/supervision/equipes/${event.teamId}/journal`,
                      )
                    }
                  >
                    {fr.supervisionPage.openJournal}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-graphite">
              {fr.supervisionPage.noErrors}
            </p>
          )}
        </section>
      </div>
    </AdminShell>
  )
}
