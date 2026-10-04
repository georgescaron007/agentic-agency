import {
  Activity,
  ChevronRight,
  Coins,
  MessageSquarePlus,
  Settings2,
  X,
} from "lucide-react"

import { AgentAvatar, AgentStatusBadge, RiskBadge } from "@/components/foundations"
import {
  ConnectionStatusBadge,
  ConnectorLogo,
} from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import {
  agentLabel,
  type ActivityEvent,
  type Agent,
  type AutonomyLevel,
  type Connection,
  type ConnectorType,
  type Suite,
  type ToolPolicy,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"

interface AgentProfilePanelProps {
  agent: Agent
  suite: Suite
  events: ActivityEvent[]
  onClose: () => void
  onWrite: () => void
  connectorTypes: ConnectorType[]
  connections: Connection[]
}

const behaviorLabels: Record<AutonomyLevel, string> = {
  autonomous: fr.agentProfile.autonomous,
  supervised: fr.agentProfile.supervised,
  strict: fr.agentProfile.strict,
}

const policyLabels: Record<ToolPolicy, string> = {
  auto: fr.agentProfile.automatic,
  ask: fr.agentProfile.asksApproval,
  forbid: fr.agentProfile.forbidden,
}

function formatCredits(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function AgentProfilePanel({
  agent,
  suite,
  events,
  onClose,
  onWrite,
  connectorTypes,
  connections,
}: AgentProfilePanelProps) {
  const recentEvents = events
    .filter((event) => event.actor === agent.name)
    .slice(0, 4)

  return (
    <div className="fixed inset-0 z-[70]">
      <Button
        variant="ghost"
        className="absolute inset-0 h-full w-full rounded-none bg-ink/45 p-0 backdrop-blur-sm"
        onClick={onClose}
        aria-label={fr.agentProfile.close}
      >
        <X aria-hidden="true" className="sr-only" />
      </Button>
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
              {fr.common.agent}
            </p>
            <h2 className="mt-0.5 font-heading text-lg font-bold text-ink">
              {fr.agentProfile.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={fr.agentProfile.close}
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <section className="border-b border-line bg-surface p-5">
            <div className="flex items-start gap-4">
              <AgentAvatar agent={agent} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-xl font-bold text-ink">
                  {agentLabel(agent, suite.agentNaming)}
                </h3>
                <p className="mt-1 text-sm text-graphite">{agent.department}</p>
                <div className="mt-3">
                  {agent.name === "@hugo" && agent.status === "idle" ? (
                    <span className="inline-flex rounded-full bg-graphite-soft px-2.5 py-1 text-xs font-bold text-graphite">
                      {fr.agentProfile.idleGmailStatus}
                    </span>
                  ) : (
                    <AgentStatusBadge status={agent.status} />
                  )}
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-graphite">
              {agent.description}
            </p>
          </section>

          <section className="border-b border-line p-5">
            <div className="flex items-center gap-2">
              <Settings2
                aria-hidden="true"
                className="size-4 text-teal-strong"
              />
              <h3 className="font-heading text-base font-bold text-ink">
                {fr.agentProfile.behavior}
              </h3>
            </div>
            <div className="mt-3 rounded-lg border border-line bg-surface px-4 py-3">
              <p className="text-sm font-semibold text-ink">
                {behaviorLabels[agent.autonomyLevel]}
              </p>
              <p className="mt-1 text-xs text-graphite">
                {fr.agentProfile.behavior} · {fr.common.agent}
              </p>
            </div>
          </section>

          <section className="border-b border-line p-5">
            <h3 className="font-heading text-base font-bold text-ink">
              {fr.agentProfile.capabilities}
            </h3>
            <div className="mt-4 space-y-3">
              {connectorTypes
                .filter((connector) =>
                  agent.tools.some(
                    (tool) => tool.connectorKey === connector.key,
                  ),
                )
                .map((connector) => {
                  const connection = connections.find(
                    (item) => item.connectorKey === connector.key,
                  )
                  return (
                    <article
                      key={connector.key}
                      className="overflow-hidden rounded-lg border border-line bg-surface"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-line bg-paper p-3">
                        <div className="flex items-center gap-2">
                          <ConnectorLogo connector={connector} size="sm" />
                          <p className="text-sm font-bold text-ink">
                            {connector.name}
                          </p>
                        </div>
                        <ConnectionStatusBadge
                          status={connection?.status ?? "not_connected"}
                        />
                      </div>
                      <div className="space-y-3 p-3">
                        {agent.tools
                          .filter(
                            (tool) => tool.connectorKey === connector.key,
                          )
                          .map((tool) => (
                            <div key={tool.key}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-bold text-ink">
                                  {tool.label}
                                </p>
                                <RiskBadge risk={tool.risk} />
                              </div>
                              <p className="mt-1 text-xs leading-5 text-graphite">
                                {tool.label} —{" "}
                                <strong className="font-semibold text-ink">
                                  {policyLabels[tool.policy]}
                                </strong>
                              </p>
                            </div>
                          ))}
                      </div>
                    </article>
                  )
                })}
              {agent.tools
                .filter((tool) => !tool.connectorKey)
                .map((tool) => (
                  <article
                    key={tool.key}
                    className="rounded-lg border border-line bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-ink">{tool.label}</p>
                      <RiskBadge risk={tool.risk} />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-graphite">
                      {tool.label} —{" "}
                      <strong className="font-semibold text-ink">
                        {policyLabels[tool.policy]}
                      </strong>
                    </p>
                  </article>
                ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 border-b border-line p-5">
            <div className="rounded-lg bg-brand-ink p-4 text-white">
              <Coins aria-hidden="true" className="size-5 text-teal" />
              <p className="mt-5 font-heading text-2xl font-extrabold">
                {formatCredits(agent.creditsThisMonth)}
              </p>
              <p className="mt-1 text-xs text-white/55">
                {fr.agentProfile.monthlyCredits}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface p-4">
              <Activity
                aria-hidden="true"
                className="size-5 text-action-strong"
              />
              <p className="mt-5 font-heading text-2xl font-extrabold text-ink">
                {recentEvents.length}
              </p>
              <p className="mt-1 text-xs text-graphite">
                {fr.agentProfile.recentActivity}
              </p>
            </div>
          </section>

          <section className="p-5">
            <h3 className="font-heading text-base font-bold text-ink">
              {fr.agentProfile.recentActivity}
            </h3>
            {recentEvents.length > 0 ? (
              <div className="mt-4 space-y-2">
                {recentEvents.map((event) => (
                  <article
                    key={event.seq}
                    className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3"
                  >
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-teal" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-5 text-ink">
                        {event.summary}
                      </p>
                      <p className="mt-1 font-mono text-xs text-graphite">
                        {formatActivityTime(event.createdAt)}
                      </p>
                    </div>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 text-graphite"
                    />
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-graphite">
                {fr.agentProfile.noRecentActivity}
              </p>
            )}
          </section>
        </div>

        <footer className="shrink-0 border-t border-line bg-surface p-4">
          <Button className="w-full" onClick={onWrite}>
            <MessageSquarePlus aria-hidden="true" className="size-4" />
            {fr.agentProfile.writeToAgent}
          </Button>
        </footer>
      </aside>
    </div>
  )
}
