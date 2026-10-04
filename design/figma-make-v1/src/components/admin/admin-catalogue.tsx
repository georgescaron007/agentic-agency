import { useState } from "react"
import {
  Blocks,
  Cable,
  KeyRound,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { RiskBadge } from "@/components/foundations"
import { ConnectorLogo } from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import {
  type ConnectorCategory,
  type ConnectorType,
  type HarnessView,
  type Suite,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

interface AdminCatalogueProps {
  connectorTypes: ConnectorType[]
  models: Suite[]
  harness: HarnessView
}

const categoryLabels: Record<ConnectorCategory, string> = {
  crm: fr.connectors.crm,
  email: fr.connectors.email,
  calendar: fr.connectors.calendar,
  documents: fr.connectors.documents,
  helpdesk: fr.connectors.helpdesk,
  accounting: fr.connectors.accounting,
  code: fr.connectors.code,
  other: fr.connectors.other,
}

export default function AdminCatalogue({
  connectorTypes,
  models,
  harness,
}: AdminCatalogueProps) {
  const [tab, setTab] = useState<
    "connectors" | "tools" | "roles" | "profiles" | "guardrails" | "prompts"
  >("connectors")
  const tabs = [
    ["connectors", "Connecteurs", Cable],
    ["tools", fr.agentEditor.tools, Blocks],
    ["roles", fr.admin.agentRoles, Users],
    ["profiles", fr.admin.behaviorProfiles, UserRoundCog],
    ["guardrails", fr.admin.guardrailsCatalog, ShieldCheck],
    ["prompts", fr.admin.promptModels, KeyRound],
  ] as const
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.admin.catalog}
          </p>
          <div
            role="heading"
            aria-level={1}
            className="mt-1 font-heading text-3xl font-extrabold text-ink"
          >
            {fr.admin.catalog}
          </div>
        </header>
        <div className="mt-7 flex gap-1 border-b border-line">
          {tabs.map(([id, label, Icon]) => (
            <Button
              key={id}
              variant="ghost"
              className={cn(
                "relative h-11 rounded-none px-3 text-xs text-graphite",
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

        {tab === "connectors" && <section className="mt-6 grid grid-cols-2 gap-5">
          {connectorTypes.map((connector) => (
            <article
              key={connector.key}
              className="overflow-hidden rounded-lg border border-line bg-surface shadow-card"
            >
              <div className="flex items-start justify-between gap-4 border-b border-line p-5">
                <div className="flex items-start gap-3">
                  <ConnectorLogo connector={connector} />
                  <div>
                    <div
                      role="heading"
                      aria-level={2}
                      className="font-heading text-lg font-bold text-ink"
                    >
                      {connector.name}
                    </div>
                    <p className="mt-1 font-mono text-xs text-graphite">
                      {connector.key}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-graphite-soft px-2.5 py-1 text-xs font-bold text-graphite">
                  {categoryLabels[connector.category]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-md bg-paper p-3">
                  <p className="flex items-center gap-1.5 text-xs text-graphite">
                    <KeyRound aria-hidden="true" className="size-3.5" />
                    {fr.connectors.authMethod}
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">
                    {connector.authMethod === "oauth"
                      ? fr.connectors.oauth
                      : fr.connectors.apiKey}
                  </p>
                </div>
                <div className="rounded-md bg-paper p-3">
                  <p className="flex items-center gap-1.5 text-xs text-graphite">
                    <Users aria-hidden="true" className="size-3.5" />
                    {fr.connectors.defaultScope}
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">
                    {connector.defaultScope === "shared"
                      ? fr.connectors.shared
                      : fr.connectors.perUser}
                  </p>
                </div>
              </div>
              <div className="border-t border-line px-5 py-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-graphite">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  {fr.connectors.providedTools}
                </p>
                <div className="mt-3 space-y-2">
                  {connector.tools.map((tool) => (
                    <div
                      key={tool.key}
                      className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-bold text-ink">
                          {tool.label}
                        </p>
                        <code className="mt-0.5 block text-xs text-graphite">
                          {tool.key}
                        </code>
                      </div>
                      <RiskBadge risk={tool.risk} />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>}
        {tab === "roles" && (
          <section className="mt-6 grid grid-cols-2 gap-5">
            {models.map((model) => (
              <article key={model.id} className="rounded-lg border border-line bg-surface p-5 shadow-card">
                <p className="font-heading text-lg font-bold text-ink">{model.name}</p>
                <div className="mt-4 grid gap-2">
                  {model.agents.map((agent) => (
                    <p key={agent.name} className="rounded-md bg-paper p-3 text-sm font-semibold text-ink">{agent.role}</p>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}
        {tab === "profiles" && (
          <section className="mt-6 grid grid-cols-3 gap-4">
            {[
              [fr.agentEditor.autonomous, fr.agentEditor.autonomousDescription],
              [fr.agentEditor.supervised, fr.agentEditor.supervisedDescription],
              [fr.agentEditor.strict, fr.agentEditor.strictDescription],
            ].map(([label, description]) => (
              <article key={label} className="rounded-lg border border-line bg-surface p-5 shadow-card">
                <p className="font-heading text-lg font-bold text-ink">{label}</p>
                <p className="mt-2 text-sm leading-6 text-graphite">{description}</p>
              </article>
            ))}
          </section>
        )}
        {tab === "guardrails" && (
          <section className="mt-6 grid grid-cols-2 gap-4">
            {harness.guardrails.map((guardrail) => (
              <article key={guardrail.key} className="rounded-lg border border-line bg-surface p-5 shadow-card">
                <p className="text-sm font-bold text-ink">{guardrail.label}</p>
                <code className="mt-2 block text-xs text-graphite">{guardrail.key}</code>
              </article>
            ))}
          </section>
        )}
        {tab === "prompts" && (
          <section className="mt-6 grid grid-cols-2 gap-4">
            {models.map((model) => (
              <article key={model.id} className="rounded-lg border border-line bg-surface p-5 shadow-card">
                <p className="font-heading text-lg font-bold text-ink">{model.name}</p>
                <p className="mt-3 text-sm leading-6 text-graphite">{model.welcomeMessage}</p>
              </article>
            ))}
          </section>
        )}
        {tab === "tools" && (
          <section className="mt-6 rounded-lg border border-line bg-surface p-6 text-sm text-graphite shadow-card">
            {connectorTypes.flatMap((connector) => connector.tools).length}{" "}
            {fr.admin.toolsAvailable}
          </section>
        )}
      </div>
    </AdminShell>
  )
}
