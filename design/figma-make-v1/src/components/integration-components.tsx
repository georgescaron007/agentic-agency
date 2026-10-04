import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  Cloud,
  Code2,
  FileText,
  Headphones,
  Mail,
  RefreshCw,
  Unplug,
  WalletCards,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  type Connection,
  type ConnectionStatus,
  type ConnectorCategory,
  type ConnectorType,
  type UserRole,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

const categoryIcons: Record<ConnectorCategory, LucideIcon> = {
  crm: Building2,
  email: Mail,
  calendar: CalendarDays,
  documents: FileText,
  helpdesk: Headphones,
  accounting: WalletCards,
  code: Code2,
  other: Cloud,
}

const statusLabels: Record<ConnectionStatus, string> = {
  not_connected: fr.connectors.notConnected,
  pending_invite: fr.connectors.pendingInvite,
  connected: fr.connectors.connected,
  expired: fr.connectors.expired,
  error: fr.connectors.error,
}

const statusStyles: Record<ConnectionStatus, string> = {
  not_connected: "bg-graphite-soft text-graphite",
  pending_invite: "bg-waiting-soft text-waiting-strong",
  connected: "bg-teal-soft text-teal-strong",
  expired: "bg-external-soft text-external-strong",
  error: "bg-danger-soft text-danger",
}

export function ConnectorLogo({
  connector,
  size = "md",
}: {
  connector: ConnectorType
  size?: "sm" | "md" | "lg"
}) {
  const Icon = categoryIcons[connector.category]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-brand-ink text-white shadow-sm",
        size === "sm" && "size-8",
        size === "md" && "size-11",
        size === "lg" && "size-14",
      )}
    >
      {connector.logoUrl ? (
        <img
          src={connector.logoUrl}
          alt=""
          className="size-3/4 object-contain"
        />
      ) : (
        <Icon
          aria-hidden="true"
          className={cn(
            size === "sm" && "size-4",
            size === "md" && "size-5",
            size === "lg" && "size-6",
          )}
        />
      )}
    </span>
  )
}

export function ConnectionStatusBadge({
  status,
}: {
  status: ConnectionStatus
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        statusStyles[status],
      )}
    >
      {status === "connected" && (
        <Check aria-hidden="true" className="size-3.5" />
      )}
      {status === "pending_invite" && (
        <RefreshCw aria-hidden="true" className="size-3.5" />
      )}
      {(status === "expired" || status === "error") && (
        <AlertTriangle aria-hidden="true" className="size-3.5" />
      )}
      {status === "not_connected" && (
        <Unplug aria-hidden="true" className="size-3.5" />
      )}
      {statusLabels[status]}
    </span>
  )
}

export function ConnectorConnectionSummary({
  connector,
  connections,
  users,
}: {
  connector: ConnectorType
  connections: Connection[]
  users: User[]
}) {
  if (connector.defaultScope !== "per_user") {
    return (
      <ConnectionStatusBadge
        status={connections[0]?.status ?? "not_connected"}
      />
    )
  }

  const connected = users.filter((user) =>
    connections.some(
      (connection) =>
        connection.ownerUserId === user.id &&
        connection.status === "connected",
    ),
  ).length

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-waiting-soft px-2.5 py-1 text-xs font-bold text-waiting-strong">
      <RefreshCw aria-hidden="true" className="size-3.5" />
      {connected} sur {users.length} {fr.connectors.connectedPlural}
    </span>
  )
}

interface ConnectionRequiredCardProps {
  connection: Connection
  connector: ConnectorType
  userRole: UserRole
  compact?: boolean
}

export function ConnectionRequiredCard({
  connection,
  connector,
  userRole,
  compact = false,
}: ConnectionRequiredCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-external/30 bg-external-soft p-4",
        !compact && "shadow-card",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-external text-white">
            <CircleAlert aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-external-strong">
              {fr.connectors.requiredConnection}
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink">
              {fr.connectors.connectionExpired}
            </p>
            <p className="mt-1 text-xs text-graphite">
              {connector.name} · {connection.accountLabel}
            </p>
          </div>
        </div>
        <Button className="shrink-0">
          <RefreshCw aria-hidden="true" className="size-4" />
          {userRole === "owner"
            ? fr.connectors.reconnect
            : fr.connectors.notifyOwner}
        </Button>
      </div>
    </article>
  )
}
