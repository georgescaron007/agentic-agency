import { useMemo, useState } from "react"
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowLeftRight,
  Beaker,
  Check,
  ChevronRight,
  CircleDot,
  AlertTriangle,
  Columns3,
  GitCompareArrows,
  History,
  LayoutTemplate,
  ListChecks,
  Moon,
  Plus,
  Send,
  Settings2,
  Sun,
  Users,
  WalletCards,
  X,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { InheritedField } from "@/components/admin/harness-components"
import { AgentAvatar, RiskBadge } from "@/components/foundations"
import { ConnectorLogo } from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  agentLabel,
  type Agent,
  type AgentNaming,
  type HarnessView,
  type Connection,
  type ConnectorType,
  type Suite,
  type SuiteVersion,
  type Tenant,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import {
  autonomyLabel,
  departmentLabel,
} from "@/lib/admin-labels"
import { planDetails } from "@/lib/plans"
import { cn } from "@/lib/utils"

type SuiteEditorTab =
  | "organization"
  | "agents"
  | "approvals"
  | "interface"
  | "budget"
  | "history"

interface AdminSuiteEditorProps {
  tenant: Tenant
  suite: Suite
  versions: SuiteVersion[]
  harness: HarnessView
  catalogueAgents: Agent[]
  connectorTypes: ConnectorType[]
  connections: Connection[]
}

function AgentNode({
  agent,
  suite,
  entryPoint,
  supervisor,
  connectorTypes,
}: {
  agent: Agent
  suite: Suite
  entryPoint: boolean
  supervisor: boolean
  connectorTypes: ConnectorType[]
}) {
  const connectors = Array.from(
    new Set(
      agent.tools
        .map((tool) => tool.connectorKey)
        .filter((key): key is string => Boolean(key)),
    ),
  )
    .map((key) => connectorTypes.find((connector) => connector.key === key))
    .filter((connector) => connector !== undefined)
  return (
    <article className="relative w-56 rounded-lg border border-line bg-surface p-4 shadow-card">
      {entryPoint && (
        <span className="absolute -top-3 left-3 rounded-full bg-teal px-2.5 py-1 text-xs font-bold text-white">
          {fr.suiteEditor.entryPoint}
        </span>
      )}
      <div className="flex items-start gap-3">
        <AgentAvatar agent={agent} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">
            {agentLabel(agent, suite.agentNaming)}
          </p>
          <p className="mt-1 truncate text-xs text-graphite">{agent.role}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs font-semibold text-ink">
          {autonomyLabel(agent.autonomyLevel)}
        </span>
        <span className="flex -space-x-1">
          {connectors.map((connector) => (
            <ConnectorLogo key={connector.key} connector={connector} size="sm" />
          ))}
        </span>
        {supervisor && (
          <span className="rounded-full bg-action-soft px-2 py-1 text-xs font-semibold text-action-strong">
            {fr.suiteEditor.supervisor}
          </span>
        )}
      </div>
    </article>
  )
}

function OrganizationTab({
  suite,
  catalogueAgents,
  connectorTypes,
  connections,
}: {
  suite: Suite
  catalogueAgents: Agent[]
  connectorTypes: ConnectorType[]
  connections: Connection[]
}) {
  const [agents, setAgents] = useState(suite.agents)
  const [routes, setRoutes] = useState(() =>
    suite.agents
      .filter((agent) => agent.name !== suite.entryPoint)
      .map((agent) => `${suite.entryPoint}>${agent.name}`),
  )
  const [dragging, setDragging] = useState(false)
  const [roleNames, setRoleNames] = useState<Record<string, string>>({})
  const coordinator =
    agents.find((agent) => agent.name === suite.entryPoint) ?? agents[0]
  const specialists = agents.filter(
    (agent) => agent.name !== coordinator?.name,
  )
  const availableAgents = catalogueAgents.filter(
    (candidate) => !agents.some((agent) => agent.name === candidate.name),
  )
  const requiredConnectorKeys = Array.from(
    new Set(
      suite.agents.flatMap((agent) =>
        agent.tools
          .map((tool) => tool.connectorKey)
          .filter((key): key is string => Boolean(key)),
      ),
    ),
  )
  const missingConnectors = requiredConnectorKeys.filter(
    (key) => {
      const connector = connectorTypes.find((item) => item.key === key)
      const connectorConnections = connections.filter(
        (connection) => connection.connectorKey === key,
      )
      if (connector?.defaultScope === "per_user") {
        return connectorConnections.some(
          (connection) => connection.status !== "connected",
        )
      }
      return !connectorConnections.some(
        (connection) => connection.status === "connected",
      )
    },
  )

  function addAgent(agent: Agent, firstName: string) {
    if (agents.some((item) => item.name === agent.name)) return
    setAgents((current) => [...current, { ...agent, firstName }])
    setRoutes((current) => [
      ...current,
      `${suite.entryPoint}>${agent.name}`,
    ])
  }

  return (
    <div className="grid grid-cols-[1fr_18rem] gap-5">
      <section
        className={cn(
          "min-h-[36rem] rounded-lg border border-line bg-paper p-6 transition",
          dragging && "border-action bg-action-soft ring-2 ring-action/20",
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          const name = event.dataTransfer.getData("agent")
          const agent = catalogueAgents.find((item) => item.name === name)
          const firstName = roleNames[name]?.trim()
          if (agent && firstName) addAgent(agent, firstName)
          setDragging(false)
        }}
      >
        {missingConnectors.length > 0 && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-waiting/30 bg-waiting-soft p-4">
            <AlertTriangle
              aria-hidden="true"
              className="size-5 shrink-0 text-waiting-strong"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">
                {fr.connectors.missingConnectors}
              </p>
              <p className="mt-1 text-xs text-graphite">
                {missingConnectors
                  .map(
                    (key) =>
                      connectorTypes.find(
                        (connector) => connector.key === key,
                      )?.name ?? key,
                  )
                  .join(", ")}{" "}
                · {fr.connectors.publishWarning}
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() =>
                window.location.assign(
                  `/admin/clients/${suite.tenantId}?tab=connectors`,
                )
              }
            >
              {fr.connectors.viewConnectors}
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">
              {fr.suiteEditor.organization}
            </h2>
            <p className="mt-1 text-xs text-graphite">
              {fr.suiteEditor.clickToDeleteRoute}
            </p>
          </div>
          <span className="rounded-full bg-surface px-3 py-1.5 font-mono text-xs text-graphite">
            {agents.length} {fr.suiteEditor.agents.toLowerCase()} ·{" "}
            {routes.length} routes
          </span>
        </div>

        {dragging && (
          <div className="mt-5 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-action text-sm font-bold text-action-strong">
            {fr.suiteEditor.dropHere}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center">
          {coordinator && (
            <AgentNode
              agent={coordinator}
              suite={suite}
              entryPoint
              supervisor
              connectorTypes={connectorTypes}
            />
          )}
          <div className="mt-2 flex min-h-16 items-center justify-center gap-6">
            {specialists.map((agent) => {
              const route = `${suite.entryPoint}>${agent.name}`
              const active = routes.includes(route)
              return (
                <Button
                  key={route}
                  variant="ghost"
                  className={cn(
                    "h-14 w-14 rounded-full text-teal-strong",
                    !active && "text-graphite/25",
                  )}
                  onClick={() =>
                    setRoutes((current) =>
                      current.includes(route)
                        ? current.filter((item) => item !== route)
                        : [...current, route],
                    )
                  }
                  aria-label={`${fr.suiteEditor.authorizedRoutes} ${coordinator?.firstName} dans les deux sens avec ${agent.firstName}`}
                >
                  <ArrowDownUp aria-hidden="true" className="size-6" />
                </Button>
              )
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {specialists.map((agent) => (
              <AgentNode
                key={agent.name}
                agent={agent}
                suite={suite}
                entryPoint={false}
                supervisor={false}
                connectorTypes={connectorTypes}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-graphite">
            {fr.suiteEditor.authorizedRoutes}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {routes.map((route) => {
              const [from, to] = route.split(">")
              return (
                <Button
                  key={route}
                  variant="outline"
                  className="h-8 gap-1.5 font-mono text-xs"
                  onClick={() =>
                    setRoutes((current) =>
                      current.filter((item) => item !== route),
                    )
                  }
                >
                  {from}
                  <ArrowLeftRight aria-hidden="true" className="size-3" />
                  {to}
                  <X aria-hidden="true" className="ml-1 size-3" />
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-line bg-surface shadow-card">
        <div className="border-b border-line p-4">
          <h2 className="font-heading text-base font-bold text-ink">
            {fr.suiteEditor.agentCatalog}
          </h2>
          <p className="mt-1 text-xs leading-5 text-graphite">
            {fr.suiteEditor.chooseRoleName}
          </p>
        </div>
        <div className="space-y-4 p-3">
          {Array.from(
            new Set(availableAgents.map((agent) => agent.department)),
          ).map((department) => (
            <section key={department}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-graphite">
                {departmentLabel(department)}
              </p>
              <div className="space-y-2">
              {availableAgents
                .filter((agent) => agent.department === department)
                .map((agent) => (
            <article
              key={agent.name}
              className="rounded-lg border border-line bg-paper p-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-md bg-action-soft text-action-strong">
                  <Users aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">
                    {agent.role}
                  </p>
                  <code className="mt-0.5 block text-xs text-graphite">
                    {agent.name}
                  </code>
                </div>
              </div>
              <Input
                value={roleNames[agent.name] ?? ""}
                onChange={(event) =>
                  setRoleNames((current) => ({
                    ...current,
                    [agent.name]: event.target.value,
                  }))
                }
                placeholder={fr.suiteWizard.firstNamePlaceholder}
                className="mt-3 h-8 text-xs"
              />
              <Button
                variant="ghost"
                className="mt-2 h-7 w-full text-xs text-action-strong"
                disabled={!roleNames[agent.name]?.trim()}
                onClick={() =>
                  addAgent(agent, roleNames[agent.name].trim())
                }
              >
                <Plus aria-hidden="true" className="size-3.5" />
                {fr.suiteEditor.addAgent}
              </Button>
            </article>
          ))}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </div>
  )
}

function AgentsTab({ suite }: { suite: Suite }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="grid grid-cols-[1fr_0.8fr_0.7fr_0.6fr_auto] border-b border-line bg-paper px-5 py-3 text-xs font-bold uppercase tracking-wide text-graphite">
        <span>{fr.suiteEditor.agents}</span>
        <span>{fr.agentEditor.department}</span>
        <span>{fr.agentProfile.behavior}</span>
        <span>{fr.admin.credits}</span>
        <span />
      </div>
      {suite.agents.map((agent) => (
        <Button
          key={agent.name}
          variant="ghost"
          className="grid h-auto w-full grid-cols-[1fr_0.8fr_0.7fr_0.6fr_auto] items-center rounded-none border-b border-line px-5 py-3 text-left last:border-b-0 hover:bg-paper"
          onClick={() =>
            window.location.assign(
              `/admin/clients/${suite.tenantId}/suites/${suite.id}/agents/${encodeURIComponent(agent.name)}`,
            )
          }
        >
          <span className="flex items-center gap-3">
            <AgentAvatar agent={agent} size="sm" />
            <span>
              <span className="block text-sm font-bold text-ink">
                {agentLabel(agent, suite.agentNaming)}
              </span>
              <span className="mt-0.5 block font-mono text-xs font-normal text-graphite">
                {agent.name}
              </span>
            </span>
          </span>
          <span className="text-xs font-medium text-ink">
            {departmentLabel(agent.department)}
          </span>
          <span className="text-xs text-graphite">
            {autonomyLabel(agent.autonomyLevel)}
          </span>
          <span className="font-mono text-xs text-ink">
            {new Intl.NumberFormat("fr-FR", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(agent.creditsThisMonth)}
          </span>
          <ChevronRight aria-hidden="true" className="size-4 text-graphite" />
        </Button>
      ))}
    </section>
  )
}

function ApprovalsTab({ suite }: { suite: Suite }) {
  const [rules, setRules] = useState(() => [
    {
      from: suite.entryPoint,
      to: "@human",
      intent: "tool_approval",
      reason: "Action irréversible ou envoi externe",
    },
    {
      from: "@hugo",
      to: suite.entryPoint,
      intent: "message_approval",
      reason: "Premier contact avec un prospect",
    },
  ])

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.suiteEditor.approvals}
        </h2>
        <Button
          variant="outline"
          className="h-8 text-xs"
          onClick={() =>
            setRules((current) => [
              ...current,
              {
                from: suite.entryPoint,
                to: "@human",
                intent: "tool_approval",
                reason: "",
              },
            ])
          }
        >
          <Plus aria-hidden="true" className="size-3.5" />
          {fr.suiteEditor.addRule}
        </Button>
      </div>
      <div className="grid grid-cols-[0.7fr_0.7fr_1fr_1.5fr_auto] border-b border-line bg-paper px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-graphite">
        <span>{fr.suiteEditor.from}</span>
        <span>{fr.suiteEditor.to}</span>
        <span>{fr.suiteEditor.intent}</span>
        <span>{fr.suiteEditor.reason}</span>
        <span />
      </div>
      {rules.map((rule, index) => (
        <div
          key={`${rule.from}-${index}`}
          className="grid grid-cols-[0.7fr_0.7fr_1fr_1.5fr_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
        >
          {(["from", "to", "intent", "reason"] as const).map((field) => (
            <Input
              key={field}
              value={rule[field]}
              className="h-8 font-mono text-xs"
              onChange={(event) =>
                setRules((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, [field]: event.target.value }
                      : item,
                  ),
                )
              }
            />
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-danger"
            onClick={() =>
              setRules((current) =>
                current.filter((_, itemIndex) => itemIndex !== index),
              )
            }
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ))}
    </section>
  )
}

function ClientInterfaceTab({ suite }: { suite: Suite }) {
  const [displayedName, setDisplayedName] = useState(suite.name)
  const [accent, setAccent] = useState("teal")
  const [poweredBy, setPoweredBy] = useState(suite.branding.showPoweredBy)
  const [naming, setNaming] = useState<AgentNaming>(suite.agentNaming)
  const [views, setViews] = useState(suite.enabledViews)
  const [welcome, setWelcome] = useState(suite.welcomeMessage ?? "")
  const [prompts, setPrompts] = useState(suite.suggestedPrompts)
  const accentStyles: Record<string, string> = {
    teal: "bg-teal",
    action: "bg-action",
    ink: "bg-brand-ink",
    graphite: "bg-graphite",
  }
  const viewLabels = {
    conversations: fr.suiteEditor.conversations,
    tasks: fr.suiteEditor.tasks,
    documents: fr.suiteEditor.documents,
    activity: fr.suiteEditor.activity,
  }

  return (
    <div className="grid grid-cols-[1fr_26rem] gap-5">
      <section className="space-y-5 rounded-lg border border-line bg-surface p-5 shadow-card">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            {fr.suiteEditor.clientBranding}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 justify-start"
            >
              <Sun aria-hidden="true" className="size-5" />
              {fr.suiteEditor.lightLogo}
            </Button>
            <Button
              variant="outline"
              className="h-20 justify-start bg-brand-ink text-white hover:bg-brand-ink hover:text-white"
            >
              <Moon aria-hidden="true" className="size-5" />
              {fr.suiteEditor.darkLogo}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-graphite">
              {fr.suiteEditor.displayedName}
            </label>
            <Input
              value={displayedName}
              onChange={(event) => setDisplayedName(event.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-graphite">
              {fr.suiteEditor.accentColor}
            </label>
            <div className="mt-2 flex h-10 items-center gap-2">
              {Object.entries(accentStyles).map(([key, style]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 rounded-full p-1",
                    accent === key && "ring-2 ring-action ring-offset-2",
                  )}
                  onClick={() => setAccent(key)}
                >
                  <span className={cn("size-full rounded-full", style)} />
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line p-4">
          <span className="text-sm font-semibold text-ink">
            {fr.suiteEditor.poweredBy}
          </span>
          <Button
            variant="ghost"
            className={cn(
              "h-6 w-11 rounded-full p-0.5",
              poweredBy ? "justify-end bg-teal" : "justify-start bg-graphite-soft",
            )}
            onClick={() => setPoweredBy((value) => !value)}
          >
            <span className="size-5 rounded-full bg-white shadow-sm" />
          </Button>
        </div>

        <div>
          <p className="text-xs font-bold text-graphite">
            {fr.suiteEditor.agentNaming}
          </p>
          <div className="mt-2 flex gap-2">
            {[
              ["first_name_and_role", fr.suiteEditor.firstNameRole],
              ["role_only", fr.suiteEditor.roleOnly],
            ].map(([value, label]) => (
              <Button
                key={value}
                variant={naming === value ? "default" : "outline"}
                className="h-9"
                onClick={() => setNaming(value as AgentNaming)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {suite.agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-2 rounded-md border border-line bg-paper p-2"
              >
                <AgentAvatar agent={agent} size="sm" />
                <Input
                  defaultValue={agent.firstName}
                  className="h-8 w-24 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-graphite">
            {fr.suiteEditor.enabledViews}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suite.enabledViews.map((view) => (
              <Button
                key={view}
                variant={views.includes(view) ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() =>
                  setViews((current) =>
                    current.includes(view)
                      ? current.filter((item) => item !== view)
                      : [...current, view],
                  )
                }
              >
                {views.includes(view) && (
                  <Check aria-hidden="true" className="size-3.5" />
                )}
                {viewLabels[view]}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-graphite">
            {fr.suiteEditor.welcomeMessage}
          </label>
          <Textarea
            value={welcome}
            onChange={(event) => setWelcome(event.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <p className="text-xs font-bold text-graphite">
            {fr.suiteEditor.suggestedPrompts}
          </p>
          <div className="mt-2 space-y-2">
            {prompts.map((prompt, index) => (
              <Input
                key={index}
                value={prompt}
                onChange={(event) =>
                  setPrompts((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
              />
            ))}
          </div>
        </div>
      </section>

      <aside className="sticky top-24 h-fit overflow-hidden rounded-lg border border-line bg-paper shadow-card">
        <div className="border-b border-line bg-surface px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-graphite">
            {fr.suiteEditor.livePreview}
          </p>
        </div>
        <div className="grid min-h-[34rem] grid-cols-[7rem_1fr]">
          <div className="flex flex-col bg-brand-ink p-3 text-white">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-md text-xs font-bold text-white",
                  accentStyles[accent],
                )}
              >
                DA
              </span>
              <span className="truncate text-xs font-bold">
                {suite.branding.clientName}
              </span>
            </div>
            <div className="mt-7 space-y-2 text-xs text-white/55">
              {views.map((view) => (
                <p key={view}>{viewLabels[view]}</p>
              ))}
            </div>
            {poweredBy && (
              <p className="mt-auto text-xs text-white/30">
                {fr.client.poweredBy}
              </p>
            )}
          </div>
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-strong">
              {displayedName}
            </p>
            <h3 className="mt-3 font-heading text-xl font-bold text-ink">
              Bonjour Marc
            </h3>
            <p className="mt-3 text-xs leading-5 text-graphite">{welcome}</p>
            <div className="mt-5 flex -space-x-2">
              {suite.agents.map((agent) => (
                <span
                  key={agent.name}
                  title={agentLabel(agent, naming)}
                  className="rounded-lg ring-2 ring-paper"
                >
                  <AgentAvatar agent={agent} size="sm" />
                </span>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              {prompts.slice(0, 3).map((prompt) => (
                <p
                  key={prompt}
                  className="rounded-md border border-line bg-surface p-2 text-xs leading-4 text-ink"
                >
                  {prompt}
                </p>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function BudgetTab({
  suite,
  harness,
  tenant,
}: {
  suite: Suite
  harness: HarnessView
  tenant: Tenant
}) {
  const plan = planDetails[tenant.plan]
  return (
    <div className="grid grid-cols-[1fr_0.7fr] gap-5">
      <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
        <h2 className="font-heading text-lg font-bold text-ink">
          {fr.suiteEditor.executionBudget}
        </h2>
        <div className="mt-5">
          <InheritedField
            label={fr.suiteEditor.maxTokensPerTask}
            field={harness.budget.maxTokensPerTask}
          />
        </div>
      </section>
      <section className="rounded-lg bg-brand-ink p-5 text-white shadow-card">
        <p className="text-xs font-bold uppercase tracking-wide text-white/45">
          {fr.suiteEditor.planReminder}
        </p>
        <p className="mt-4 font-heading text-2xl font-extrabold">
          {tenant.plan === "business" ? fr.admin.business : fr.admin.smallTeam}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {plan.monthlyPriceEur} € / mois ·{" "}
          {new Intl.NumberFormat("fr-FR", {
            notation: "compact",
            maximumFractionDigits: 0,
          }).format(plan.creditsIncluded)}{" "}
          {fr.common.credits}
        </p>
        <p className="mt-5 font-mono text-xs text-teal">{suite.id}</p>
      </section>
    </div>
  )
}

function HistoryTab({ versions }: { versions: SuiteVersion[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      {versions
        .sort((a, b) => b.version - a.version)
        .map((version) => (
          <article
            key={version.version}
            className="grid grid-cols-[0.5fr_0.8fr_1fr_1.6fr_auto] items-center gap-5 border-b border-line px-5 py-4 last:border-b-0"
          >
            <div>
              <p className="font-heading text-lg font-bold text-ink">
                v{version.version}
              </p>
              <span
                className={cn(
                  "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold",
                  version.status === "published"
                    ? "bg-teal-soft text-teal-strong"
                    : "bg-action-soft text-action-strong",
                )}
              >
                {version.status === "published"
                  ? fr.suiteEditor.published
                  : fr.suiteEditor.draft}
              </span>
            </div>
            <div>
              <p className="text-xs text-graphite">
                {fr.suiteEditor.createdBy}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {version.author}
              </p>
            </div>
            <div>
              <p className="text-xs text-graphite">
                {fr.admin.updatedAt}
              </p>
              <p className="mt-1 text-sm text-ink">
                {new Intl.DateTimeFormat("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(version.createdAt))}
              </p>
            </div>
            <div>
              <p className="text-xs text-graphite">
                {fr.suiteEditor.releaseNotes}
              </p>
              <p className="mt-1 text-sm text-ink">
                {version.notes ?? fr.suiteEditor.noNotes}
              </p>
            </div>
            <Button variant="outline" className="h-8 text-xs">
              <History aria-hidden="true" className="size-3.5" />
              {fr.suiteEditor.restore}
            </Button>
          </article>
        ))}
    </section>
  )
}

export default function AdminSuiteEditor({
  tenant,
  suite,
  versions,
  harness,
  catalogueAgents,
  connectorTypes,
  connections,
}: AdminSuiteEditorProps) {
  const [tab, setTab] = useState<SuiteEditorTab>("organization")
  const latestVersion = useMemo(
    () => [...versions].sort((a, b) => b.version - a.version)[0],
    [versions],
  )
  const tabs = [
    ["organization", fr.suiteEditor.organization, Columns3],
    ["agents", fr.suiteEditor.agents, Users],
    ["approvals", fr.suiteEditor.approvals, ListChecks],
    ["interface", fr.suiteEditor.clientInterface, LayoutTemplate],
    ["budget", fr.suiteEditor.budget, WalletCards],
    ["history", fr.suiteEditor.history, History],
  ] as const

  return (
    <AdminShell>
      <div className="border-b border-line bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() =>
                window.location.assign(`/admin/clients/${tenant.id}`)
              }
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <div>
              <p className="text-xs text-graphite">
                {tenant.name} <ChevronRight className="inline size-3" />{" "}
                {fr.suiteEditor.suiteEditor}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <h1 className="font-heading text-xl font-extrabold text-ink">
                  {suite.name}
                </h1>
                <span className="font-mono text-xs text-graphite">
                  {fr.suiteEditor.version} {latestVersion?.version ?? 1}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold",
                    latestVersion?.status === "published"
                      ? "bg-teal-soft text-teal-strong"
                      : "bg-action-soft text-action-strong",
                  )}
                >
                  {latestVersion?.status === "published"
                    ? fr.suiteEditor.published
                    : fr.suiteEditor.draft}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                window.location.assign(
                  `/admin/clients/${tenant.id}/suites/${suite.id}/tester`,
                )
              }
            >
              <Beaker aria-hidden="true" className="size-4" />
              {fr.suiteEditor.test}
            </Button>
            <Button variant="outline">
              <GitCompareArrows aria-hidden="true" className="size-4" />
              {fr.suiteEditor.compare}
            </Button>
            <Button
              onClick={() =>
                window.location.assign(
                  `/admin/clients/${tenant.id}/suites/${suite.id}/publier`,
                )
              }
            >
              <Send aria-hidden="true" className="size-4" />
              {fr.suiteEditor.publish}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex gap-1 border-b border-line">
          {tabs.map(([id, label, Icon]) => (
            <Button
              key={id}
              variant="ghost"
              className={cn(
                "relative h-12 rounded-none px-4 text-xs text-graphite",
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

        <div className="py-6">
          {tab === "organization" && (
            <OrganizationTab
              suite={suite}
              catalogueAgents={catalogueAgents}
              connectorTypes={connectorTypes}
              connections={connections}
            />
          )}
          {tab === "agents" && <AgentsTab suite={suite} />}
          {tab === "approvals" && <ApprovalsTab suite={suite} />}
          {tab === "interface" && <ClientInterfaceTab suite={suite} />}
          {tab === "budget" && (
            <BudgetTab suite={suite} harness={harness} tenant={tenant} />
          )}
          {tab === "history" && <HistoryTab versions={[...versions]} />}
        </div>
      </div>
    </AdminShell>
  )
}
