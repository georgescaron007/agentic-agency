import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Blocks,
  Check,
  CircleDollarSign,
  Clock3,
  Code2,
  Copy,
  Coins,
  Gauge,
  Plus,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  UserRoundCog,
  Users,
  X,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { AgentAvatar, HumanAvatar } from "@/components/foundations"
import {
  ConnectorConnectionSummary,
  ConnectorLogo,
} from "@/components/integration-components"
import KnowledgeLibrary from "@/components/knowledge-library"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  type ModelAlias,
  type Connection,
  type ConnectorType,
  type KnowledgeDocument,
  type Suite,
  type SuiteVersion,
  type Tenant,
  type UsageSummary,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { planDetails } from "@/lib/plans"
import { cn } from "@/lib/utils"

type ClientTab =
  | "overview"
  | "suites"
  | "users"
  | "usage"
  | "connectors"
  | "knowledge"
  | "configuration"

interface AdminClientDetailProps {
  tenant: Tenant
  suites: Suite[]
  users: User[]
  usage: UsageSummary
  versions: SuiteVersion[]
  connectorTypes: ConnectorType[]
  connections: Connection[]
  knowledge: KnowledgeDocument[]
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function DataCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Users
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-graphite">{label}</p>
        <Icon aria-hidden="true" className="size-4 text-teal-strong" />
      </div>
      <p className="mt-3 font-heading text-xl font-extrabold text-ink">
        {value}
      </p>
      <p className="mt-1 text-xs text-graphite">{detail}</p>
    </article>
  )
}

function OverviewTab({
  tenant,
  suites,
  users,
  usage,
}: {
  tenant: Tenant
  suites: Suite[]
  users: User[]
  usage: UsageSummary
}) {
  const ratio = usage.creditsUsed / usage.creditsIncluded
  const plan = planDetails[tenant.plan]
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <DataCard
          label={fr.admin.plan}
          value={
            tenant.plan === "business"
              ? fr.admin.business
              : fr.admin.smallTeam
          }
          detail={`${plan.monthlyPriceEur} € / mois · ${users.filter((user) => user.active).length} / ${tenant.maxUsers} ${fr.admin.users.toLowerCase()}`}
          icon={Blocks}
        />
        <DataCard
          label={fr.admin.suites}
          value={String(suites.length)}
          detail={`${suites.filter((suite) => suite.status === "running").length} ${fr.admin.active.toLowerCase()}`}
          icon={Activity}
        />
        <DataCard
          label={fr.admin.realCost}
          value={formatEuro(usage.realCostEur ?? 0)}
          detail={fr.admin.currentMonth}
          icon={CircleDollarSign}
        />
        <DataCard
          label={fr.admin.accountHealth}
          value={ratio >= 0.8 ? fr.admin.creditAlert : fr.admin.active}
          detail={`${Math.round(ratio * 100)} % ${fr.admin.credits.toLowerCase()}`}
          icon={ratio >= 0.8 ? AlertTriangle : ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5">
        <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
          <h2 className="font-heading text-lg font-bold text-ink">
            {fr.admin.planUsage}
          </h2>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="font-heading text-3xl font-extrabold text-ink">
                {Math.round(ratio * 100)} %
              </p>
              <p className="mt-1 text-xs text-graphite">
                {new Intl.NumberFormat("fr-FR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(usage.creditsUsed)}{" "}
                /{" "}
                {new Intl.NumberFormat("fr-FR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(usage.creditsIncluded)}
              </p>
            </div>
            <p className="text-right text-xs text-graphite">
              {fr.admin.projection}
              <br />
              <strong className="text-ink">
                {new Intl.NumberFormat("fr-FR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(usage.projectedEndOfMonth)}
              </strong>
            </p>
          </div>
          <div className="mt-5 h-3 rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                ratio >= 1
                  ? "w-full bg-danger"
                  : ratio >= 0.8
                    ? "w-4/5 bg-waiting"
                    : "w-1/2 bg-teal",
              )}
            />
          </div>
        </section>

        <section className="rounded-lg border border-line bg-brand-ink p-5 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-white/45">
            {fr.admin.configurationModels}
          </p>
          <div className="mt-5 space-y-3 font-mono text-xs">
            {[
              ["ak-reason", "claude-sonnet-4"],
              ["ak-code", "claude-sonnet-4"],
              ["ak-light", "gpt-4.1-mini"],
            ].map(([alias, model]) => (
              <div
                key={alias}
                className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2"
              >
                <span className="text-teal">{alias}</span>
                <span className="text-white/65">{model}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function SuitesTab({
  suites,
  versions,
}: {
  suites: Suite[]
  versions: SuiteVersion[]
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            {fr.admin.suites}
          </h2>
          <p className="mt-1 text-xs text-graphite">
            {suites.length} {fr.admin.suites.toLowerCase()}
          </p>
        </div>
        <Button>
          <Plus aria-hidden="true" className="size-4" />
          {fr.admin.newSuite}
        </Button>
      </div>
      <div className="divide-y divide-line">
        {suites.map((suite) => {
          const published = versions.find(
            (version) =>
              version.suiteId === suite.id && version.status === "published",
          )
          const draft = versions.find(
            (version) =>
              version.suiteId === suite.id && version.status === "draft",
          )
          return (
            <article
              key={suite.id}
              className="grid grid-cols-[1.2fr_0.7fr_0.7fr_auto] items-center gap-5 px-5 py-4"
            >
              <div>
                <div className="flex items-center gap-3">
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
                  <div>
                    <p className="text-sm font-bold text-ink">{suite.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-graphite">
                      {suite.templateKey}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-graphite">
                  {fr.admin.publishedVersion}
                </p>
                <p className="mt-1 text-sm font-bold text-ink">
                  v{published?.version ?? "—"}{" "}
                  <span className="rounded-full bg-teal-soft px-2 py-0.5 text-xs text-teal-strong">
                    {fr.admin.published}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-graphite">{fr.admin.draft}</p>
                <p className="mt-1 text-sm font-bold text-ink">
                  {draft
                    ? `v${draft.version} · ${formatDate(draft.createdAt)}`
                    : fr.admin.noDraft}
                </p>
              </div>
              <Button
                variant="outline"
                className="h-8 text-xs"
                onClick={() =>
                  window.location.assign(
                    `/admin/clients/${suite.tenantId}/suites/${suite.id}`,
                  )
                }
              >
                {fr.admin.configuration}
              </Button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function UsersTab({ users }: { users: User[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="grid grid-cols-[1fr_1fr_0.5fr_0.5fr] border-b border-line bg-paper px-5 py-3 text-xs font-bold uppercase tracking-wide text-graphite">
        <span>{fr.admin.users}</span>
        <span>{fr.settingsPage.email}</span>
        <span>{fr.admin.role}</span>
        <span>{fr.admin.status}</span>
      </div>
      {users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-[1fr_1fr_0.5fr_0.5fr] items-center border-b border-line px-5 py-3 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <HumanAvatar
              user={user}
              status={user.active ? "working" : "paused"}
              size="sm"
            />
            <span className="text-sm font-bold text-ink">{user.name}</span>
          </div>
          <span className="text-xs text-graphite">{user.email}</span>
          <span className="text-xs font-semibold text-ink">
            {user.role === "owner"
              ? fr.settingsPage.owner
              : fr.settingsPage.member}
          </span>
          <span
            className={cn(
              "w-fit rounded-full px-2.5 py-1 text-xs font-bold",
              user.active
                ? "bg-teal-soft text-teal-strong"
                : "bg-graphite-soft text-graphite",
            )}
          >
            {user.active ? fr.admin.active : fr.settingsPage.disabled}
          </span>
        </div>
      ))}
    </section>
  )
}

function CostBar({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) {
  const ratio = max > 0 ? value / max : 0
  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-xs">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-mono text-graphite">{formatEuro(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-action",
            ratio >= 0.75
              ? "w-full"
              : ratio >= 0.5
                ? "w-2/3"
                : "w-1/3",
          )}
        />
      </div>
    </div>
  )
}

function UsageTab({
  usage,
  suites,
}: {
  usage: UsageSummary
  suites: Suite[]
}) {
  const totalCost = usage.realCostEur ?? 0
  return (
    <div className="grid grid-cols-2 gap-5">
      <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.settingsPage.bySuite}
        </h2>
        <div className="mt-5 space-y-5">
          {usage.bySuite.map((item) => (
            <CostBar
              key={item.suiteId}
              label={item.name}
              value={
                totalCost * (item.credits / Math.max(usage.creditsUsed, 1))
              }
              max={totalCost}
            />
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.settingsPage.byAgent}
        </h2>
        <div className="mt-5 space-y-4">
          {usage.byAgent.map((item) => {
            const suite = suites.find((candidate) => candidate.id === item.suiteId)
            const agent = suite?.agents.find(
              (candidate) => candidate.name === item.agent,
            )
            return (
              <CostBar
                key={`${item.suiteId}-${item.agent}`}
                label={agent?.firstName ?? item.agent}
                value={
                  totalCost * (item.credits / Math.max(usage.creditsUsed, 1))
                }
                max={totalCost}
              />
            )
          })}
        </div>
      </section>
      <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.admin.costByModel}
        </h2>
        <div className="mt-5 space-y-5">
          <CostBar
            label="ak-reason"
            value={totalCost * 0.58}
            max={totalCost}
          />
          <CostBar
            label="ak-code"
            value={totalCost * 0.28}
            max={totalCost}
          />
          <CostBar
            label="ak-light"
            value={totalCost * 0.14}
            max={totalCost}
          />
        </div>
      </section>
      <section className="rounded-lg bg-brand-ink p-5 text-white shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-white/45">
          {fr.admin.technicalSignals}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50">{fr.admin.realCost}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold">
              {formatEuro(totalCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">{fr.admin.cacheShare}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold text-teal">
              {Math.round((usage.cacheRatio ?? 0) * 100)} %
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">{fr.admin.fallbackRate}</p>
            <p className="mt-1 font-heading text-xl font-bold">
              {((usage.fallbackRate ?? 0) * 100).toFixed(1)} %
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">{fr.admin.credits}</p>
            <p className="mt-1 font-mono text-sm font-bold">
              {new Intl.NumberFormat("fr-FR", {
                notation: "compact",
              }).format(usage.creditsUsed)}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ConfigurationTab({ tenant }: { tenant: Tenant }) {
  const plan = planDetails[tenant.plan]
  const aliases: Array<[ModelAlias, string]> = [
    ["ak-reason", "claude-sonnet-4"],
    ["ak-code", "claude-sonnet-4"],
    ["ak-light", "gpt-4.1-mini"],
  ]
  return (
    <div className="grid grid-cols-[1.1fr_0.9fr] gap-5">
      <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-ink">
            {fr.admin.configurationModels}
          </h2>
        </div>
        <div className="grid grid-cols-2 border-b border-line bg-paper px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-graphite">
          <span>{fr.admin.platformAlias}</span>
          <span>{fr.admin.effectiveModel}</span>
        </div>
        {aliases.map(([alias, model]) => (
          <div
            key={alias}
            className="grid grid-cols-2 items-center border-b border-line px-5 py-3 last:border-b-0"
          >
            <code className="text-xs font-bold text-action-strong">
              {alias}
            </code>
            <code className="text-xs text-ink">{model}</code>
          </div>
        ))}
      </section>
      <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.admin.limits}
        </h2>
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-md bg-paper px-4 py-3">
            <span className="text-xs text-graphite">{fr.admin.maxUsers}</span>
            <strong className="font-mono text-sm text-ink">
              {tenant.maxUsers}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-paper px-4 py-3">
            <span className="text-xs text-graphite">{fr.admin.maxCredits}</span>
            <strong className="font-mono text-sm text-ink">
              {new Intl.NumberFormat("fr-FR", {
                notation: "compact",
                maximumFractionDigits: 0,
              }).format(plan.creditsIncluded)}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-paper px-4 py-3">
            <span className="text-xs text-graphite">max_steps_per_turn</span>
            <strong className="font-mono text-sm text-ink">24</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

function ConnectorsTab({
  connectorTypes,
  connections,
  suites,
  users,
}: {
  connectorTypes: ConnectorType[]
  connections: Connection[]
  suites: Suite[]
  users: User[]
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-waiting/25 bg-waiting-soft px-5 py-3 text-xs font-semibold text-waiting-strong">
        <ShieldCheck aria-hidden="true" className="size-4" />
        {fr.connectors.clientOnly}
      </div>
      <div className="grid grid-cols-[1fr_0.7fr_0.9fr_0.7fr_0.8fr_1.1fr] border-b border-line bg-paper px-5 py-3 text-xs font-bold uppercase tracking-wide text-graphite">
        <span>Connecteur</span>
        <span>{fr.admin.status}</span>
        <span>{fr.connectors.account}</span>
        <span>{fr.connectors.access}</span>
        <span>{fr.connectors.expiration}</span>
        <span>{fr.connectors.lastError}</span>
      </div>
      {connectorTypes.map((connector) => {
        const connectorConnections = connections.filter(
          (item) => item.connectorKey === connector.key,
        )
        const connection = connectorConnections[0]
        const actionableConnections = connectorConnections.filter(
          (item) =>
            item.status === "not_connected" ||
            item.status === "pending_invite" ||
            item.status === "expired" ||
            item.status === "error",
        )
        const needsInvitation =
          connectorConnections.length === 0 ||
          actionableConnections.some(
            (item) => item.status === "not_connected",
          )
        const needsReminder = actionableConnections.some(
          (item) =>
            item.status === "pending_invite" ||
            item.status === "expired" ||
            item.status === "error",
        )
        return (
          <article
            key={connector.key}
            className="border-b border-line px-5 py-4 last:border-b-0"
          >
            <div className="grid grid-cols-[1fr_0.7fr_0.9fr_0.7fr_0.8fr_1.1fr] items-center gap-4">
              <div className="flex items-center gap-3">
                <ConnectorLogo connector={connector} size="sm" />
                <div>
                  <p className="text-sm font-bold text-ink">
                    {connector.name}
                  </p>
                  <p className="mt-0.5 text-xs text-graphite">
                    {connection?.requiredBySuites
                      .map((id) => suites.find((suite) => suite.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <ConnectorConnectionSummary
                connector={connector}
                connections={connectorConnections}
                users={users}
              />
              <span className="truncate text-xs text-ink">
                {connection?.accountLabel ?? "—"}
              </span>
              <span className="text-xs text-ink">
                {connection?.grantedAccess === "read_write"
                  ? fr.connectors.readWrite
                  : fr.connectors.read}
              </span>
              <span className="text-xs text-graphite">
                {connection?.expiresAt
                  ? new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(connection.expiresAt))
                  : "—"}
              </span>
              <span className="text-xs text-danger">
                {connection?.lastError ?? "—"}
              </span>
            </div>
            {(needsInvitation || needsReminder) && (
              <div className="mt-3 flex justify-end gap-2">
                {needsInvitation && (
                  <Button variant="outline" className="h-8 text-xs">
                    {fr.connectors.sendInvite}
                  </Button>
                )}
                <Button variant="ghost" className="h-8 text-xs">
                  <Copy aria-hidden="true" className="size-3.5" />
                  {fr.connectors.copyLink}
                </Button>
                {needsReminder && (
                  <Button variant="ghost" className="h-8 text-xs">
                    <RefreshCw aria-hidden="true" className="size-3.5" />
                    {fr.connectors.remind}
                  </Button>
                )}
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}

function SupportAccessDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  const [reason, setReason] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/50 p-6 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-lg border border-line bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-waiting-soft text-waiting-strong">
            <UserRoundCog aria-hidden="true" className="size-5" />
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <h2 className="mt-5 font-heading text-xl font-bold text-ink">
          {fr.admin.supportReasonTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-graphite">
          {fr.admin.supportReasonDescription}
        </p>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={fr.admin.supportReasonPlaceholder}
          className="mt-5 min-h-28"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {fr.admin.cancel}
          </Button>
          <Button disabled={reason.trim().length < 10} onClick={onConfirm}>
            <ShieldCheck aria-hidden="true" className="size-4" />
            {fr.admin.openReadOnly}
          </Button>
        </div>
      </section>
    </div>
  )
}

export default function AdminClientDetail({
  tenant,
  suites,
  users,
  usage,
  versions,
  connectorTypes,
  connections,
  knowledge,
}: AdminClientDetailProps) {
  const [tab, setTab] = useState<ClientTab>(() => {
    const requested = new URLSearchParams(window.location.search).get("tab")
    return requested === "connectors" || requested === "knowledge"
      ? requested
      : "overview"
  })
  const [supportDialogOpen, setSupportDialogOpen] = useState(false)
  const tabs = [
    ["overview", fr.admin.clientOverview, Gauge],
    ["suites", fr.admin.suites, Blocks],
    ["users", fr.admin.users, Users],
    ["usage", fr.admin.consumption, Coins],
    ["connectors", fr.connectors.title, ServerCog],
    ["knowledge", fr.knowledge.title, Code2],
    ["configuration", fr.admin.configuration, ServerCog],
  ] as const

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="mt-1 size-9"
              onClick={() => window.location.assign("/admin/clients")}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <span className="flex size-12 items-center justify-center rounded-lg bg-brand-ink font-heading text-sm font-extrabold text-white">
              {tenant.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl font-extrabold text-ink">
                  {tenant.name}
                </h1>
                <span className="rounded-full bg-teal-soft px-2.5 py-1 text-xs font-bold text-teal-strong">
                  {fr.admin.active}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-graphite">
                {tenant.id} · {tenant.plan}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-waiting/40 text-waiting-strong hover:bg-waiting-soft"
            onClick={() => setSupportDialogOpen(true)}
          >
            <UserRoundCog aria-hidden="true" className="size-4" />
            {fr.admin.supportAccess}
          </Button>
        </header>

        <div className="mt-7 flex gap-1 border-b border-line">
          {tabs.map(([id, label, Icon]) => (
            <Button
              key={id}
              variant="ghost"
              className={cn(
                "relative h-11 rounded-none px-4 text-xs text-graphite",
                tab === id && "text-ink",
              )}
              onClick={() => setTab(id)}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
              {tab === id && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-teal" />
              )}
            </Button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "overview" && (
            <OverviewTab
              tenant={tenant}
              suites={suites}
              users={users}
              usage={usage}
            />
          )}
          {tab === "suites" && (
            <SuitesTab suites={suites} versions={versions} />
          )}
          {tab === "users" && <UsersTab users={users} />}
          {tab === "usage" && <UsageTab usage={usage} suites={suites} />}
          {tab === "connectors" && (
            <ConnectorsTab
              connectorTypes={connectorTypes}
              connections={connections}
              suites={suites}
              users={users}
            />
          )}
          {tab === "knowledge" && suites[0] && (
            <KnowledgeLibrary
              documents={knowledge}
              suite={suites[0]}
              adminMode
            />
          )}
          {tab === "configuration" && (
            <ConfigurationTab tenant={tenant} />
          )}
        </div>
      </div>

      {supportDialogOpen && (
        <SupportAccessDialog
          onClose={() => setSupportDialogOpen(false)}
          onConfirm={() => {
            setSupportDialogOpen(false)
            window.location.assign("/app?support=1")
          }}
        />
      )}
    </AdminShell>
  )
}
