import { useState } from "react"
import {
  ArrowLeft,
  Beaker,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Code2,
  Play,
  Plus,
  Send,
  Settings2,
  TerminalSquare,
  Wrench,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { AgentAvatar, HumanAvatar } from "@/components/foundations"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  agentLabel,
  type AgentMessage,
  type HarnessView,
  type Suite,
  type Task,
  type Tenant,
  type User,
  type WorkInProgress,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import {
  durationLabel,
  profileLabel,
  toolPolicyLabel,
} from "@/lib/admin-labels"
import { cn } from "@/lib/utils"

interface AdminSandboxProps {
  tenant: Tenant
  suite: Suite
  messages: AgentMessage[]
  work: WorkInProgress
  tasks: Task[]
  harness: HarnessView
  user: User
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function AdminSandbox({
  tenant,
  suite,
  messages,
  work,
  tasks,
  harness,
  user,
}: AdminSandboxProps) {
  const scenarios = suite.suggestedPrompts.map((instruction, index) => ({
    id: `scenario-${index + 1}`,
    instruction,
    expected:
      tasks[index]?.acceptanceCriteria.join(" · ") ??
      "Réponse exploitable, sourcée et conforme aux règles de validation.",
  }))
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]?.id)
  const [instruction, setInstruction] = useState(
    scenarios[0]?.instruction ?? "",
  )
  const visibleMessages = messages.filter(
    (message) =>
      message.sender === "@human" || message.recipients.includes("@human"),
  )
  const toolCalls = messages.flatMap(
    (message) =>
      message.trace?.tools.map((tool) => ({
        ...tool,
        messageId: message.id,
      })) ?? [],
  )
  const totalCredits = messages.reduce(
    (sum, message) => sum + (message.trace?.credits ?? 0),
    0,
  )
  const estimatedCost = totalCredits * 0.0000021

  return (
    <AdminShell>
      <div className="flex h-[calc(100vh-4.25rem)] flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() =>
                window.location.assign(
                  `/admin/clients/${tenant.id}/suites/${suite.id}`,
                )
              }
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <span className="flex size-9 items-center justify-center rounded-lg bg-teal text-white">
              <Beaker aria-hidden="true" className="size-4.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg font-bold text-ink">
                  {fr.sandbox.title}
                </h1>
                <span className="rounded-full bg-waiting-soft px-2 py-0.5 text-xs font-bold text-waiting-strong">
                  {fr.sandbox.isolated}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-graphite">
                {tenant.name} · {suite.name} · {fr.sandbox.draftSuite}
              </p>
            </div>
          </div>
          <Button>
            <Play aria-hidden="true" className="size-4" />
            {fr.sandbox.run}
          </Button>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="w-72 shrink-0 overflow-y-auto border-r border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-bold text-ink">
                {fr.sandbox.scenarios}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={fr.sandbox.newScenario}
              >
                <Plus aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div className="space-y-2 p-3">
              {scenarios.map((scenario) => (
                <article
                  key={scenario.id}
                  className={cn(
                    "rounded-lg border p-3",
                    selectedScenario === scenario.id
                      ? "border-action bg-action-soft"
                      : "border-line bg-surface",
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-graphite">
                    {fr.sandbox.instruction}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold leading-5 text-ink">
                    {scenario.instruction}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-graphite">
                    {fr.sandbox.expectedResult}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-graphite">
                    {scenario.expected}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-3 h-7 px-2 text-xs text-action-strong"
                    onClick={() => {
                      setSelectedScenario(scenario.id)
                      setInstruction(scenario.instruction)
                    }}
                  >
                    <Play aria-hidden="true" className="size-3.5" />
                    {fr.sandbox.replay}
                  </Button>
                </article>
              ))}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col bg-paper">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
                {visibleMessages.map((message) => {
                  const human = message.sender === "@human"
                  const agent = suite.agents.find(
                    (candidate) => candidate.name === message.sender,
                  )
                  return (
                    <article
                      key={message.id}
                      className={cn(
                        "flex max-w-2xl items-start gap-3",
                        human && "ml-auto flex-row-reverse",
                      )}
                    >
                      {human ? (
                        <HumanAvatar user={user} status="working" size="sm" />
                      ) : (
                        agent && <AgentAvatar agent={agent} />
                      )}
                      <div className={cn("min-w-0", human && "text-right")}>
                        {!human && agent && (
                          <p className="mb-1.5 text-xs font-bold text-ink">
                            {agentLabel(agent, suite.agentNaming)}
                            <span className="ml-2 font-normal text-graphite">
                              {formatTime(message.createdAt)}
                            </span>
                          </p>
                        )}
                        <div
                          className={cn(
                            "rounded-lg px-4 py-3 text-left text-sm leading-6 shadow-sm",
                            human
                              ? "rounded-br-sm bg-brand-ink text-white"
                              : "border border-line bg-surface text-ink",
                          )}
                        >
                          {message.content}
                        </div>
                      </div>
                    </article>
                  )
                })}

                <section className="ml-12 rounded-lg border border-teal/25 bg-surface p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">
                      {fr.conversation.workTitle}
                    </p>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-graphite">
                      <Clock3 aria-hidden="true" className="size-3.5" />
                      14 min
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {work.items.map((item) => {
                      const agent = suite.agents.find(
                        (candidate) => candidate.name === item.agent,
                      )
                      return (
                        <div
                          key={item.agent}
                          className="flex items-center gap-3 rounded-md bg-paper px-3 py-2"
                        >
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              item.state === "done"
                                ? "bg-lime"
                                : item.state === "waiting_human"
                                  ? "bg-waiting"
                                  : "bg-teal",
                            )}
                          />
                          <span className="flex-1 text-xs text-ink">
                            <strong>{agent?.firstName}</strong> {item.label}
                          </span>
                          <span className="font-mono text-xs text-graphite">
                            {fr.conversation.step} {item.step}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>
            </div>
            <div className="shrink-0 border-t border-line bg-surface p-3">
              <div className="mx-auto flex max-w-3xl items-end gap-2">
                <Textarea
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  placeholder={fr.sandbox.writeTestMessage}
                  className="min-h-16"
                />
                <Button size="icon" className="shrink-0">
                  <Send aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>
          </section>

          <aside className="w-96 shrink-0 overflow-y-auto border-l border-line bg-surface">
            <div className="sticky top-0 border-b border-line bg-surface px-4 py-3">
              <p className="text-sm font-bold text-ink">
                {fr.sandbox.inspector}
              </p>
              <p className="mt-0.5 text-xs text-graphite">
                {fr.sandbox.simulated} · {harness.model.alias.value}
              </p>
            </div>

            <div className="space-y-4 p-4">
              <section className="rounded-lg border border-line">
                <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
                  <Code2 aria-hidden="true" className="size-4 text-action" />
                  <p className="text-xs font-bold text-ink">
                    {fr.sandbox.modelContext}
                  </p>
                </div>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-5 text-graphite">
{`system:
Tu coordonnes ${suite.name} pour ${tenant.name}.
Profil: ${profileLabel(harness.profile)}
Politique externe: ${toolPolicyLabel(harness.autonomy.toolPolicies.write_external.value)}

user:
${instruction}

team_summary:
3 agents actifs · 1 demande humaine ouverte`}
                </pre>
              </section>

              <section className="rounded-lg border border-line">
                <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
                  <Wrench aria-hidden="true" className="size-4 text-teal-strong" />
                  <p className="text-xs font-bold text-ink">
                    {fr.sandbox.toolCalls}
                  </p>
                </div>
                <div className="divide-y divide-line">
                  {toolCalls.map((tool) => (
                    <div
                      key={`${tool.messageId}-${tool.key}`}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-teal-soft text-teal-strong">
                        <Check aria-hidden="true" className="size-3.5" />
                      </span>
                      <code className="flex-1 text-xs font-bold text-ink">
                        {tool.key}
                      </code>
                      <span className="font-mono text-xs text-graphite">
                        {tool.durationMs} ms
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-brand-ink p-3 text-white">
                  <CircleDollarSign
                    aria-hidden="true"
                    className="size-4 text-teal"
                  />
                  <p className="mt-4 font-mono text-lg font-bold">
                    {estimatedCost.toFixed(2)} €
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {fr.sandbox.cost}
                  </p>
                </div>
                <div className="rounded-lg border border-line p-3">
                  <TerminalSquare
                    aria-hidden="true"
                    className="size-4 text-action"
                  />
                  <p className="mt-4 font-mono text-lg font-bold text-ink">
                    {new Intl.NumberFormat("fr-FR", {
                      notation: "compact",
                    }).format(totalCredits)}
                  </p>
                  <p className="mt-1 text-xs text-graphite">
                    {fr.sandbox.tokens}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border border-line">
                <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
                  <Settings2 aria-hidden="true" className="size-4 text-graphite" />
                  <p className="text-xs font-bold text-ink">
                    {fr.sandbox.effectiveHarness}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 text-xs">
                  {[
                    [
                      fr.agentEditor.behavior,
                      profileLabel(harness.profile),
                    ],
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
                      fr.agentEditor.deadline,
                      durationLabel(harness.humanInTheLoop.timeout.value),
                    ],
                    [
                      fr.agentEditor.fingerprint,
                      harness.effectiveHash.slice(0, 12),
                    ],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded bg-paper p-2">
                      <p className="text-ink">
                        <span className="text-graphite">{label} :</span>{" "}
                        <strong>{String(value)}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
