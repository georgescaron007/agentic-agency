import { useMemo, useState, type ReactNode } from "react"
import {
  ArrowLeft,
  Bot,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Code2,
  Fingerprint,
  Lock,
  Mail,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
  Users,
  Wrench,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import {
  AutonomyMatrix,
  InheritedField,
} from "@/components/admin/harness-components"
import {
  AgentAvatar,
  HumanAvatar,
  RiskBadge,
} from "@/components/foundations"
import {
  ConnectionStatusBadge,
  ConnectorLogo,
} from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  type Agent,
  type AgentConnectorAccess,
  type Connection,
  type ConnectorType,
  type HarnessView,
  type KnowledgeDocument,
  type Suite,
  type Tenant,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import {
  adminValueLabel,
  departmentLabel,
  durationLabel,
  knowledgeCategoryLabel,
  knowledgeStatusLabel,
  profileLabel,
  timeoutActionLabel,
  toolPolicyLabel,
} from "@/lib/admin-labels"
import { cn } from "@/lib/utils"

interface AdminAgentEditorProps {
  tenant: Tenant
  suite: Suite
  agent: Agent
  harness: HarnessView
  connectorTypes: ConnectorType[]
  connections: Connection[]
  connectorAccess: AgentConnectorAccess[]
  knowledge: KnowledgeDocument[]
}

interface HarnessBlockProps {
  title: string
  icon: typeof Settings2
  children: ReactNode
}

function HarnessBlock({
  title,
  icon: Icon,
  children,
}: HarnessBlockProps) {
  const [open, setOpen] = useState(true)
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <Button
        variant="ghost"
        className="h-11 w-full justify-start rounded-none border-b border-line px-4"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon aria-hidden="true" className="size-4 text-teal-strong" />
        <span className="flex-1 text-left text-sm font-bold text-ink">
          {title}
        </span>
        {open ? (
          <ChevronDown aria-hidden="true" className="size-4" />
        ) : (
          <ChevronRight aria-hidden="true" className="size-4" />
        )}
      </Button>
      {open && <div className="grid gap-3 p-4">{children}</div>}
    </section>
  )
}

function HighlightedPrompt({ prompt }: { prompt: string }) {
  const parts = prompt.split(/(\{\{[^}]+\}\})/g)
  return (
    <pre className="whitespace-pre-wrap rounded-md bg-brand-ink p-4 font-mono text-xs leading-6 text-white/75">
      {parts.map((part, index) =>
        part.startsWith("{{") ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-teal/20 px-1 text-teal"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </pre>
  )
}

function BooleanSwitch({
  initialValue,
}: {
  initialValue: boolean
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-7 w-12 rounded-full p-1",
        value
          ? "justify-end bg-teal hover:bg-teal"
          : "justify-start bg-graphite-soft",
      )}
      onClick={() => setValue((current) => !current)}
      role="switch"
      aria-checked={value}
    >
      <span className="size-5 rounded-full bg-white shadow-sm" />
    </Button>
  )
}

function ChannelSelector({
  initialValue,
}: {
  initialValue: Array<"in_app" | "email">
}) {
  const [channels, setChannels] = useState(initialValue)
  const options = [
    ["in_app", fr.agentEditor.application],
    ["email", fr.agentEditor.email],
  ] as const

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([value, label]) => {
        const selected = channels.includes(value)
        return (
          <Button
            key={value}
            variant="outline"
            className={cn(
              "h-9",
              selected && "border-action bg-action-soft",
            )}
            onClick={() =>
              setChannels((current) =>
                selected
                  ? current.filter((channel) => channel !== value)
                  : [...current, value],
              )
            }
            aria-pressed={selected}
          >
            {selected ? (
              <CheckSquare
                aria-hidden="true"
                className="size-4 text-action-strong"
              />
            ) : (
              <Square aria-hidden="true" className="size-4 text-graphite" />
            )}
            {label}
          </Button>
        )
      })}
    </div>
  )
}

function DurationSelector({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue)
  const durations = ["PT4H", "P2D"] as const

  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label={fr.agentEditor.selectDuration}
    >
      {durations.map((duration) => (
        <Button
          key={duration}
          variant={value === duration ? "default" : "outline"}
          className="h-9"
          onClick={() => setValue(duration)}
        >
          {durationLabel(duration)}
        </Button>
      ))}
    </div>
  )
}

function TimeoutBehaviorSelector({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue)
  const options = [
    "escalate",
    "proceed_with_recommendation",
    "abandon_task",
  ] as const

  return (
    <div
      className="grid gap-2"
      aria-label={fr.agentEditor.selectTimeoutBehavior}
    >
      {options.map((option) => (
        <Button
          key={option}
          variant={value === option ? "default" : "outline"}
          className="h-9 justify-start"
          onClick={() => setValue(option)}
        >
          {timeoutActionLabel(option)}
        </Button>
      ))}
    </div>
  )
}

function PersonSelector({
  users,
  initialUserId,
}: {
  users: User[]
  initialUserId: string
}) {
  const [selectedId, setSelectedId] = useState(initialUserId)
  const user = users.find((candidate) => candidate.id === selectedId)
  if (!user) return <span>{fr.client.unknownAgent}</span>

  return (
    <Button
      variant="outline"
      className="h-auto justify-start px-3 py-2"
      aria-label={fr.agentEditor.selectPerson}
      onClick={() => {
        const currentIndex = users.findIndex(
          (candidate) => candidate.id === selectedId,
        )
        const nextUser = users[(currentIndex + 1) % users.length]
        if (nextUser) setSelectedId(nextUser.id)
      }}
    >
      <HumanAvatar user={user} status="working" size="sm" />
      <span className="text-left">
        <span className="block text-sm font-bold text-ink">{user.name}</span>
        <span className="block font-mono text-xs font-normal text-graphite">
          {selectedId}
        </span>
      </span>
      <ChevronDown aria-hidden="true" className="ml-auto size-4" />
    </Button>
  )
}

function ProfileSelector({
  value,
  onChange,
}: {
  value: HarnessView["profile"]
  onChange: (value: HarnessView["profile"]) => void
}) {
  const profiles = [
    {
      id: "autonome",
      label: fr.agentEditor.autonomous,
      description: fr.agentEditor.autonomousDescription,
    },
    {
      id: "supervise",
      label: fr.agentEditor.supervised,
      description: fr.agentEditor.supervisedDescription,
    },
    {
      id: "strict",
      label: fr.agentEditor.strict,
      description: fr.agentEditor.strictDescription,
    },
  ] as const

  return (
    <div className="grid grid-cols-3 gap-3">
      {profiles.map((profile) => (
        <Button
          key={profile.id}
          variant="outline"
          className={cn(
            "h-auto min-h-24 items-start justify-start whitespace-normal p-4 text-left",
            value === profile.id &&
              "border-action bg-action-soft ring-1 ring-action",
          )}
          onClick={() => onChange(profile.id)}
        >
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
              value === profile.id
                ? "border-action bg-action text-white"
                : "border-line",
            )}
          >
            {value === profile.id && (
              <Check aria-hidden="true" className="size-3" />
            )}
          </span>
          <span>
            <span className="block text-sm font-bold text-ink">
              {profile.label}
            </span>
            <span className="mt-1 block text-xs font-normal leading-5 text-graphite">
              {profile.description}
            </span>
          </span>
        </Button>
      ))}
    </div>
  )
}

export default function AdminAgentEditor({
  tenant,
  suite,
  agent,
  harness,
  connectorTypes,
  connections,
  connectorAccess,
  knowledge,
}: AdminAgentEditorProps) {
  const [firstName, setFirstName] = useState(agent.firstName)
  const [role, setRole] = useState(agent.role)
  const [description, setDescription] = useState(agent.description)
  const [department, setDepartment] = useState(
    departmentLabel(agent.department),
  )
  const [prompt, setPrompt] = useState(
    `Tu es {{agent_name}}, agent de {{department}} pour {{client_name}}.

Ta mission principale est : {{role}}.

Objectifs :
- Comprendre la demande avant d'agir.
- Produire un résultat directement exploitable.
- Demander une validation humaine avant toute action externe sensible.

Contexte de la suite : {{suite_name}}.
Réponds en français, de façon concise et professionnelle.`,
  )
  const [selectedTools, setSelectedTools] = useState(
    agent.tools.map((tool) => tool.key),
  )
  const [recipients, setRecipients] = useState(
    suite.agents
      .filter((candidate) => candidate.name !== agent.name)
      .map((candidate) => candidate.name),
  )
  const [canHire, setCanHire] = useState(false)
  const [maxInstances, setMaxInstances] = useState("2")
  const [profile, setProfile] = useState<HarnessView["profile"]>(
    harness.profile,
  )
  const [selectedKnowledge, setSelectedKnowledge] = useState(
    knowledge
      .filter((document) => document.usedByAgents.includes(agent.name))
      .map((document) => document.id),
  )

  const availableTools = useMemo(
    () =>
      Array.from(
        new Map(
          suite.agents
            .flatMap((candidate) => candidate.tools)
            .map((tool) => [tool.key, tool]),
        ).values(),
      ),
    [suite.agents],
  )

  const resolvedPrompt = prompt
    .replace(/\{\{agent_name\}\}/g, firstName)
    .replace(/\{\{department\}\}/g, department)
    .replace(/\{\{client_name\}\}/g, tenant.name)
    .replace(/\{\{role\}\}/g, role)
    .replace(/\{\{suite_name\}\}/g, suite.name)

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
                window.location.assign(
                  `/admin/clients/${tenant.id}/suites/${suite.id}`,
                )
              }
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <AgentAvatar agent={agent} />
            <div>
              <p className="text-xs text-graphite">
                {tenant.name} · {suite.name}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <h1 className="font-heading text-xl font-extrabold text-ink">
                  {fr.agentEditor.agentEditor} · {firstName}
                </h1>
                <code className="rounded bg-graphite-soft px-2 py-1 text-xs text-graphite">
                  {agent.name}
                </code>
              </div>
            </div>
          </div>
          <Button>
            <Save aria-hidden="true" className="size-4" />
            {fr.agentEditor.saveDraft}
          </Button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[1.15fr_0.85fr] gap-6 px-6 py-6">
        <div className="space-y-5">
          <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Bot aria-hidden="true" className="size-4 text-teal-strong" />
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.agentEditor.identity}
              </h2>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-graphite">
                  {fr.agentEditor.firstName}
                </label>
                <Input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-graphite">
                  {fr.agentEditor.role}
                </label>
                <Input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-graphite">
                  {fr.agentEditor.description}
                </label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-graphite">
                  {fr.agentEditor.department}
                </label>
                <Input
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-graphite">
                  {fr.agentEditor.avatar}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <AgentAvatar agent={agent} />
                  {["bg-brand-ink", "bg-teal", "bg-action", "bg-graphite"].map(
                    (tone) => (
                      <Button
                        key={tone}
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full p-1"
                      >
                        <span className={cn("size-full rounded-full", tone)} />
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Code2 aria-hidden="true" className="size-4 text-teal-strong" />
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.agentEditor.promptRole}
              </h2>
            </div>
            <p className="mt-1 text-xs text-graphite">
              {fr.agentEditor.promptDescription}
            </p>
            <label className="mt-5 block text-xs font-bold text-graphite">
              {fr.agentEditor.promptTemplate}
            </label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-2 min-h-72 font-mono text-xs leading-6"
            />
            <p className="mt-4 text-xs font-bold text-graphite">
              {fr.agentEditor.variables}
            </p>
            <div className="mt-2">
              <HighlightedPrompt prompt={prompt} />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Wrench aria-hidden="true" className="size-4 text-teal-strong" />
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.agentEditor.tools}
              </h2>
            </div>
            <p className="mt-1 text-xs text-graphite">
              {fr.agentEditor.toolsDescription}
            </p>
            <div className="mt-5 space-y-2">
              {connectorTypes
                .filter((connector) =>
                  availableTools.some(
                    (tool) => tool.connectorKey === connector.key,
                  ),
                )
                .map((connector) => {
                  const connection = connections.find(
                    (item) => item.connectorKey === connector.key,
                  )
                  const access = connectorAccess.find(
                    (item) =>
                      item.agent === agent.name &&
                      item.connectorKey === connector.key,
                  )
                  const writeLocked = connection?.grantedAccess === "read"
                  return (
                    <article
                      key={connector.key}
                      className="overflow-hidden rounded-lg border border-line"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-line bg-paper p-3">
                        <div className="flex items-center gap-3">
                          <ConnectorLogo connector={connector} size="sm" />
                          <div>
                            <p className="text-sm font-bold text-ink">
                              {connector.name}
                            </p>
                            <p className="mt-0.5 text-xs text-graphite">
                              {connection?.accountLabel ?? "—"}
                            </p>
                          </div>
                        </div>
                        <ConnectionStatusBadge
                          status={connection?.status ?? "not_connected"}
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-bold text-graphite">
                            {fr.connectors.access}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant={
                                access?.access === "read"
                                  ? "default"
                                  : "outline"
                              }
                              className="h-8 text-xs"
                            >
                              {fr.connectors.read}
                            </Button>
                            <Button
                              variant={
                                access?.access === "read_write"
                                  ? "default"
                                  : "outline"
                              }
                              className="h-8 text-xs"
                              disabled={writeLocked}
                              title={
                                writeLocked
                                  ? fr.connectors.accessLimit
                                  : undefined
                              }
                            >
                              {writeLocked && (
                                <Lock aria-hidden="true" className="size-3.5" />
                              )}
                              {fr.connectors.readWrite}
                            </Button>
                          </div>
                        </div>
                        {connector.category === "email" && (
                          <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-paper p-3">
                            <span className="flex items-center gap-2 text-xs font-bold text-ink">
                              <Mail aria-hidden="true" className="size-4" />
                              {fr.connectors.sendingAccount}
                            </span>
                            <span className="text-xs text-graphite">
                              {access?.sendAs === "shared_account"
                                ? fr.connectors.sharedAccount
                                : fr.connectors.connectedUser}
                            </span>
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {availableTools
                            .filter(
                              (tool) => tool.connectorKey === connector.key,
                            )
                            .map((tool) => (
                              <span
                                key={tool.key}
                                className="flex items-center gap-2 rounded-md border border-line px-2 py-1.5 text-xs font-semibold text-ink"
                              >
                                {tool.label}
                                <RiskBadge risk={tool.risk} />
                              </span>
                            ))}
                        </div>
                      </div>
                    </article>
                  )
                })}
              {availableTools
                .filter((tool) => !tool.connectorKey)
                .map((tool) => {
                const selected = selectedTools.includes(tool.key)
                return (
                  <Button
                    key={tool.key}
                    variant="outline"
                    className={cn(
                      "h-auto w-full justify-start p-3",
                      selected && "border-action bg-action-soft",
                    )}
                    onClick={() =>
                      setSelectedTools((current) =>
                        current.includes(tool.key)
                          ? current.filter((key) => key !== tool.key)
                          : [...current, tool.key],
                      )
                    }
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded border",
                        selected
                          ? "border-action bg-action text-white"
                          : "border-line bg-surface",
                      )}
                    >
                      {selected && (
                        <Check aria-hidden="true" className="size-3" />
                      )}
                    </span>
                    <span className="flex-1 text-left">
                      <span className="block text-sm font-bold text-ink">
                        {tool.label}
                      </span>
                      <code className="mt-0.5 block text-xs font-normal text-graphite">
                        {tool.key}
                      </code>
                    </span>
                    <RiskBadge risk={tool.risk} />
                  </Button>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Code2 aria-hidden="true" className="size-4 text-teal-strong" />
              <div
                role="heading"
                aria-level={2}
                className="font-heading text-lg font-bold text-ink"
              >
                {fr.knowledge.title}
              </div>
            </div>
            <p className="mt-1 text-xs text-graphite">
              {fr.knowledge.selectDocuments}
            </p>
            <div className="mt-4 grid gap-2">
              {knowledge.map((document) => {
                const selected = selectedKnowledge.includes(document.id)
                return (
                  <Button
                    key={document.id}
                    variant="outline"
                    className={cn(
                      "h-auto justify-start p-3 text-left",
                      selected && "border-action bg-action-soft",
                    )}
                    onClick={() =>
                      setSelectedKnowledge((current) =>
                        current.includes(document.id)
                          ? current.filter((id) => id !== document.id)
                          : [...current, document.id],
                      )
                    }
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded border",
                        selected
                          ? "border-action bg-action text-white"
                          : "border-line",
                      )}
                    >
                      {selected && (
                        <Check aria-hidden="true" className="size-3" />
                      )}
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-ink">
                        {document.title}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-graphite">
                        {knowledgeCategoryLabel(document.category)} ·{" "}
                        {knowledgeStatusLabel(document.status)}
                      </span>
                    </span>
                  </Button>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Users aria-hidden="true" className="size-4 text-teal-strong" />
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.agentEditor.communication}
              </h2>
            </div>
            <p className="mt-5 text-xs font-bold text-graphite">
              {fr.agentEditor.allowedRecipients}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suite.agents
                .filter((candidate) => candidate.name !== agent.name)
                .map((candidate) => (
                  <Button
                    key={candidate.name}
                    variant={
                      recipients.includes(candidate.name)
                        ? "default"
                        : "outline"
                    }
                    className="h-9"
                    onClick={() =>
                      setRecipients((current) =>
                        current.includes(candidate.name)
                          ? current.filter((name) => name !== candidate.name)
                          : [...current, candidate.name],
                      )
                    }
                  >
                    <AgentAvatar agent={candidate} size="sm" />
                    {candidate.firstName}
                  </Button>
                ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-md border border-line p-3">
                <span className="text-xs font-semibold text-ink">
                  {fr.agentEditor.canHire}
                </span>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-6 w-11 rounded-full p-0.5",
                    canHire
                      ? "justify-end bg-teal"
                      : "justify-start bg-graphite-soft",
                  )}
                  onClick={() => setCanHire((value) => !value)}
                >
                  <span className="size-5 rounded-full bg-white shadow-sm" />
                </Button>
              </div>
              <div>
                <label className="text-xs font-bold text-graphite">
                  {fr.agentEditor.maxInstances}
                </label>
                <Input
                  type="number"
                  value={maxInstances}
                  onChange={(event) => setMaxInstances(event.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-paper p-5">
            <div className="flex items-center gap-2">
              <Settings2
                aria-hidden="true"
                className="size-4 text-teal-strong"
              />
              <h2 className="font-heading text-lg font-bold text-ink">
                {fr.agentEditor.harness}
              </h2>
            </div>
            <div className="mt-5">
              <ProfileSelector value={profile} onChange={setProfile} />
            </div>
            <div className="mt-5 space-y-3">
              <HarnessBlock title={fr.agentEditor.model} icon={Sparkles}>
                <InheritedField
                  label="alias"
                  field={harness.model.alias}
                />
                <InheritedField
                  label={fr.agentEditor.temperature}
                  field={harness.model.temperature}
                />
                <InheritedField
                  label={fr.agentEditor.reasoningEffort}
                  field={harness.model.reasoningEffort}
                />
              </HarnessBlock>

              <HarnessBlock title={fr.agentEditor.loop} icon={Settings2}>
                <InheritedField
                  label={fr.agentEditor.maxSteps}
                  field={harness.loop.maxStepsPerTurn}
                />
                <InheritedField
                  label={fr.agentEditor.outputTokens}
                  field={harness.loop.maxOutputTokensPerCall}
                />
                <InheritedField
                  label={fr.agentEditor.parallelCalls}
                  field={harness.loop.parallelToolCalls}
                />
              </HarnessBlock>

              <HarnessBlock title={fr.agentEditor.context} icon={Code2}>
                <InheritedField
                  label={fr.agentEditor.compactionThreshold}
                  field={harness.context.compactionThreshold}
                />
                <InheritedField
                  label={fr.agentEditor.keptExchanges}
                  field={harness.context.keepLastExchanges}
                />
                <InheritedField
                  label={fr.agentEditor.teamSummary}
                  field={harness.context.teamSummary}
                />
              </HarnessBlock>

              <HarnessBlock title={fr.agentEditor.harnessBudget} icon={ShieldCheck}>
                <InheritedField
                  label={fr.suiteEditor.maxTokensPerTask}
                  field={harness.budget.maxTokensPerTask}
                />
              </HarnessBlock>

              <HarnessBlock title={fr.agentEditor.autonomy} icon={Lock}>
                <InheritedField
                  label={fr.agentProfile.behavior}
                  field={harness.autonomy.level}
                  value={adminValueLabel(harness.autonomy.level.value)}
                />
                <AutonomyMatrix policies={harness.autonomy.toolPolicies} />
                <InheritedField
                  label={fr.agentEditor.askWhenUncertain}
                  field={harness.autonomy.askWhenUncertain}
                  value={
                    <BooleanSwitch
                      initialValue={
                        harness.autonomy.askWhenUncertain.value
                      }
                    />
                  }
                />
              </HarnessBlock>

              <HarnessBlock title={fr.agentEditor.humanLoop} icon={Users}>
                <InheritedField
                  label={fr.agentEditor.defaultAssignee}
                  field={harness.humanInTheLoop.defaultAssignee}
                  value={
                    <PersonSelector
                      users={suite.humans}
                      initialUserId={
                        harness.humanInTheLoop.defaultAssignee.value
                      }
                    />
                  }
                />
                <InheritedField
                  label={fr.agentEditor.channels}
                  field={harness.humanInTheLoop.channels}
                  value={
                    <ChannelSelector
                      initialValue={harness.humanInTheLoop.channels.value}
                    />
                  }
                />
                <InheritedField
                  label={fr.agentEditor.reminderAfter}
                  field={harness.humanInTheLoop.reminderAfter}
                  value={
                    <DurationSelector
                      initialValue={harness.humanInTheLoop.reminderAfter.value}
                    />
                  }
                />
                <InheritedField
                  label={fr.agentEditor.timeout}
                  field={harness.humanInTheLoop.timeout}
                  value={
                    <DurationSelector
                      initialValue={harness.humanInTheLoop.timeout.value}
                    />
                  }
                />
                <InheritedField
                  label={fr.agentEditor.timeoutBehavior}
                  field={harness.humanInTheLoop.onTimeout}
                  value={
                    <TimeoutBehaviorSelector
                      initialValue={harness.humanInTheLoop.onTimeout.value}
                    />
                  }
                />
                <InheritedField
                  label={fr.agentEditor.escalation}
                  field={harness.humanInTheLoop.escalateTo}
                  value={
                    <PersonSelector
                      users={suite.humans}
                      initialUserId={
                        harness.humanInTheLoop.escalateTo.value
                      }
                    />
                  }
                />
                <InheritedField
                  label={fr.agentEditor.openRequests}
                  field={harness.humanInTheLoop.maxOpenRequests}
                />
              </HarnessBlock>

              <HarnessBlock title={fr.agentEditor.guardrails} icon={ShieldCheck}>
                {harness.guardrails.map((guardrail) => (
                  <div
                    key={guardrail.key}
                    className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-ink">
                        {guardrail.label}
                      </p>
                      <code className="mt-1 block text-xs text-graphite">
                        {guardrail.key}
                      </code>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-bold",
                        guardrail.enabled
                          ? "bg-teal-soft text-teal-strong"
                          : "bg-graphite-soft text-graphite",
                      )}
                    >
                      {guardrail.enabled
                        ? fr.agentEditor.enabled
                        : fr.agentEditor.disabled}
                    </span>
                  </div>
                ))}
              </HarnessBlock>
            </div>
          </section>
        </div>

        <aside className="sticky top-6 h-fit space-y-4">
          <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
                  {fr.agentEditor.finalPreview}
                </p>
                <h2 className="mt-1 font-heading text-base font-bold text-ink">
                  {fr.agentEditor.resolvedPrompt}
                </h2>
              </div>
              <span className="rounded-full bg-teal-soft px-2 py-1 text-xs font-bold text-teal-strong">
                {profileLabel(profile)}
              </span>
            </div>
            <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap bg-brand-ink p-5 font-mono text-xs leading-6 text-white/75">
              {resolvedPrompt}
            </pre>
          </section>

          <section className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Fingerprint
                aria-hidden="true"
                className="size-4 text-teal-strong"
              />
              <h2 className="font-heading text-base font-bold text-ink">
                {fr.agentEditor.effectiveHarness}
              </h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                [fr.agentEditor.behavior, profileLabel(profile)],
                [fr.agentEditor.modelAlias, harness.model.alias.value],
                [
                  fr.agentEditor.temperature,
                  harness.model.temperature.value,
                ],
                [
                  fr.agentEditor.maximumSteps,
                  harness.loop.maxStepsPerTurn.value,
                ],
                [
                  fr.agentEditor.externalActions,
                  toolPolicyLabel(
                    harness.autonomy.toolPolicies.write_external.value,
                  ),
                ],
                [
                  fr.agentEditor.deadline,
                  durationLabel(harness.humanInTheLoop.timeout.value),
                ],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-md bg-paper p-2.5">
                  <p className="text-xs text-ink">
                    <span className="text-graphite">{label} :</span>{" "}
                    <strong>{String(value)}</strong>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-graphite">
                {fr.agentEditor.fingerprint}
              </p>
              <code className="mt-2 block break-all rounded-md bg-graphite-soft p-3 text-xs text-action-strong">
                {harness.effectiveHash}
              </code>
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  )
}
