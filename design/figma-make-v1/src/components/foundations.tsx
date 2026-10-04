import {
  BarChart3,
  CirclePause,
  Clock3,
  FileSearch,
  MessageSquareText,
  PenLine,
  TriangleAlert,
  UserRound,
  XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  agentLabel,
  type Agent,
  type AgentNaming,
  type AgentStatus,
  type RiskClass,
  type UsageSummary,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const statusStyles: Record<AgentStatus, {
  dot: string
  badge: string
  icon: LucideIcon
}> = {
  working: {
    dot: "bg-teal ring-teal-soft",
    badge: "border-teal/25 bg-teal-soft text-teal-strong",
    icon: Clock3,
  },
  waiting_human: {
    dot: "bg-waiting ring-waiting-soft",
    badge: "border-waiting/30 bg-waiting-soft text-waiting-strong",
    icon: MessageSquareText,
  },
  waiting_connection: {
    dot: "bg-waiting ring-waiting-soft",
    badge: "border-waiting/30 bg-waiting-soft text-waiting-strong",
    icon: TriangleAlert,
  },
  idle: {
    dot: "bg-graphite ring-graphite-soft",
    badge: "border-line bg-muted text-graphite",
    icon: Clock3,
  },
  paused: {
    dot: "bg-action ring-action-soft",
    badge: "border-action/25 bg-action-soft text-action-strong",
    icon: CirclePause,
  },
  error: {
    dot: "bg-danger ring-danger-soft",
    badge: "border-danger/25 bg-danger-soft text-danger",
    icon: XCircle,
  },
}

const avatarTones: Record<string, string> = {
  coordination: "bg-ink",
  redaction: "bg-teal",
  crm: "bg-action",
  qualification: "bg-graphite",
  analyse: "bg-ink",
}

const roleIcons: Record<string, LucideIcon> = {
  coordination: MessageSquareText,
  redaction: PenLine,
  crm: BarChart3,
  qualification: FileSearch,
  analyse: BarChart3,
}

function StatusDot({ status }: { status: AgentStatus }) {
  return (
    <span
      aria-label={fr.statuses[status]}
      className={cn(
        "absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-surface ring-2",
        statusStyles[status].dot,
        status === "working" && "animate-status-pulse",
      )}
    />
  )
}

interface AgentAvatarProps {
  agent: Agent
  size?: "sm" | "md" | "lg"
}

export function AgentAvatar({ agent, size = "md" }: AgentAvatarProps) {
  const RoleIcon = roleIcons[agent.cardKey] ?? BarChart3
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
        avatarTones[agent.cardKey] ?? "bg-ink",
        size === "sm" && "size-8",
        size === "md" && "size-11",
        size === "lg" && "size-14",
      )}
    >
      <RoleIcon
        aria-hidden="true"
        className={cn(
          size === "sm" && "size-4",
          size === "md" && "size-5",
          size === "lg" && "size-6",
        )}
        strokeWidth={1.8}
      />
      <StatusDot status={agent.status} />
    </span>
  )
}

interface HumanAvatarProps {
  user: User
  status: AgentStatus
  size?: "sm" | "md" | "lg"
}

export function HumanAvatar({ user, status, size = "md" }: HumanAvatarProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

  return (
    <span
      aria-label={user.name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-ink-soft font-bold text-paper shadow-sm",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-11 text-sm",
        size === "lg" && "size-14 text-base",
      )}
    >
      {initials || <UserRound aria-hidden="true" className="size-5" />}
      <StatusDot status={status} />
    </span>
  )
}

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const Icon = statusStyles[status].icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold",
        statusStyles[status].badge,
      )}
    >
      <span className="relative flex size-2">
        {status === "working" && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-50" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            statusStyles[status].dot.split(" ")[0],
          )}
        />
      </span>
      <Icon aria-hidden="true" className="size-4" />
      {fr.statuses[status]}
      {status === "waiting_connection" && (
        <span className="border-l border-waiting/30 pl-2 text-action-strong">
          {fr.connectors.connectGmail}
        </span>
      )}
    </span>
  )
}

const riskStyles: Record<RiskClass, string> = {
  read: "border-graphite/25 bg-graphite-soft text-graphite",
  write_internal: "border-action/25 bg-action-soft text-action-strong",
  write_external: "border-external/25 bg-external-soft text-external-strong",
  irreversible: "border-danger/25 bg-danger-soft text-danger",
}

const riskIcons: Record<RiskClass, LucideIcon> = {
  read: FileSearch,
  write_internal: PenLine,
  write_external: TriangleAlert,
  irreversible: TriangleAlert,
}

export function RiskBadge({ risk }: { risk: RiskClass }) {
  const Icon = riskIcons[risk]
  const content = fr.risks[risk]
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className={cn(
              "inline-flex cursor-help items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-action",
              riskStyles[risk],
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {content.label}
          </span>
        </TooltipTrigger>
        <TooltipContent>{content.description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function formatCredits(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function CreditsGauge({ usage }: { usage: UsageSummary }) {
  const ratio = usage.creditsUsed / usage.creditsIncluded
  const projectedRatio = Math.min(
    usage.projectedEndOfMonth / usage.creditsIncluded,
    1,
  )
  const widthClass =
    ratio >= 1
      ? "w-full"
      : ratio >= 0.8
        ? "w-4/5"
        : ratio >= 0.7
          ? "w-[72%]"
          : "w-1/2"
  const projectionClass =
    projectedRatio >= 1
      ? "left-full"
      : projectedRatio >= 0.9
        ? "left-[93%]"
        : projectedRatio >= 0.8
          ? "left-4/5"
          : "left-3/4"
  const exceeded = ratio > 1

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-graphite">
            {exceeded ? fr.common.overage : fr.common.withinPlan}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-ink">
            {formatCredits(usage.creditsUsed)}
            <span className="ml-1.5 text-sm font-medium text-graphite">
              / {formatCredits(usage.creditsIncluded)} {fr.common.credits}
            </span>
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-xs font-bold",
            exceeded
              ? "bg-danger-soft text-danger"
              : ratio >= 0.8
                ? "bg-waiting-soft text-waiting-strong"
                : "bg-teal-soft text-teal-strong",
          )}
        >
          {Math.round(ratio * 100)} %
        </span>
      </div>

      <div className="mt-5">
        <div className="relative h-3 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              widthClass,
              exceeded ? "bg-danger" : ratio >= 0.8 ? "bg-waiting" : "bg-teal",
            )}
          />
          <span
            className="absolute left-4/5 top-1/2 h-5 w-px -translate-y-1/2 bg-ink/45"
            aria-hidden="true"
          />
          <span
            className={cn(
              "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-surface bg-ink",
              projectionClass,
            )}
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 flex items-start justify-between gap-4 text-xs text-graphite">
          <span>
            {fr.common.threshold} <strong className="text-ink">80 %</strong>
          </span>
          {usage.realCostEur !== undefined && (
            <span>
              {fr.common.realCost}{" "}
              <strong className="text-ink">
                {new Intl.NumberFormat("fr-BE", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(usage.realCostEur)}
              </strong>
            </span>
          )}
          <span className="text-right">
            {fr.common.projection}{" "}
            <strong className="text-ink">
              {formatCredits(usage.projectedEndOfMonth)}
            </strong>
          </span>
        </div>
      </div>
    </section>
  )
}

export function IdentityRow({
  agent,
  naming,
}: {
  agent: Agent
  naming: AgentNaming
}) {
  return (
    <div className="flex items-center gap-3">
      <AgentAvatar agent={agent} />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink">
          {agentLabel(agent, naming)}
        </p>
        <p className="mt-0.5 text-xs font-medium text-graphite">
          {fr.common.agent}
        </p>
      </div>
    </div>
  )
}
