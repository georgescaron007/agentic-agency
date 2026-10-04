import { ArrowLeft, AlertTriangle, Send, ShieldAlert } from "lucide-react"
import { useState } from "react"

import AdminShell from "@/components/admin/admin-shell"
import VersionDiff from "@/components/admin/version-diff"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  type HarnessView,
  type Suite,
  type SuiteVersion,
  type Tenant,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"

interface AdminPublicationProps {
  tenant: Tenant
  suite: Suite
  versions: SuiteVersion[]
  harness: HarnessView
}

export default function AdminPublication({
  tenant,
  suite,
  versions,
  harness,
}: AdminPublicationProps) {
  const [notes, setNotes] = useState("")
  const published = versions.find((version) => version.status === "published")
  const draft = versions.find((version) => version.status === "draft")
  const changeCount = 8

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl p-6 lg:p-8">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="mt-1 size-9"
              onClick={() =>
                window.location.assign(
                  `/admin/clients/${tenant.id}/suites/${suite.id}`,
                )
              }
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
                {tenant.name} · {suite.name}
              </p>
              <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink">
                {fr.publication.title}
              </h1>
              <p className="mt-2 text-sm text-graphite">
                {fr.publication.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-card">
            <div className="text-right">
              <p className="text-xs text-graphite">
                {fr.publication.publishedVersion}
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-ink">
                v{published?.version ?? "—"}
              </p>
            </div>
            <span className="text-graphite">→</span>
            <div>
              <p className="text-xs text-graphite">
                {fr.publication.draftVersion}
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-action-strong">
                v{draft?.version ?? (published?.version ?? 0) + 1}
              </p>
            </div>
            <span className="rounded-full bg-action-soft px-2 py-1 text-xs font-bold text-action-strong">
              {changeCount} {fr.publication.changes}
            </span>
          </div>
        </header>

        <div className="mt-7 grid grid-cols-[1fr_22rem] gap-5">
          <VersionDiff suite={suite} harness={harness} />

          <aside className="sticky top-24 h-fit space-y-4">
            <section className="rounded-lg border border-danger/25 bg-danger-soft p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert aria-hidden="true" className="size-5 text-danger" />
                <h2 className="font-heading text-base font-bold text-danger">
                  {fr.publication.warnings}
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  fr.publication.irreversibleWarning,
                  fr.publication.externalWarning,
                ].map((warning) => (
                  <p
                    key={warning}
                    className="flex items-start gap-2 text-xs leading-5 text-ink"
                  >
                    <AlertTriangle
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-danger"
                    />
                    {warning}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-surface p-4 shadow-card">
              <label className="text-xs font-bold uppercase tracking-wider text-graphite">
                {fr.publication.releaseNotes}
              </label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={fr.publication.releaseNotesPlaceholder}
                className="mt-3 min-h-36"
              />
              <p className="mt-4 flex items-start gap-2 rounded-md bg-teal-soft p-3 text-xs leading-5 text-teal-strong">
                <Send
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                {fr.publication.nextTurn}
              </p>
              <Button className="mt-4 w-full" disabled={!notes.trim()}>
                <Send aria-hidden="true" className="size-4" />
                {fr.publication.publish}
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
