import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Code2,
  MessageSquareText,
  Pause,
  Play,
  Settings2,
  ShieldQuestion,
  TerminalSquare,
  Wrench,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import {
  type ActivityEvent,
  type AgentMessage,
  type HarnessView,
  type HumanRequest,
  type Suite,
  type SuiteVersion,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { profileLabel } from "@/lib/admin-labels"
import { humanRequestTitle } from "@/lib/human-requests"
import { cn } from "@/lib/utils"

interface AdminTeamJournalProps {
  suite: Suite
  events: ActivityEvent[]
  messages: AgentMessage[]
  requests: HumanRequest[]
  versions: SuiteVersion[]
  harness: HarnessView
}

function formatJournalTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))
}

export default function AdminTeamJournal({
  suite,
  events,
  messages,
  requests,
  versions,
  harness,
}: AdminTeamJournalProps) {
  const timeline = useMemo(() => {
    const entries = [
      ...messages.map((message) => ({
        id: `message-${message.id}`,
        kind: "message",
        title: fr.teamJournal.message,
        summary: message.content,
        actor: message.sender,
        createdAt: message.createdAt,
        message,
      })),
      ...messages
        .filter((message) => message.trace)
        .flatMap((message) => [
          {
            id: `llm-${message.id}`,
            kind: "llm",
            title: fr.teamJournal.llmCall,
            summary: `${message.trace?.steps ?? 0} étapes · ${message.trace?.credits ?? 0} tokens`,
            actor: message.sender,
            createdAt: message.createdAt,
            message,
          },
          ...(message.trace?.tools.map((tool, index) => ({
            id: `tool-${message.id}-${index}`,
            kind: "tool",
            title: fr.teamJournal.toolCall,
            summary: `${tool.key} · ${tool.durationMs} ms · ${tool.ok ? fr.sandbox.success : "error"}`,
            actor: message.sender,
            createdAt: message.createdAt,
            message,
          })) ?? []),
        ]),
      ...requests.map((request) => ({
        id: `request-${request.id}`,
        kind: "request",
        title: fr.teamJournal.humanRequest,
        summary: humanRequestTitle(request),
        actor: request.agent,
        createdAt: request.createdAt,
        message: undefined,
      })),
      ...versions.map((version) => ({
        id: `version-${version.version}`,
        kind: "harness",
        title: fr.teamJournal.harnessChange,
        summary: `Version ${version.version} · ${version.notes ?? fr.suiteEditor.noNotes}`,
        actor: version.author,
        createdAt: version.createdAt,
        message: undefined,
      })),
      ...events.map((event) => ({
        id: `event-${event.seq}`,
        kind: "event",
        title: event.type,
        summary: event.summary,
        actor: event.actor,
        createdAt: event.createdAt,
        message: undefined,
      })),
    ]

    return entries.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }, [events, messages, requests, versions])

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = timeline[index]
  const inspectedMessage =
    current?.kind === "llm" ? current.message : undefined

  useEffect(() => {
    if (!playing) return
    const interval = window.setInterval(() => {
      setIndex((currentIndex) => {
        if (currentIndex >= timeline.length - 1) {
          setPlaying(false)
          return currentIndex
        }
        return currentIndex + 1
      })
    }, 1_200)
    return () => window.clearInterval(interval)
  }, [playing, timeline.length])

  function kindIcon(kind: string) {
    if (kind === "message") return MessageSquareText
    if (kind === "llm") return Bot
    if (kind === "tool") return Wrench
    if (kind === "request") return ShieldQuestion
    if (kind === "harness") return Settings2
    return TerminalSquare
  }

  return (
    <AdminShell>
      <div className="flex h-[calc(100vh-4.25rem)] flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => window.location.assign("/admin/supervision")}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <div>
              <h1 className="font-heading text-lg font-bold text-ink">
                {fr.teamJournal.title} · {suite.name}
              </h1>
              <p className="mt-0.5 font-mono text-xs text-graphite">
                {suite.id} · {timeline.length} {fr.teamJournal.events}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-line bg-paper p-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              aria-label={fr.teamJournal.previous}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <Button
              size="icon"
              className="size-9"
              onClick={() => setPlaying((value) => !value)}
              aria-label={
                playing ? fr.teamJournal.pause : fr.teamJournal.play
              }
            >
              {playing ? (
                <Pause aria-hidden="true" className="size-4" />
              ) : (
                <Play aria-hidden="true" className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={index >= timeline.length - 1}
              onClick={() =>
                setIndex((value) =>
                  Math.min(timeline.length - 1, value + 1),
                )
              }
              aria-label={fr.teamJournal.next}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
            <span className="px-2 font-mono text-xs text-graphite">
              {index + 1} / {timeline.length}
            </span>
          </div>
        </header>

        <div className="h-1 shrink-0 bg-muted">
          <div
            className={cn(
              "h-full bg-teal transition-all",
              index / Math.max(timeline.length - 1, 1) > 0.75
                ? "w-full"
                : index / Math.max(timeline.length - 1, 1) > 0.5
                  ? "w-3/4"
                  : index / Math.max(timeline.length - 1, 1) > 0.25
                    ? "w-1/2"
                    : "w-1/4",
            )}
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="w-96 shrink-0 overflow-y-auto border-r border-line bg-paper">
            <div className="sticky top-0 z-10 border-b border-line bg-paper px-4 py-3">
              <p className="text-sm font-bold text-ink">
                {fr.teamJournal.chronologicalReplay}
              </p>
            </div>
            <div className="p-3">
              {timeline.map((entry, entryIndex) => {
                const Icon = kindIcon(entry.kind)
                const active = entryIndex === index
                const passed = entryIndex < index
                return (
                  <Button
                    key={entry.id}
                    variant="ghost"
                    className={cn(
                      "relative mb-1 h-auto w-full justify-start rounded-lg border border-transparent p-3 text-left",
                      active && "border-action bg-action-soft",
                      passed && "opacity-60",
                    )}
                    onClick={() => {
                      setIndex(entryIndex)
                      setPlaying(false)
                    }}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md",
                        entry.kind === "llm"
                          ? "bg-action-soft text-action-strong"
                          : entry.kind === "tool"
                            ? "bg-teal-soft text-teal-strong"
                            : entry.kind === "request"
                              ? "bg-waiting-soft text-waiting-strong"
                              : "bg-graphite-soft text-graphite",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-ink">
                          {entry.title}
                        </span>
                        <span className="font-mono text-xs font-normal text-graphite">
                          {formatJournalTime(entry.createdAt)}
                        </span>
                      </span>
                      <span className="mt-1 line-clamp-2 whitespace-normal text-xs font-normal leading-4 text-graphite">
                        {entry.summary}
                      </span>
                    </span>
                  </Button>
                )
              })}
            </div>
          </aside>

          <section className="min-w-0 flex-1 overflow-y-auto bg-paper p-6">
            {current && (
              <article className="mx-auto max-w-3xl rounded-lg border border-line bg-surface shadow-card">
                <header className="flex items-start justify-between gap-5 border-b border-line p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
                      {current.title}
                    </p>
                    <h2 className="mt-2 font-heading text-xl font-bold text-ink">
                      {current.actor}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-graphite">
                      {formatJournalTime(current.createdAt)} · {current.id}
                    </p>
                  </div>
                  <span className="rounded-full bg-graphite-soft px-3 py-1 font-mono text-xs text-graphite">
                    {current.kind}
                  </span>
                </header>
                <div className="p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
                    {current.summary}
                  </p>
                  {current.message?.trace && (
                    <div className="mt-5 grid grid-cols-4 gap-3">
                      <div className="rounded-md bg-paper p-3">
                        <p className="text-xs text-graphite">
                          {fr.sandbox.tokens}
                        </p>
                        <p className="mt-1 font-mono text-sm font-bold text-ink">
                          {current.message.trace.credits}
                        </p>
                      </div>
                      <div className="rounded-md bg-paper p-3">
                        <p className="text-xs text-graphite">
                          {fr.sandbox.duration}
                        </p>
                        <p className="mt-1 font-mono text-sm font-bold text-ink">
                          {current.message.trace.durationMs} ms
                        </p>
                      </div>
                      <div className="rounded-md bg-paper p-3">
                        <p className="text-xs text-graphite">steps</p>
                        <p className="mt-1 font-mono text-sm font-bold text-ink">
                          {current.message.trace.steps}
                        </p>
                      </div>
                      <div className="rounded-md bg-paper p-3">
                        <p className="text-xs text-graphite">tools</p>
                        <p className="mt-1 font-mono text-sm font-bold text-ink">
                          {current.message.trace.tools.length}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )}
          </section>

          <aside className="w-[26rem] shrink-0 overflow-y-auto border-l border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-bold text-ink">
                {fr.teamJournal.inspectCall}
              </p>
            </div>
            {inspectedMessage?.trace ? (
              <div className="space-y-4 p-4">
                <section className="rounded-lg border border-line">
                  <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
                    <Code2 aria-hidden="true" className="size-4 text-action" />
                    <p className="text-xs font-bold text-ink">
                      {fr.teamJournal.sentContext}
                    </p>
                  </div>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-5 text-graphite">
{`system: Suite ${suite.name}
profile: ${profileLabel(harness.profile)}
model: ${harness.model.alias.value}
team_summary: ${suite.agents.length} agents

message:
${inspectedMessage.content}`}
                  </pre>
                </section>
                <section className="rounded-lg border border-line">
                  <div className="border-b border-line bg-paper px-3 py-2.5">
                    <p className="text-xs font-bold text-ink">
                      {fr.teamJournal.modelResponse}
                    </p>
                  </div>
                  <p className="p-3 text-xs leading-6 text-ink">
                    {inspectedMessage.content}
                  </p>
                </section>
                <section className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-brand-ink p-3 text-white">
                    <Bot aria-hidden="true" className="size-4 text-teal" />
                    <p className="mt-3 text-xs text-white/45">
                      {fr.teamJournal.effectiveModel}
                    </p>
                    <p className="mt-1 font-mono text-xs font-bold">
                      {harness.model.alias.value}
                    </p>
                  </div>
                  <div className="rounded-lg border border-line p-3">
                    <CircleDollarSign
                      aria-hidden="true"
                      className="size-4 text-action"
                    />
                    <p className="mt-3 text-xs text-graphite">
                      {fr.teamJournal.realCost}
                    </p>
                    <p className="mt-1 font-mono text-xs font-bold text-ink">
                      {(inspectedMessage.trace.credits * 0.0000021).toFixed(3)} €
                    </p>
                  </div>
                </section>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-paper p-3">
                    <p className="text-xs text-graphite">
                      {fr.teamJournal.inputTokens}
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-ink">
                      {Math.round(inspectedMessage.trace.credits * 0.72)}
                    </p>
                  </div>
                  <div className="rounded-md bg-paper p-3">
                    <p className="text-xs text-graphite">
                      {fr.teamJournal.outputTokens}
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-ink">
                      {Math.round(inspectedMessage.trace.credits * 0.28)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <Bot aria-hidden="true" className="size-8 text-graphite" />
                <p className="mt-3 text-xs leading-5 text-graphite">
                  {fr.teamJournal.inspectCall}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
