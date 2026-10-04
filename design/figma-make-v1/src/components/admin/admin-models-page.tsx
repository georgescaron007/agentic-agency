import { useState } from "react"
import {
  ArrowUpRight,
  Blocks,
  BriefcaseBusiness,
  Code2,
  FileText,
  Headphones,
  HeartHandshake,
  Settings2,
  Users,
} from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import NewSuiteWizard from "@/components/admin/new-suite-wizard"
import { ConnectorLogo } from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import {
  type ConnectorType,
  type KnowledgeDocument,
  type Suite,
  type Tenant,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import {
  modelConnectorKeys,
  modelRecommendedDocuments,
} from "@/lib/suite-models"

interface AdminModelsPageProps {
  models: Suite[]
  clientSuites: Suite[]
  tenants: Tenant[]
  connectorTypes: ConnectorType[]
  knowledge: KnowledgeDocument[]
}

function modelIcon(templateKey: string) {
  if (templateKey === "technique") return Code2
  if (templateKey === "commercial") return BriefcaseBusiness
  if (templateKey === "service_client") return Headphones
  if (templateKey === "rh") return HeartHandshake
  return Settings2
}

export default function AdminModelsPage({
  models,
  clientSuites,
  tenants,
  connectorTypes,
  knowledge,
}: AdminModelsPageProps) {
  const [wizardModel, setWizardModel] = useState<Suite>()
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
              {fr.admin.modelLibrary}
            </p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink">
              {fr.admin.modelsTitle}
            </h1>
            <p className="mt-2 text-sm text-graphite">
              {fr.admin.modelsDescription}
            </p>
          </div>
          <Button>
            <Blocks aria-hidden="true" className="size-4" />
            {fr.admin.newSuite}
          </Button>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-5">
          {models.map((model) => {
            const Icon = modelIcon(model.templateKey)
            const requiredConnectors = (
              modelConnectorKeys[model.templateKey] ?? []
            )
              .map((key) =>
                connectorTypes.find((connector) => connector.key === key),
              )
              .filter((connector) => connector !== undefined)
            const recommendedDocuments =
              modelRecommendedDocuments[model.templateKey] ?? []
            const clientCount = clientSuites.filter(
              (suite) => suite.templateKey === model.templateKey,
            ).length

            return (
              <article
                key={model.id}
                className="overflow-hidden rounded-lg border border-line bg-surface shadow-card"
              >
                <div className="flex items-start justify-between gap-5 border-b border-line p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-ink text-white">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-ink">
                        {model.name}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-graphite">
                        {model.templateKey}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-action-soft px-2.5 py-1 text-xs font-bold text-action-strong">
                    <Users aria-hidden="true" className="size-3.5" />
                    {clientCount} {fr.admin.clientCount}
                  </span>
                </div>

                <div className="p-5">
                  <p className="min-h-10 text-sm leading-6 text-graphite">
                    {model.welcomeMessage}
                  </p>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-graphite">
                      {model.agents.length} {fr.admin.agents}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {model.agents.map((agent) => (
                        <div
                          key={agent.name}
                          className="flex items-center gap-2 rounded-md border border-line bg-paper px-2.5 py-2"
                        >
                          <span className="flex size-7 items-center justify-center rounded-md bg-action-soft text-action-strong">
                            <Users aria-hidden="true" className="size-3.5" />
                          </span>
                          <p className="text-xs font-bold text-ink">
                            {agent.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-graphite">
                      {fr.admin.requiredConnectors}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {requiredConnectors.map((connector) => (
                        <div
                          key={connector.key}
                          className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5"
                        >
                          <ConnectorLogo connector={connector} size="sm" />
                          <span className="text-xs font-semibold text-ink">
                            {connector.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-graphite">
                      {fr.admin.recommendedDocuments}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recommendedDocuments.map((document) => (
                        <span
                          key={document}
                          className="flex items-center gap-1.5 rounded-md bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink"
                        >
                          <FileText
                            aria-hidden="true"
                            className="size-3.5 text-action"
                          />
                          {document}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <footer className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
                  <span className="font-mono text-xs text-graphite">
                    {model.id}
                  </span>
                  <Button
                    className="h-8 px-3 text-xs"
                    onClick={() => setWizardModel(model)}
                  >
                    {fr.admin.useModel}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Button>
                </footer>
              </article>
            )
          })}
        </section>
        {wizardModel && (
          <NewSuiteWizard
            initialModel={wizardModel}
            models={models}
            tenants={tenants}
            clientSuites={clientSuites}
            connectorTypes={connectorTypes}
            knowledge={knowledge}
            onClose={() => setWizardModel(undefined)}
          />
        )}
      </div>
    </AdminShell>
  )
}
