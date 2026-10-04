import { useState } from "react"
import {
  Bell,
  BookOpenCheck,
  Check,
  ChevronDown,
  CircleAlert,
  CreditCard,
  Mail,
  Monitor,
  Plus,
  Send,
  Settings2,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react"

import ClientPageShell from "@/components/client-page-shell"
import ConnectedToolsPage from "@/components/connected-tools-page"
import { AgentAvatar, CreditsGauge, HumanAvatar } from "@/components/foundations"
import KnowledgeLibrary from "@/components/knowledge-library"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  agentLabel,
  type AgentNaming,
  type Conversation,
  type Connection,
  type ConnectorType,
  type HumanRequest,
  type KnowledgeDocument,
  type Suite,
  type Tenant,
  type UsageSummary,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { planDetails } from "@/lib/plans"
import { cn } from "@/lib/utils"

type SettingsTab =
  | "users"
  | "usage"
  | "tools"
  | "knowledge"
  | "notifications"
  | "display"

interface SettingsPageProps {
  tenant: Tenant
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  requests: HumanRequest[]
  usage: UsageSummary
  usageHistory: UsageSummary[]
  users: User[]
  currentUser: User
  connectorTypes: ConnectorType[]
  connections: Connection[]
  knowledge: KnowledgeDocument[]
}

function SettingsTabs({
  active,
  onChange,
}: {
  active: SettingsTab
  onChange: (tab: SettingsTab) => void
}) {
  const tabs = [
    { id: "users", label: fr.settingsPage.users, icon: Users },
    { id: "usage", label: fr.settingsPage.usage, icon: CreditCard },
    { id: "tools", label: fr.connectors.title, icon: Wrench },
    { id: "knowledge", label: fr.knowledge.title, icon: BookOpenCheck },
    {
      id: "notifications",
      label: fr.settingsPage.notifications,
      icon: Bell,
    },
    { id: "display", label: fr.settingsPage.display, icon: Monitor },
  ] as const

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant="ghost"
          className={cn(
            "relative h-12 shrink-0 rounded-none px-4 text-sm text-graphite",
            active === id && "text-ink",
          )}
          onClick={() => onChange(id)}
        >
          <Icon aria-hidden="true" className="size-4" />
          {label}
          {active === id && (
            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-teal" />
          )}
        </Button>
      ))}
    </div>
  )
}

function UsersSettings({
  tenant,
  users,
}: {
  tenant: Tenant
  users: User[]
}) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [disabledUsers, setDisabledUsers] = useState<string[]>([])
  const activeCount = users.filter(
    (user) => user.active && !disabledUsers.includes(user.id),
  ).length
  const ratio = activeCount / tenant.maxUsers
  const plan = planDetails[tenant.plan]

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink">
              {fr.settingsPage.users}
            </h2>
            <p className="mt-1 text-sm text-graphite">
              {activeCount} {fr.settingsPage.userLimit} {tenant.maxUsers}{" "}
              {fr.settingsPage.seats}
            </p>
            <p className="mt-1 text-xs font-semibold text-teal-strong">
              {tenant.plan === "business"
                ? fr.admin.business
                : fr.admin.smallTeam}{" "}
              · {plan.monthlyPriceEur} € / mois ·{" "}
              {new Intl.NumberFormat("fr-FR", {
                notation: "compact",
                maximumFractionDigits: 0,
              }).format(plan.creditsIncluded)}{" "}
              {fr.common.credits}
            </p>
          </div>
          <Button onClick={() => setInviteOpen((value) => !value)}>
            <UserPlus aria-hidden="true" className="size-4" />
            {fr.settingsPage.inviteUser}
          </Button>
        </div>
        <div className="mt-5 h-2 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full bg-teal",
              ratio <= 0.25
                ? "w-1/4"
                : ratio <= 0.5
                  ? "w-1/2"
                  : ratio <= 0.75
                    ? "w-3/4"
                    : "w-full",
            )}
          />
        </div>

        {inviteOpen && (
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-action/25 bg-action-soft p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-graphite">
                {fr.settingsPage.invitationEmail}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 bg-surface"
                placeholder="prenom@entreprise.be"
              />
            </div>
            <Button disabled={!email.includes("@")}>
              <Send aria-hidden="true" className="size-4" />
              {fr.settingsPage.sendInvitation}
            </Button>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        {users.map((user) => {
          const disabled = disabledUsers.includes(user.id) || !user.active
          return (
            <article
              key={user.id}
              className="flex flex-col gap-4 border-b border-line p-4 last:border-b-0 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <HumanAvatar
                  user={user}
                  status={disabled ? "paused" : "working"}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {user.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-graphite">
                    {user.email}
                  </p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-graphite-soft px-3 py-1 text-xs font-semibold text-graphite">
                {user.role === "owner"
                  ? fr.settingsPage.owner
                  : fr.settingsPage.member}
              </span>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                  disabled
                    ? "bg-graphite-soft text-graphite"
                    : "bg-teal-soft text-teal-strong",
                )}
              >
                {disabled
                  ? fr.settingsPage.disabled
                  : fr.settingsPage.active}
              </span>
              <Button
                variant="ghost"
                className={cn(
                  "sm:w-28",
                  disabled ? "text-action-strong" : "text-danger",
                )}
                disabled={user.role === "owner"}
                onClick={() =>
                  setDisabledUsers((current) =>
                    current.includes(user.id)
                      ? current.filter((id) => id !== user.id)
                      : [...current, user.id],
                  )
                }
              >
                {disabled ? fr.settingsPage.enable : fr.settingsPage.disable}
              </Button>
            </article>
          )
        })}
      </section>
    </div>
  )
}

function UsageBar({
  label,
  value,
  maximum,
}: {
  label: string
  value: number
  maximum: number
}) {
  const ratio = value / maximum
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-mono text-graphite">
          {new Intl.NumberFormat("fr-FR", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(value)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-action",
            ratio <= 0.25
              ? "w-1/4"
              : ratio <= 0.5
                ? "w-1/2"
                : ratio <= 0.75
                  ? "w-3/4"
                  : "w-full",
          )}
        />
      </div>
    </div>
  )
}

function UsageSettings({
  usage,
  usageHistory,
  suite,
}: {
  usage: UsageSummary
  usageHistory: UsageSummary[]
  suite: Suite
}) {
  const [threshold, setThreshold] = useState(80)
  const maxAgentCredits = Math.max(
    ...usage.byAgent.map((item) => item.credits),
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="mb-3 font-heading text-xl font-bold text-ink">
            {fr.settingsPage.monthlyCredits}
          </h2>
          <CreditsGauge usage={usage} />
        </div>
        <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
          <h2 className="font-heading text-lg font-bold text-ink">
            {fr.settingsPage.bySuite}
          </h2>
          <div className="mt-6 space-y-5">
            {usage.bySuite.map((item) => (
              <UsageBar
                key={item.suiteId}
                label={item.name}
                value={item.credits}
                maximum={usage.creditsIncluded}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.settingsPage.monthlyHistory}
        </h2>
        <div className="mt-6 flex h-52 items-end gap-4 border-b border-line px-2">
          {usageHistory.map((item) => {
            const ratio = item.creditsUsed / item.creditsIncluded
            const month = new Intl.DateTimeFormat("fr-FR", {
              month: "short",
            }).format(new Date(`${item.month}-01T00:00:00Z`))
            return (
              <div
                key={item.month}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 font-mono text-xs text-graphite">
                  {Math.round(ratio * 100)} %
                </span>
                <span
                  className={cn(
                    "w-full max-w-14 rounded-t-md bg-teal",
                    ratio <= 0.5
                      ? "h-2/5"
                      : ratio <= 0.65
                        ? "h-1/2"
                        : ratio <= 0.8
                          ? "h-2/3"
                          : "h-4/5",
                  )}
                />
                <span className="mt-2 pb-2 text-xs font-semibold capitalize text-graphite">
                  {month}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.settingsPage.byAgent}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {usage.byAgent.map((item) => {
            const agent = suite.agents.find(
              (candidate) => candidate.name === item.agent,
            )
            return (
              <div key={item.agent} className="flex items-center gap-3">
                {agent && <AgentAvatar agent={agent} size="sm" />}
                <div className="min-w-0 flex-1">
                  <UsageBar
                    label={agent?.firstName ?? item.agent}
                    value={item.credits}
                    maximum={maxAgentCredits}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">
              {fr.settingsPage.notificationThreshold}
            </h2>
            <p className="mt-1 text-sm text-graphite">
              {fr.settingsPage.thresholdDescription}
            </p>
          </div>
          <div className="flex gap-2">
            {[70, 80, 90].map((value) => (
              <Button
                key={value}
                variant={threshold === value ? "default" : "outline"}
                className="h-9"
                onClick={() => setThreshold(value)}
              >
                {value} %
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-5 border-t border-line pt-5">
          <Button variant="outline">
            <Plus aria-hidden="true" className="size-4" />
            {fr.settingsPage.requestCredits}
          </Button>
        </div>
      </section>
    </div>
  )
}

function ToggleCell({
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
      variant="ghost"
      size="icon"
      className={cn(
        "size-8 rounded-full border",
        active
          ? "border-teal bg-teal-soft text-teal-strong"
          : "border-line text-graphite",
      )}
      onClick={onClick}
      aria-label={label}
    >
      {active && <Check aria-hidden="true" className="size-4" />}
    </Button>
  )
}

function NotificationsSettings({ users }: { users: User[] }) {
  const eventTypes = [
    fr.settingsPage.requestReceived,
    fr.settingsPage.deliverableReady,
    fr.settingsPage.agentError,
    fr.settingsPage.creditThreshold,
  ]
  const [channels, setChannels] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      eventTypes.map((event, index) => [
        event,
        index === 0 ? ["app", "email"] : ["app"],
      ]),
    ),
  )
  const [recipient, setRecipient] = useState(users[0]?.id)

  function toggleChannel(event: string, channel: string) {
    setChannels((current) => ({
      ...current,
      [event]: current[event]?.includes(channel)
        ? current[event].filter((item) => item !== channel)
        : [...(current[event] ?? []), channel],
    }))
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <div className="grid grid-cols-[1fr_5rem_5rem] border-b border-line bg-paper px-5 py-3 text-xs font-bold uppercase tracking-wider text-graphite">
          <span>{fr.settingsPage.eventType}</span>
          <span className="text-center">{fr.settingsPage.application}</span>
          <span className="text-center">{fr.settingsPage.email}</span>
        </div>
        {eventTypes.map((event) => (
          <div
            key={event}
            className="grid grid-cols-[1fr_5rem_5rem] items-center border-b border-line px-5 py-4 last:border-b-0"
          >
            <span className="text-sm font-medium text-ink">{event}</span>
            <span className="flex justify-center">
              <ToggleCell
                active={channels[event]?.includes("app")}
                label={`${fr.settingsPage.application} · ${event}`}
                onClick={() => toggleChannel(event, "app")}
              />
            </span>
            <span className="flex justify-center">
              <ToggleCell
                active={channels[event]?.includes("email")}
                label={`${fr.settingsPage.email} · ${event}`}
                onClick={() => toggleChannel(event, "email")}
              />
            </span>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.settingsPage.defaultRecipient}
        </h2>
        <p className="mt-1 text-sm text-graphite">
          {fr.settingsPage.defaultRecipientDescription}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {users
            .filter((user) => user.active)
            .map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className={cn(
                  "h-auto justify-start p-3",
                  recipient === user.id &&
                    "border-action bg-action-soft ring-1 ring-action",
                )}
                onClick={() => setRecipient(user.id)}
              >
                <HumanAvatar user={user} status="working" size="sm" />
                <span className="text-left">
                  <span className="block text-sm font-semibold text-ink">
                    {user.name}
                  </span>
                  <span className="block text-xs font-normal text-graphite">
                    {user.email}
                  </span>
                </span>
              </Button>
            ))}
        </div>
      </section>
    </div>
  )
}

function DisplaySettings({ suite }: { suite: Suite }) {
  const [naming, setNaming] = useState<AgentNaming>(suite.agentNaming)
  const sampleAgent = suite.agents[0]

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
      <h2 className="font-heading text-xl font-bold text-ink">
        {fr.settingsPage.agentNaming}
      </h2>
      <p className="mt-1 text-sm text-graphite">
        {fr.settingsPage.agentNamingDescription}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          ["first_name_and_role", fr.settingsPage.firstNameAndRole],
          ["role_only", fr.settingsPage.roleOnly],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant="outline"
            className={cn(
              "h-auto justify-start p-4",
              naming === value &&
                "border-action bg-action-soft ring-1 ring-action",
            )}
            onClick={() => setNaming(value as AgentNaming)}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                naming === value
                  ? "border-action bg-action text-white"
                  : "border-line",
              )}
            >
              {naming === value && (
                <Check aria-hidden="true" className="size-3" />
              )}
            </span>
            {label}
          </Button>
        ))}
      </div>
      {sampleAgent && (
        <div className="mt-6 rounded-lg border border-line bg-paper p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-graphite">
            {fr.settingsPage.example}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <AgentAvatar agent={sampleAgent} />
            <div>
              <p className="text-sm font-bold text-ink">
                {agentLabel(sampleAgent, naming)}
              </p>
              <p className="mt-0.5 text-xs text-graphite">{fr.common.agent}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function SettingsPage({
  tenant,
  suites,
  activeSuite,
  conversations,
  requests,
  usage,
  usageHistory,
  users,
  currentUser,
  connectorTypes,
  connections,
  knowledge,
}: SettingsPageProps) {
  const [tab, setTab] = useState<SettingsTab>(() => {
    if (window.location.pathname.endsWith("/outils")) return "tools"
    if (window.location.pathname.endsWith("/connaissances")) {
      return "knowledge"
    }
    return "users"
  })

  return (
    <ClientPageShell
      suites={suites}
      activeSuite={activeSuite}
      conversations={conversations}
      requests={requests}
      currentUser={currentUser}
    >
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.client.settings}
          </p>
          <div
            role="heading"
            aria-level={1}
            className="mt-1 font-heading text-3xl font-extrabold text-ink"
          >
            {fr.settingsPage.title}
          </div>
          <p className="mt-2 text-sm text-graphite">
            {fr.settingsPage.description}
          </p>
        </header>
        <div className="mt-7">
          <SettingsTabs active={tab} onChange={setTab} />
        </div>
        <div className="mt-6">
          {tab === "users" && <UsersSettings tenant={tenant} users={users} />}
          {tab === "usage" && (
            <UsageSettings
              usage={usage}
              usageHistory={usageHistory}
              suite={activeSuite}
            />
          )}
          {tab === "tools" && (
            <ConnectedToolsPage
              connectorTypes={connectorTypes}
              connections={connections}
              suites={suites}
              activeSuite={activeSuite}
              conversations={conversations}
              requests={requests}
              users={users}
              currentUser={currentUser}
              embedded
            />
          )}
          {tab === "knowledge" && (
            <KnowledgeLibrary documents={knowledge} suite={activeSuite} />
          )}
          {tab === "notifications" && (
            <NotificationsSettings users={users} />
          )}
          {tab === "display" && <DisplaySettings suite={activeSuite} />}
        </div>
      </main>
    </ClientPageShell>
  )
}
