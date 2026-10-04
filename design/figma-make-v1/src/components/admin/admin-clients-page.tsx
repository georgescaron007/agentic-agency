import { useMemo, useState } from "react"
import { ChevronRight, Plus, Search, SlidersHorizontal } from "lucide-react"

import AdminShell from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type Suite,
  type Tenant,
  type TenantStatus,
  type UsageSummary,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { planDetails } from "@/lib/plans"
import { cn } from "@/lib/utils"

interface AdminClientsPageProps {
  tenants: Tenant[]
  suites: Suite[]
  users: User[]
  usage: UsageSummary[]
}

const statusLabels: Record<TenantStatus, string> = {
  active: fr.admin.active,
  trial: fr.admin.trial,
  suspended: fr.admin.suspended,
}

const statusStyles: Record<TenantStatus, string> = {
  active: "bg-teal-soft text-teal-strong",
  trial: "bg-action-soft text-action-strong",
  suspended: "bg-danger-soft text-danger",
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function AdminClientsPage({
  tenants,
  suites,
  users,
  usage,
}: AdminClientsPageProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<TenantStatus | "all">("all")
  const filteredTenants = useMemo(
    () =>
      tenants.filter(
        (tenant) =>
          (status === "all" || tenant.status === status) &&
          tenant.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, status, tenants],
  )

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
              {fr.admin.clients}
            </p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink">
              {fr.admin.clientsTitle}
            </h1>
            <p className="mt-2 text-sm text-graphite">
              {fr.admin.clientsDescription}
            </p>
          </div>
          <Button>
            <Plus aria-hidden="true" className="size-4" />
            {fr.admin.newClient}
          </Button>
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
                placeholder={fr.admin.searchClient}
                className="h-9 bg-surface pl-9"
              />
            </div>
            <SlidersHorizontal
              aria-hidden="true"
              className="size-4 text-graphite"
            />
            {(["all", "active", "trial", "suspended"] as const).map(
              (value) => (
                <Button
                  key={value}
                  variant={status === value ? "default" : "outline"}
                  className="h-8 px-3 text-xs"
                  onClick={() => setStatus(value)}
                >
                  {value === "all"
                    ? fr.admin.allStatuses
                    : statusLabels[value]}
                </Button>
              ),
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-surface text-graphite">
                  {[
                    fr.admin.name,
                    fr.admin.plan,
                    fr.admin.users,
                    fr.admin.suites,
                    fr.admin.credits,
                    fr.admin.realCost,
                    fr.admin.status,
                    fr.admin.lastActivity,
                    "",
                  ].map((label, index) => (
                    <th
                      key={`${label}-${index}`}
                      className="whitespace-nowrap px-4 py-3 font-bold uppercase tracking-wide"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => {
                  const plan = planDetails[tenant.plan]
                  const tenantUsers = users.filter(
                    (user) => user.tenantId === tenant.id && user.active,
                  )
                  const tenantSuites = suites.filter(
                    (suite) => suite.tenantId === tenant.id,
                  )
                  const tenantUsage = usage.find(
                    (item) => item.tenantId === tenant.id,
                  )
                  const creditRatio = tenantUsage
                    ? tenantUsage.creditsUsed / tenantUsage.creditsIncluded
                    : 0
                  const lastActivity = [...tenantSuites].sort(
                    (a, b) =>
                      new Date(b.lastActivityAt).getTime() -
                      new Date(a.lastActivityAt).getTime(),
                  )[0]?.lastActivityAt

                  return (
                    <tr
                      key={tenant.id}
                      className="cursor-pointer border-b border-line transition last:border-b-0 hover:bg-paper"
                      onClick={() =>
                        window.location.assign(`/admin/clients/${tenant.id}`)
                      }
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-md bg-brand-ink font-heading text-xs font-bold text-white">
                            {tenant.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                          <span className="whitespace-nowrap font-bold text-ink">
                            {tenant.name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-ink">
                        <span className="block">
                          {tenant.plan === "business"
                            ? fr.admin.business
                            : fr.admin.smallTeam}
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-graphite">
                          {plan.monthlyPriceEur} € / mois
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-graphite">
                        <strong className="text-ink">
                          {tenantUsers.length}
                        </strong>{" "}
                        / {tenant.maxUsers}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-ink">
                        {tenantSuites.length}
                      </td>
                      <td className="min-w-36 px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                creditRatio >= 1
                                  ? "w-full bg-danger"
                                  : creditRatio >= 0.8
                                    ? "w-4/5 bg-waiting"
                                    : creditRatio >= 0.5
                                      ? "w-1/2 bg-teal"
                                      : "w-1/4 bg-teal",
                              )}
                            />
                          </div>
                          <span className="w-9 text-right font-mono text-graphite">
                            {Math.round(creditRatio * 100)} %
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-ink">
                        {formatEuro(tenantUsage?.realCostEur ?? 0)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 font-bold",
                            statusStyles[tenant.status],
                          )}
                        >
                          {statusLabels[tenant.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-graphite">
                        {formatDate(lastActivity)}
                      </td>
                      <td className="px-3 py-3.5">
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 text-graphite"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <p className="p-10 text-center text-sm text-graphite">
              {fr.admin.noResults}
            </p>
          )}
        </section>
      </div>
    </AdminShell>
  )
}
