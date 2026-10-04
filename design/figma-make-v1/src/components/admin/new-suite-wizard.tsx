import { useState } from "react"
import { Check, ChevronLeft, ChevronRight, FileText, X } from "lucide-react"

import { ConnectorLogo } from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"

interface NewSuiteWizardProps {
  initialModel: Suite
  models: Suite[]
  tenants: Tenant[]
  clientSuites: Suite[]
  connectorTypes: ConnectorType[]
  knowledge: KnowledgeDocument[]
  onClose: () => void
}

export default function NewSuiteWizard({
  initialModel,
  models,
  tenants,
  clientSuites,
  connectorTypes,
  knowledge,
  onClose,
}: NewSuiteWizardProps) {
  const [step, setStep] = useState(1)
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "")
  const [modelId, setModelId] = useState(initialModel.id)
  const [names, setNames] = useState<Record<string, string>>({})
  const [naming, setNaming] = useState<"first_name_and_role" | "role_only">(
    "first_name_and_role",
  )
  const model = models.find((item) => item.id === modelId) ?? initialModel
  const connectorKeys = modelConnectorKeys[model.templateKey] ?? []
  const documents = modelRecommendedDocuments[model.templateKey] ?? []

  function finish() {
    const target =
      clientSuites.find(
        (suite) =>
          suite.tenantId === tenantId &&
          suite.templateKey === model.templateKey,
      ) ??
      clientSuites.find((suite) => suite.tenantId === tenantId) ??
      clientSuites[0]
    if (target) {
      const query = new URLSearchParams({
        draft: "1",
        model: model.id,
        names: model.agents
          .map((agent) => names[agent.name]?.trim() ?? "")
          .join("|"),
        naming,
      })
      window.location.assign(
        `/admin/clients/${target.tenantId}/suites/${target.id}?${query.toString()}`,
      )
    }
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-brand-ink/55 p-6 backdrop-blur-sm">
      <section
        className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={fr.suiteWizard.title}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
              {fr.suiteWizard.step} {step} / 4
            </p>
            <div
              role="heading"
              aria-level={2}
              className="mt-1 font-heading text-xl font-bold text-ink"
            >
              {fr.suiteWizard.title}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-graphite">
                  {fr.suiteWizard.client}
                </p>
                <div className="grid gap-2">
                  {tenants.map((tenant) => (
                    <Button
                      key={tenant.id}
                      variant="outline"
                      className={cn(
                        "justify-start",
                        tenantId === tenant.id &&
                          "border-action bg-action-soft",
                      )}
                      onClick={() => setTenantId(tenant.id)}
                    >
                      {tenantId === tenant.id && (
                        <Check aria-hidden="true" className="size-4" />
                      )}
                      {tenant.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-graphite">
                  {fr.suiteWizard.model}
                </p>
                <div className="grid gap-2">
                  {models.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className={cn(
                        "justify-start",
                        modelId === item.id && "border-action bg-action-soft",
                      )}
                      onClick={() => setModelId(item.id)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              {model.agents.map((agent) => (
                <div
                  key={agent.name}
                  className="grid grid-cols-[1fr_1fr] items-center gap-4 rounded-lg border border-line p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-ink">{agent.role}</p>
                    <code className="mt-1 block text-xs text-graphite">
                      {agent.name}
                    </code>
                  </div>
                  <Input
                    value={names[agent.name] ?? ""}
                    onChange={(event) =>
                      setNames((current) => ({
                        ...current,
                        [agent.name]: event.target.value,
                      }))
                    }
                    placeholder={fr.suiteWizard.firstNamePlaceholder}
                  />
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-graphite">
                  {fr.admin.requiredConnectors}
                </p>
                <div className="grid gap-3">
                  {connectorKeys.map((key) => {
                    const connector = connectorTypes.find(
                      (item) => item.key === key,
                    )
                    return (
                      connector && (
                        <div
                          key={key}
                          className="flex items-center gap-3 rounded-lg border border-line p-3"
                        >
                          <ConnectorLogo connector={connector} size="sm" />
                          <span className="flex-1 text-sm font-bold text-ink">
                            {connector.name}
                          </span>
                          <Button variant="outline" className="h-8 text-xs">
                            {fr.connectors.sendInvite}
                          </Button>
                        </div>
                      )
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-graphite">
                  {fr.suiteWizard.requiredDocuments}
                </p>
                <div className="grid gap-2">
                  {documents.map((document) => (
                    <div
                      key={document}
                      className="flex items-center gap-2 rounded-md bg-paper p-3 text-sm font-semibold text-ink"
                    >
                      <FileText
                        aria-hidden="true"
                        className="size-4 text-action"
                      />
                      {document}
                    </div>
                  ))}
                  {knowledge.slice(0, 2).map((document) => (
                    <p key={document.id} className="text-xs text-graphite">
                      {fr.suiteWizard.available}: {document.title}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-graphite">
                {fr.suiteWizard.clientInterface}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["first_name_and_role", fr.settingsPage.firstNameAndRole],
                  ["role_only", fr.settingsPage.roleOnly],
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    variant="outline"
                    className={cn(
                      "h-auto justify-start p-4",
                      naming === value && "border-action bg-action-soft",
                    )}
                    onClick={() =>
                      setNaming(
                        value as "first_name_and_role" | "role_only",
                      )
                    }
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between border-t border-line bg-paper px-6 py-4">
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            {fr.suiteWizard.previous}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep((current) => current + 1)}>
              {fr.suiteWizard.next}
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish}>{fr.suiteWizard.createDraft}</Button>
          )}
        </div>
      </section>
    </div>
  )
}
