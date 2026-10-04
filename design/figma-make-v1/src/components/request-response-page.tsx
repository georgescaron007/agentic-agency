import { useState } from "react"
import {
  Check,
  Clock3,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import HumanRequestCard from "@/components/human-request-card"
import { Button } from "@/components/ui/button"
import {
  type Decision,
  type Connection,
  type ConnectorType,
  type HumanRequest,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"

type LinkState = "active" | "expired" | "answered" | "cancelled"

interface RequestResponsePageProps {
  request: HumanRequest
  suite: Suite
  users: User[]
  linkState: LinkState
  connectorTypes: ConnectorType[]
  connections: Connection[]
}

function ClientMark({ suite }: { suite: Suite }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-teal font-heading text-sm font-extrabold text-white">
        {suite.branding.clientName
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)}
      </span>
      <span className="font-heading text-sm font-bold text-ink">
        {suite.branding.clientName}
      </span>
    </div>
  )
}

function LinkStateCard({
  state,
  request,
  users,
}: {
  state: Exclude<LinkState, "active">
  request: HumanRequest
  users: User[]
}) {
  const resolvedBy = users.find((user) => user.id === request.resolvedBy)
  const isExpired = state === "expired"
  const isAnswered = state === "answered"

  return (
    <div className="rounded-lg border border-line bg-surface p-7 text-center shadow-card">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-graphite-soft text-graphite">
        {isExpired ? (
          <Clock3 aria-hidden="true" className="size-6" />
        ) : isAnswered ? (
          <Check aria-hidden="true" className="size-6 text-teal-strong" />
        ) : (
          <XCircle aria-hidden="true" className="size-6" />
        )}
      </span>
      <h1 className="mt-5 font-heading text-2xl font-bold text-ink">
        {isExpired
          ? fr.responsePage.expiredTitle
          : isAnswered
            ? fr.responsePage.alreadyAnsweredTitle
            : fr.responsePage.cancelledTitle}
      </h1>
      <p className="mt-3 text-sm leading-6 text-graphite">
        {isExpired
          ? fr.responsePage.expiredDescription
          : isAnswered
            ? `${fr.humanRequest.answeredBy} ${
                resolvedBy?.name ?? users[0]?.name
              } ${fr.humanRequest.at} 3 octobre à 16:42.`
            : fr.humanRequest.cancelledDescription}
      </p>
      <Button variant="outline" className="mt-6">
        {fr.responsePage.openWorkspace}
        <ExternalLink aria-hidden="true" className="size-4" />
      </Button>
    </div>
  )
}

export default function RequestResponsePage({
  request,
  suite,
  users,
  linkState,
  connectorTypes,
  connections,
}: RequestResponsePageProps) {
  const [resolved, setResolved] = useState(false)

  return (
    <main className="min-h-screen bg-paper px-4 py-5 text-ink sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-4">
          <ClientMark suite={suite} />
          <span className="flex items-center gap-1.5 text-xs font-medium text-graphite">
            <ShieldCheck aria-hidden="true" className="size-4 text-teal-strong" />
            {fr.responsePage.secureLink}
          </span>
        </header>

        <div className="pb-7 pt-10 text-center sm:pt-14">
          <p className="text-sm text-graphite">{fr.responsePage.subtitle}</p>
        </div>

        {resolved ? (
          <div className="rounded-lg border border-teal/25 bg-surface p-7 text-center shadow-card">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal text-white">
              <Check aria-hidden="true" className="size-6" />
            </span>
            <h1 className="mt-5 font-heading text-2xl font-bold text-ink">
              {fr.humanRequest.decisionRecorded}
            </h1>
            <p className="mt-3 text-sm leading-6 text-graphite">
              {fr.humanRequest.decisionRecordedDescription}
            </p>
            <Button variant="outline" className="mt-6">
              {fr.responsePage.openWorkspace}
              <ExternalLink aria-hidden="true" className="size-4" />
            </Button>
          </div>
        ) : linkState === "active" ? (
          <HumanRequestCard
            request={request}
            suite={suite}
            users={users}
            connectorTypes={connectorTypes}
            connections={connections}
            onResolved={(_decision: Decision | "answer") => setResolved(true)}
          />
        ) : (
          <LinkStateCard state={linkState} request={request} users={users} />
        )}

        {suite.branding.showPoweredBy && (
          <footer className="py-8 text-center text-xs text-graphite">
            {fr.responsePage.poweredBy}
          </footer>
        )}
      </div>
    </main>
  )
}
