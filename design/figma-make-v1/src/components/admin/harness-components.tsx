import { useState, type ReactNode } from "react"
import { AlertTriangle, Lock, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  type HarnessField,
  type InheritedFrom,
  type RiskClass,
  type ToolPolicy,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { adminValueLabel } from "@/lib/admin-labels"
import { cn } from "@/lib/utils"

const originLabels: Record<InheritedFrom, string> = {
  platform_profile: fr.agentEditor.originPlatform,
  tenant_profile: fr.agentEditor.originTenant,
  agent: fr.agentEditor.originAgent,
  team_member: fr.agentEditor.originTeamMember,
}

interface InheritedFieldProps<T> {
  label: string
  field: HarnessField<T>
  value?: ReactNode
}

export function InheritedField<T>({
  label,
  field,
  value,
}: InheritedFieldProps<T>) {
  const [restored, setRestored] = useState(false)
  const overridden = field.overridden && !restored
  const capExceeded =
    typeof field.value === "number" &&
    typeof field.cap === "number" &&
    field.value > field.cap

  return (
    <div
      className={cn(
        "rounded-md border bg-surface px-3 py-3",
        overridden ? "border-action/35" : "border-line",
        capExceeded && "border-danger/40 bg-danger-soft",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold text-ink">{label}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                overridden
                  ? "bg-action-soft text-action-strong"
                  : "bg-graphite-soft text-graphite",
              )}
            >
              {overridden
                ? fr.agentEditor.override
                : fr.agentEditor.inheritedValue}
            </span>
            {field.locked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      tabIndex={0}
                      className="text-graphite outline-none focus-visible:ring-2 focus-visible:ring-action"
                    >
                      <Lock aria-hidden="true" className="size-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{fr.agentEditor.locked}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="mt-2 text-sm font-bold text-ink">
            {value ?? adminValueLabel(field.value)}
          </div>
          <p className="mt-1 text-xs text-graphite">
            {originLabels[field.inheritedFrom]}
            {field.cap !== undefined &&
              ` · ${fr.admin.limits} ${adminValueLabel(field.cap)}`}
          </p>
        </div>
        {overridden && !field.locked && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-graphite"
            onClick={() => setRestored(true)}
            aria-label={fr.agentEditor.restoreInherited}
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
          </Button>
        )}
      </div>
      {capExceeded && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-danger">
          <AlertTriangle aria-hidden="true" className="size-3.5" />
          {fr.agentEditor.capExceeded}
        </p>
      )}
    </div>
  )
}

interface AutonomyMatrixProps {
  policies: Record<RiskClass, HarnessField<ToolPolicy>>
}

const risks: RiskClass[] = [
  "read",
  "write_internal",
  "write_external",
  "irreversible",
]

const policies: ToolPolicy[] = ["auto", "ask", "forbid"]

const policyLabels: Record<ToolPolicy, string> = {
  auto: fr.agentEditor.automatic,
  ask: fr.agentEditor.ask,
  forbid: fr.agentEditor.forbid,
}

export function AutonomyMatrix({ policies: initial }: AutonomyMatrixProps) {
  const [selected, setSelected] = useState<Record<RiskClass, ToolPolicy>>({
    read: initial.read.value,
    write_internal: initial.write_internal.value,
    write_external: initial.write_external.value,
    irreversible: initial.irreversible.value,
  })

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] border-b border-line bg-paper">
        <div className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-graphite">
          {fr.agentEditor.riskPolicy}
        </div>
        {policies.map((policy) => (
          <div
            key={policy}
            className="border-l border-line px-2 py-2.5 text-center text-xs font-bold text-graphite"
          >
            {policyLabels[policy]}
          </div>
        ))}
      </div>
      {risks.map((risk) => (
        <div
          key={risk}
          className="grid grid-cols-[1.4fr_repeat(3,1fr)] border-b border-line last:border-b-0"
        >
          <div className="flex items-center px-3 py-3 text-xs font-semibold text-ink">
            {fr.risks[risk].label}
          </div>
          {policies.map((policy) => {
            const platformLocked =
              risk === "irreversible" && policy === "auto"
            const active = selected[risk] === policy
            const cell = (
              <Button
                variant="ghost"
                className={cn(
                  "h-full min-h-12 w-full rounded-none border-l border-line",
                  active && "bg-action-soft text-action-strong",
                  platformLocked &&
                    "cursor-not-allowed bg-graphite-soft text-graphite",
                )}
                aria-disabled={platformLocked}
                onClick={() => {
                  if (platformLocked) return
                  setSelected((current) => ({
                    ...current,
                    [risk]: policy,
                  }))
                }}
              >
                {platformLocked ? (
                  <Lock aria-hidden="true" className="size-4" />
                ) : (
                  <span
                    className={cn(
                      "size-3 rounded-full border-2",
                      active
                        ? "border-action bg-action"
                        : "border-graphite/40",
                    )}
                  />
                )}
              </Button>
            )

            return platformLocked ? (
              <TooltipProvider key={policy}>
                <Tooltip>
                  <TooltipTrigger asChild>{cell}</TooltipTrigger>
                  <TooltipContent>
                    {fr.agentEditor.platformAuthorizationRequired}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div key={policy}>{cell}</div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
