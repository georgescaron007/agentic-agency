import { Minus, Pencil, Plus } from "lucide-react"

import { type HarnessView, type Suite } from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

interface VersionDiffProps {
  suite: Suite
  harness: HarnessView
}

export default function VersionDiff({ suite, harness }: VersionDiffProps) {
  const sections = [
    {
      title: fr.publication.agents,
      changes: [
        {
          kind: "added",
          label: `${suite.agents[2]?.firstName ?? "Nora"} · ${suite.agents[2]?.role ?? "Suivi"}`,
          before: "—",
          after: "Nouvel agent dans l’organisation",
        },
        {
          kind: "modified",
          label: suite.agents[0]?.role ?? "Coordination",
          before: "Supervisé · 12 étapes",
          after: `Supervisé · ${harness.loop.maxStepsPerTurn.value} étapes`,
        },
      ],
    },
    {
      title: fr.publication.prompts,
      changes: [
        {
          kind: "modified",
          label: `Prompt · ${suite.agents[1]?.firstName ?? "Agent"}`,
          before: "Rédiger des propositions commerciales.",
          after:
            "Rédiger des propositions orientées résultat avec synthèse exécutive.",
        },
      ],
    },
    {
      title: fr.publication.harness,
      changes: [
        {
          kind: "modified",
          label: "max_steps_per_turn",
          before: "18",
          after: String(harness.loop.maxStepsPerTurn.value),
        },
        {
          kind: "modified",
          label: "write_external",
          before: "ask",
          after: harness.autonomy.toolPolicies.write_external.value,
        },
      ],
    },
    {
      title: fr.publication.approvals,
      changes: [
        {
          kind: "removed",
          label: "Validation des mises à jour CRM internes",
          before: "Demander une validation",
          after: "—",
        },
        {
          kind: "added",
          label: "Validation du premier contact",
          before: "—",
          after: "Validation du coordinateur requise",
        },
      ],
    },
    {
      title: fr.publication.clientInterface,
      changes: [
        {
          kind: "modified",
          label: fr.suiteEditor.agentNaming,
          before: fr.suiteEditor.roleOnly,
          after: fr.suiteEditor.firstNameRole,
        },
      ],
    },
  ] as const

  const tone = {
    added: {
      label: fr.publication.added,
      icon: Plus,
      className: "bg-teal-soft text-teal-strong",
    },
    removed: {
      label: fr.publication.removed,
      icon: Minus,
      className: "bg-danger-soft text-danger",
    },
    modified: {
      label: fr.publication.modified,
      icon: Pencil,
      className: "bg-action-soft text-action-strong",
    },
  } as const

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section
          key={section.title}
          className="overflow-hidden rounded-lg border border-line bg-surface shadow-card"
        >
          <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-3">
            <h2 className="font-heading text-base font-bold text-ink">
              {section.title}
            </h2>
            <span className="rounded-full bg-graphite-soft px-2 py-1 font-mono text-xs text-graphite">
              {section.changes.length}
            </span>
          </div>
          <div className="divide-y divide-line">
            {section.changes.map((change) => {
              const style = tone[change.kind]
              const Icon = style.icon
              return (
                <article
                  key={change.label}
                  className="grid grid-cols-[0.65fr_1fr_1fr] gap-4 px-4 py-3.5"
                >
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold",
                        style.className,
                      )}
                    >
                      <Icon aria-hidden="true" className="size-3.5" />
                      {style.label}
                    </span>
                    <p className="mt-2 text-xs font-bold text-ink">
                      {change.label}
                    </p>
                  </div>
                  <div className="rounded-md bg-danger-soft/45 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-graphite">
                      {fr.publication.before}
                    </p>
                    <p className="mt-1 font-mono text-xs leading-5 text-ink">
                      {change.before}
                    </p>
                  </div>
                  <div className="rounded-md bg-teal-soft/60 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-graphite">
                      {fr.publication.after}
                    </p>
                    <p className="mt-1 font-mono text-xs leading-5 text-ink">
                      {change.after}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
