import { useState } from "react"
import {
  AlertTriangle,
  Check,
  Clock3,
  Cloud,
  FileText,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react"

import { AgentAvatar } from "@/components/foundations"
import { Button } from "@/components/ui/button"
import {
  type KnowledgeDocument,
  type KnowledgeStatus,
  type Suite,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { connectorLabel } from "@/lib/admin-labels"
import { cn } from "@/lib/utils"

type KnowledgeFilter = "all" | "shared" | "suite"

interface KnowledgeLibraryProps {
  documents: KnowledgeDocument[]
  suite: Suite
  adminMode?: boolean
}

const categoryLabels: Record<KnowledgeDocument["category"], string> = {
  products: fr.knowledge.products,
  pricing: fr.knowledge.pricing,
  templates: fr.knowledge.templates,
  legal: fr.knowledge.legal,
  procedures: fr.knowledge.procedures,
  other: fr.knowledge.other,
}

const statusLabels: Record<KnowledgeStatus, string> = {
  processing: fr.knowledge.processing,
  ready: fr.knowledge.ready,
  error: fr.knowledge.error,
  outdated: fr.knowledge.outdated,
}

const statusStyles: Record<KnowledgeStatus, string> = {
  processing: "bg-action-soft text-action-strong",
  ready: "bg-teal-soft text-teal-strong",
  error: "bg-danger-soft text-danger",
  outdated: "bg-waiting-soft text-waiting-strong",
}

function formatKnowledgeDate(value?: string) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export default function KnowledgeLibrary({
  documents,
  suite,
  adminMode = false,
}: KnowledgeLibraryProps) {
  const [items, setItems] = useState(documents)
  const [filter, setFilter] = useState<KnowledgeFilter>("all")
  const [dragging, setDragging] = useState(false)
  const filtered = items.filter((document) => {
    if (filter === "shared") return !document.suiteId
    if (filter === "suite") return document.suiteId === suite.id
    return true
  })
  const categories = Array.from(
    new Set(filtered.map((document) => document.category)),
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {[
            ["all", fr.requestsPage.all],
            ["shared", fr.knowledge.allSuites],
            ["suite", fr.knowledge.suiteOnly],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setFilter(value as KnowledgeFilter)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button>
          <UploadCloud aria-hidden="true" className="size-4" />
          {fr.knowledge.addDocument}
        </Button>
      </div>

      <div
        className={cn(
          "mt-5 flex min-h-24 items-center justify-center rounded-lg border-2 border-dashed border-line bg-paper text-sm font-semibold text-graphite transition",
          dragging && "border-action bg-action-soft text-action-strong",
        )}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
      >
        <UploadCloud aria-hidden="true" className="mr-2 size-5" />
        {fr.knowledge.dropFiles}
      </div>

      <div className="mt-7 space-y-7">
        {categories.map((category) => (
          <section key={category}>
            <div className="mb-3 flex items-center gap-3">
              <div
                role="heading"
                aria-level={2}
                className="font-heading text-lg font-bold text-ink"
              >
                {categoryLabels[category]}
              </div>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="space-y-2">
              {filtered
                .filter((document) => document.category === category)
                .map((document) => (
                  <article
                    key={document.id}
                    className="grid grid-cols-[1.4fr_0.8fr_0.8fr_auto] items-center gap-4 rounded-lg border border-line bg-surface p-4 shadow-card"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-graphite-soft text-graphite">
                        <FileText aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div
                            role="heading"
                            aria-level={3}
                            className="truncate text-sm font-bold text-ink"
                          >
                            {document.title}
                          </div>
                          {adminMode && document.source === "upload" && (
                            <span className="rounded-full bg-action-soft px-2 py-0.5 text-xs font-bold text-action-strong">
                              {fr.knowledge.addedByInitiative}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-graphite">
                          {document.source === "upload" ? (
                            <UploadCloud
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          ) : (
                            <Cloud aria-hidden="true" className="size-3.5" />
                          )}
                          {document.source === "upload"
                            ? fr.knowledge.upload
                            : `${fr.knowledge.connector} ${connectorLabel(document.connectorKey)}`}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                          statusStyles[document.status],
                        )}
                      >
                        {document.status === "ready" && (
                          <Check aria-hidden="true" className="size-3.5" />
                        )}
                        {document.status === "processing" && (
                          <RefreshCw
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        )}
                        {(document.status === "error" ||
                          document.status === "outdated") && (
                          <AlertTriangle
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        )}
                        {statusLabels[document.status]}
                      </span>
                      <div className="mt-2 flex -space-x-2">
                        {document.usedByAgents.map((name) => {
                          const agent = suite.agents.find(
                            (item) => item.name === name,
                          )
                          return (
                            agent && (
                              <span
                                key={name}
                                className="rounded-lg ring-2 ring-surface"
                              >
                                <AgentAvatar agent={agent} size="sm" />
                              </span>
                            )
                          )
                        })}
                      </div>
                    </div>

                    <div className="text-xs text-graphite">
                      <p>
                        {fr.knowledge.updatedAt}
                        <br />
                        <strong className="text-ink">
                          {formatKnowledgeDate(document.updatedAt)}
                        </strong>
                      </p>
                      <p className="mt-2 flex items-start gap-1.5">
                        <Clock3
                          aria-hidden="true"
                          className="mt-0.5 size-3.5"
                        />
                        <span>
                          {fr.knowledge.reviewBefore}
                          <br />
                          <strong className="text-ink">
                            {formatKnowledgeDate(document.reviewBefore)}
                          </strong>
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" className="h-8 text-xs">
                        <RefreshCw aria-hidden="true" className="size-3.5" />
                        {fr.knowledge.replace}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 text-xs text-danger hover:bg-danger-soft hover:text-danger"
                        onClick={() =>
                          setItems((current) =>
                            current.filter((item) => item.id !== document.id),
                          )
                        }
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" />
                        {fr.knowledge.remove}
                      </Button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
