import { useMemo, useState } from "react"
import {
  FileClock,
  Filter,
  Search,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type ActivityEvent, type Suite } from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

interface AdminAuditProps {
  events: ActivityEvent[]
  suites: Suite[]
}

function auditCategory(type: string) {
  if (type.startsWith("suite")) return fr.auditPage.publication
  if (type.startsWith("support")) return fr.auditPage.supportAccess
  if (type.startsWith("guardrail")) return fr.auditPage.guardrail
  return fr.auditPage.configuration
}

function categoryTone(type: string) {
  if (type.startsWith("support")) return "bg-waiting-soft text-waiting-strong"
  if (type.startsWith("suite")) return "bg-teal-soft text-teal-strong"
  if (type.startsWith("guardrail")) return "bg-danger-soft text-danger"
  return "bg-action-soft text-action-strong"
}

function formatAuditDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))
}

export default function AdminAudit({ events, suites }: AdminAuditProps) {
  const [search, setSearch] = useState("")
  const [actor, setActor] = useState("all")
  const [category, setCategory] = useState("all")
  const actors = Array.from(new Set(events.map((event) => event.actor)))
  const categories = Array.from(
    new Set(events.map((event) => auditCategory(event.type))),
  )
  const filtered = useMemo(
    () =>
      events.filter(
        (event) =>
          (actor === "all" || event.actor === actor) &&
          (category === "all" || auditCategory(event.type) === category) &&
          `${event.actor} ${event.summary} ${event.type}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [actor, category, events, search],
  )

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.admin.auditLog}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink">
            {fr.auditPage.title}
          </h1>
          <p className="mt-2 text-sm text-graphite">
            {fr.auditPage.description}
          </p>
        </header>

        <section className="mt-7 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
            <div className="relative max-w-sm flex-1">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={fr.admin.search}
                className="h-9 bg-surface pl-9"
              />
            </div>
            <Filter aria-hidden="true" className="size-4 text-graphite" />
            <Button
              variant={actor === "all" ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setActor("all")}
            >
              {fr.auditPage.allActors}
            </Button>
            {actors.map((item) => (
              <Button
                key={item}
                variant={actor === item ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setActor(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 border-b border-line px-4 py-3">
            <Button
              variant={category === "all" ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setCategory("all")}
            >
              {fr.auditPage.allChanges}
            </Button>
            {categories.map((item) => (
              <Button
                key={item}
                variant={category === item ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setCategory(item)}
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-[0.75fr_0.85fr_1.55fr_0.7fr_1.15fr] border-b border-line bg-surface px-5 py-3 text-xs font-bold uppercase tracking-wide text-graphite">
            <span>{fr.auditPage.actor}</span>
            <span>{fr.auditPage.change}</span>
            <span>{fr.auditPage.target}</span>
            <span>{fr.auditPage.date}</span>
            <span>{fr.auditPage.reason}</span>
          </div>
          <div className="divide-y divide-line">
            {filtered.map((event) => {
              const [change, reason] = event.summary.split(" — ")
              const suite = suites.find(
                (candidate) => candidate.id === event.teamId,
              )
              return (
                <article
                  key={event.seq}
                  className="grid grid-cols-[0.75fr_0.85fr_1.55fr_0.7fr_1.15fr] items-start gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-brand-ink text-white">
                      <UserRoundCog aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">
                        {event.actor}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-graphite">
                        #{event.seq}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-bold",
                        categoryTone(event.type),
                      )}
                    >
                      {auditCategory(event.type)}
                    </span>
                    <code className="mt-1.5 block text-xs text-graphite">
                      {event.type}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-5 text-ink">
                      {change}
                    </p>
                    <p className="mt-1 font-mono text-xs text-graphite">
                      {suite?.name ?? event.teamId}
                    </p>
                  </div>
                  <p className="text-xs leading-5 text-graphite">
                    {formatAuditDate(event.createdAt)}
                  </p>
                  <p className="text-xs leading-5 text-graphite">
                    {reason ?? fr.suiteEditor.noNotes}
                  </p>
                </article>
              )
            })}
          </div>

          <footer className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
            <span className="flex items-center gap-2 text-xs text-graphite">
              <ShieldCheck
                aria-hidden="true"
                className="size-4 text-teal-strong"
              />
              {filtered.length} {fr.teamJournal.events}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-graphite">
              <FileClock aria-hidden="true" className="size-4" />
              immutable_log_v1
            </span>
          </footer>
        </section>
      </div>
    </AdminShell>
  )
}
