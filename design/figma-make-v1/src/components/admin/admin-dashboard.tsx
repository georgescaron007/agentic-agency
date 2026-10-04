import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CircleDollarSign,
  CircleGauge,
  Plus,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import {
  type ActivityEvent,
  type HumanRequest,
  type Suite,
  type SuiteVersion,
  type Tenant,
  type UsageSummary,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { planDetails } from "@/lib/plans"
import { cn } from "@/lib/utils"

interface AdminDashboardProps {
  tenants: Tenant[]
  suites: Suite[]
  versions: SuiteVersion[]
  usage: UsageSummary[]
  requests: HumanRequest[]
  events: ActivityEvent[]
  infrastructureCostEur: number
}

function formatEuro(value: number, decimals = 0) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Users
  accent?: boolean
}) {
  return (
    <article
      className={cn(
        "rounded-lg border border-line bg-surface p-4 shadow-card",
        accent && "border-teal/30 bg-teal-soft",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-graphite">{label}</p>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-md",
            accent
              ? "bg-teal text-white"
              : "bg-graphite-soft text-graphite",
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-4 font-heading text-2xl font-extrabold text-ink">
        {value}
      </p>
      <p className="mt-1 text-xs text-graphite">{detail}</p>
    </article>
  )
}

export default function AdminDashboard({
  tenants,
  suites,
  versions,
  usage,
  requests,
  events,
  infrastructureCostEur,
}: AdminDashboardProps) {
  const activeClients = tenants.filter(
    (tenant) => tenant.status === "active",
  ).length
  const publishedSuites = versions.filter(
    (version) => version.status === "published",
  ).length
  const pendingRequests = requests.filter((request) =>
    ["pending", "reminded", "escalated"].includes(request.status),
  ).length
  const totalCost = usage.reduce(
    (sum, item) => sum + (item.realCostEur ?? 0),
    0,
  )
  const revenue = tenants
    .filter((tenant) => tenant.status === "active")
    .reduce(
      (sum, tenant) => sum + planDetails[tenant.plan].monthlyPriceEur,
      0,
    )
  const margin =
    revenue > 0
      ? ((revenue - totalCost - infrastructureCostEur) / revenue) * 100
      : 0
  const highUsage = usage.filter(
    (item) => item.creditsUsed / item.creditsIncluded >= 0.8,
  )
  const highUsageNames = highUsage
    .map(
      (item) =>
        tenants.find((tenant) => tenant.id === item.tenantId)?.name,
    )
    .filter((name): name is string => Boolean(name))
  const errorCount = events.filter((event) =>
    event.type.includes("error"),
  ).length
  const abnormalFallbacks = usage.filter(
    (item) => (item.fallbackRate ?? 0) >= 0.05,
  )
  const expiredRequests = requests.filter(
    (request) => request.status === "expired",
  ).length

  const alerts = [
    {
      title: fr.admin.creditAlert,
      detail: `${highUsage.length} ${
        highUsage.length === 1
          ? fr.admin.clientSingular
          : fr.admin.clients.toLowerCase()
      }${
        highUsageNames.length > 0 ? ` (${highUsageNames.join(", ")})` : ""
      }`,
      tone: "bg-waiting-soft text-waiting-strong",
      icon: CircleGauge,
      action: fr.admin.viewClient,
    },
    {
      title: fr.admin.errorIncrease,
      detail: `${errorCount} ${fr.admin.eventsLastSevenDays}`,
      tone: "bg-danger-soft text-danger",
      icon: AlertTriangle,
      action: fr.admin.investigate,
    },
    {
      title: fr.admin.fallbackAlert,
      detail: `${abnormalFallbacks.length} ${fr.admin.clients.toLowerCase()}`,
      tone: "bg-external-soft text-external-strong",
      icon: ShieldAlert,
      action: fr.admin.investigate,
    },
    {
      title: fr.admin.expiredRequests,
      detail: `${expiredRequests} ${fr.admin.pendingRequests.toLowerCase()}`,
      tone: "bg-graphite-soft text-graphite",
      icon: AlertTriangle,
      action: fr.admin.investigate,
    },
  ]

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
              {fr.admin.overview}
            </p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink">
              {fr.admin.dashboardTitle}
            </h1>
            <p className="mt-2 text-sm text-graphite">
              {fr.admin.dashboardDescription}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Building2 aria-hidden="true" className="size-4" />
              {fr.admin.newClient}
            </Button>
            <Button>
              <Plus aria-hidden="true" className="size-4" />
              {fr.admin.newSuite}
            </Button>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-4 gap-4">
          <MetricCard
            label={fr.admin.activeClients}
            value={String(activeClients)}
            detail={`${activeClients} ${fr.admin.activeClientsSummary} ${tenants.length}`}
            icon={Users}
          />
          <MetricCard
            label={fr.admin.publishedSuites}
            value={String(publishedSuites)}
            detail={`${suites.length} ${fr.admin.suites.toLowerCase()}`}
            icon={Sparkles}
          />
          <MetricCard
            label={fr.admin.pendingRequests}
            value={String(pendingRequests)}
            detail={fr.admin.currentMonth}
            icon={ShieldAlert}
            accent
          />
          <MetricCard
            label={fr.admin.margin}
            value={`${Math.round(margin)} %`}
            detail={`${formatEuro(totalCost, 2)} ${fr.admin.realLlmCost.toLowerCase()}`}
            icon={CircleDollarSign}
          />
        </section>

        <section className="mt-5 grid grid-cols-[1.35fr_0.65fr] gap-5">
          <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.admin.alerts}
              </h2>
              <span className="rounded-full bg-danger-soft px-2.5 py-1 text-xs font-bold text-danger">
                {alerts.length}
              </span>
            </div>
            <div className="divide-y divide-line">
              {alerts.map(({ title, detail, tone, icon: Icon, action }) => (
                <div
                  key={title}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-md",
                      tone,
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{title}</p>
                    <p className="mt-0.5 text-xs text-graphite">{detail}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs text-action-strong"
                  >
                    {action}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <article className="rounded-lg bg-brand-ink p-5 text-white shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-white/45">
                {fr.admin.monthlyEconomics}
              </p>
              <div className="mt-5 grid grid-cols-3 items-end gap-4">
                <div>
                  <p className="text-xs text-white/50">{fr.admin.revenue}</p>
                  <p className="mt-1 font-heading text-2xl font-extrabold">
                    {formatEuro(revenue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">{fr.admin.realLlmCost}</p>
                  <p className="mt-1 font-heading text-lg font-bold text-teal">
                    {formatEuro(totalCost, 2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">
                    {fr.admin.infrastructure}
                  </p>
                  <p className="mt-1 font-heading text-lg font-bold">
                    {formatEuro(infrastructureCostEur)}
                  </p>
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-teal" />
              </div>
              <p className="mt-2 text-right text-xs font-semibold text-white/60">
                {fr.admin.margin} · {Math.round(margin)} %
              </p>
            </article>

            <article className="rounded-lg border border-line bg-surface p-5 shadow-card">
              <h2 className="font-heading text-base font-bold text-ink">
                {fr.admin.shortcuts}
              </h2>
              <div className="mt-4 grid gap-2">
                <Button className="justify-start">
                  <Building2 aria-hidden="true" className="size-4" />
                  {fr.admin.newClient}
                </Button>
                <Button variant="outline" className="justify-start">
                  <Plus aria-hidden="true" className="size-4" />
                  {fr.admin.newSuite}
                </Button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
