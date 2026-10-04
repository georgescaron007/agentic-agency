import { useState } from "react"
import {
  AlertTriangle,
  Check,
  ExternalLink,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Unplug,
  X,
} from "lucide-react"

import ClientPageShell from "@/components/client-page-shell"
import { AgentAvatar, HumanAvatar } from "@/components/foundations"
import {
  ConnectorConnectionSummary,
  ConnectorLogo,
} from "@/components/integration-components"
import { Button } from "@/components/ui/button"
import {
  type Connection,
  type ConnectorCategory,
  type ConnectorType,
  type Conversation,
  type HumanRequest,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"

interface ConnectedToolsPageProps {
  connectorTypes: ConnectorType[]
  connections: Connection[]
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  requests: HumanRequest[]
  users: User[]
  currentUser: User
  embedded?: boolean
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

export default function ConnectedToolsPage({
  connectorTypes,
  connections,
  suites,
  activeSuite,
  conversations,
  requests,
  users,
  currentUser,
  embedded = false,
}: ConnectedToolsPageProps) {
  const [disconnecting, setDisconnecting] = useState<Connection>()
  const categories = Array.from(
    new Set(connectorTypes.map((connector) => connector.category)),
  )

  const content = (
    <>
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {!embedded && <header>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.client.settings}
          </p>
          <div
            role="heading"
            aria-level={1}
            className="mt-1 font-heading text-3xl font-extrabold text-ink"
          >
            {fr.connectors.title}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite">
            {fr.connectors.description}
          </p>
        </header>}

        {connections.length === 0 ? (
          <section className="mt-8 rounded-lg border border-dashed border-line bg-surface p-10 text-center">
            <Unplug
              aria-hidden="true"
              className="mx-auto size-10 text-graphite"
            />
            <div
              role="heading"
              aria-level={2}
              className="mt-4 font-heading text-xl font-bold text-ink"
            >
              {fr.connectors.emptyTitle}
            </div>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-graphite">
              {fr.connectors.emptyDescription}
            </p>
          </section>
        ) : (
          <div className="mt-8 space-y-8">
            {categories.map((category) => (
              <section key={category}>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    role="heading"
                    aria-level={2}
                    className="font-heading text-lg font-bold text-ink"
                  >
                    {categoryLabels[category]}
                  </div>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {connectorTypes
                    .filter((connector) => connector.category === category)
                    .map((connector) => {
                      const connectorConnections = connections.filter(
                        (connection) =>
                          connection.connectorKey === connector.key,
                      )
                      const primary =
                        connectorConnections.find(
                          (connection) =>
                            connection.ownerUserId === currentUser.id,
                        ) ??
                        connectorConnections.find(
                          (connection) => connection.status === "connected",
                        ) ??
                        connectorConnections[0]
                      const usedAgentNames = Array.from(
                        new Set(
                          connectorConnections.flatMap(
                            (connection) => connection.usedByAgents,
                          ),
                        ),
                      )
                      const requiredSuiteIds = Array.from(
                        new Set(
                          connectorConnections.flatMap(
                            (connection) => connection.requiredBySuites,
                          ),
                        ),
                      )

                      return (
                        <article
                          key={connector.key}
                          className="rounded-lg border border-line bg-surface p-5 shadow-card"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <ConnectorLogo connector={connector} />
                              <div>
                                <div
                                  role="heading"
                                  aria-level={3}
                                  className="font-heading text-lg font-bold text-ink"
                                >
                                  {connector.name}
                                </div>
                                <p className="mt-1 text-xs text-graphite">
                                  {primary?.scope === "per_user"
                                    ? fr.connectors.perUser
                                    : fr.connectors.shared}
                                </p>
                              </div>
                            </div>
                            <ConnectorConnectionSummary
                              connector={connector}
                              connections={connectorConnections}
                              users={users}
                            />
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-md bg-paper p-3">
                              <p className="text-xs text-graphite">
                                {fr.connectors.account}
                              </p>
                              <p className="mt-1 truncate text-xs font-bold text-ink">
                                {primary?.accountLabel ?? "—"}
                              </p>
                            </div>
                            <div className="rounded-md bg-paper p-3">
                              <p className="text-xs text-graphite">
                                {fr.connectors.access}
                              </p>
                              <p className="mt-1 text-xs font-bold text-ink">
                                {primary?.grantedAccess === "read_write"
                                  ? fr.connectors.readWrite
                                  : fr.connectors.read}
                              </p>
                            </div>
                          </div>

                          {primary?.scope === "per_user" && (
                            <div className="mt-4 rounded-lg border border-line">
                              <p className="border-b border-line bg-paper px-3 py-2 text-xs font-bold text-graphite">
                                {fr.connectors.personalConnections}
                              </p>
                              <div className="divide-y divide-line">
                                {users.map((user) => {
                                  const connection = connectorConnections.find(
                                    (item) => item.ownerUserId === user.id,
                                  )
                                  return (
                                    <div
                                      key={user.id}
                                      className="flex items-center gap-3 px-3 py-2.5"
                                    >
                                      <HumanAvatar
                                        user={user}
                                        status={
                                          connection?.status === "connected"
                                            ? "working"
                                            : "idle"
                                        }
                                        size="sm"
                                      />
                                      <span className="flex-1 text-xs font-semibold text-ink">
                                        {user.name}
                                      </span>
                                      <span className="flex items-center gap-1 text-xs text-graphite">
                                        {connection?.status === "connected" ? (
                                          <>
                                            <Check
                                              aria-hidden="true"
                                              className="size-3.5 text-teal-strong"
                                            />
                                            {fr.connectors.connected.toLowerCase()}
                                          </>
                                        ) : (
                                          fr.connectors.toConnect
                                        )}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs text-graphite">
                                {fr.connectors.usedBy}
                              </p>
                              <div className="mt-2 flex -space-x-2">
                                {usedAgentNames.map((name) => {
                                  const agent = activeSuite.agents.find(
                                    (item) => item.name === name,
                                  )
                                  return (
                                    agent && (
                                      <span
                                        key={name}
                                        className="rounded-lg ring-2 ring-surface"
                                      >
                                        <AgentAvatar agent={agent} size="sm" />
                                      </span>
                                    )
                                  )
                                })}
                              </div>
                            </div>
                            <p className="text-right text-xs text-graphite">
                              {fr.connectors.requiredBy}
                              <br />
                              <strong className="text-ink">
                                {requiredSuiteIds
                                  .map(
                                    (id) =>
                                      suites.find((suite) => suite.id === id)
                                        ?.name,
                                  )
                                  .filter(Boolean)
                                  .join(", ")}
                              </strong>
                            </p>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                            {!primary ||
                            primary.status === "not_connected" ||
                            primary.status === "pending_invite" ? (
                              <Button>
                                <ExternalLink
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                {primary?.scope === "per_user"
                                  ? fr.connectors.connectMyAddress
                                  : fr.connectors.connect}
                              </Button>
                            ) : primary.status === "expired" ||
                              primary.status === "error" ? (
                              <Button>
                                <RefreshCw
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                {fr.connectors.reconnect}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-danger hover:bg-danger-soft hover:text-danger"
                                onClick={() => setDisconnecting(primary)}
                              >
                                <Unplug
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                {fr.connectors.disconnect}
                              </Button>
                            )}
                            <span className="flex items-center gap-1.5 text-xs text-graphite">
                              <LockKeyhole
                                aria-hidden="true"
                                className="size-3.5 text-teal-strong"
                              />
                              {fr.connectors.passwordNotice}
                            </span>
                          </div>
                        </article>
                      )
                    })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {disconnecting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-brand-ink/50 p-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <span className="flex size-10 items-center justify-center rounded-full bg-danger-soft text-danger">
                <AlertTriangle aria-hidden="true" className="size-5" />
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setDisconnecting(undefined)}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div
              role="heading"
              aria-level={2}
              className="mt-5 font-heading text-xl font-bold text-ink"
            >
              {fr.connectors.disconnectTitle}
            </div>
            <p className="mt-2 text-sm text-graphite">
              {fr.connectors.disconnectDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {disconnecting.usedByAgents.map((name) => {
                const agent = activeSuite.agents.find(
                  (item) => item.name === name,
                )
                return (
                  agent && (
                    <span
                      key={name}
                      className="flex items-center gap-2 rounded-md bg-paper p-2 text-xs font-bold text-ink"
                    >
                      <AgentAvatar agent={agent} size="sm" />
                      {agent.firstName}
                    </span>
                  )
                )
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setDisconnecting(undefined)}
              >
                {fr.connectors.cancel}
              </Button>
              <Button className="bg-danger text-white hover:bg-danger/90">
                {fr.connectors.confirmDisconnect}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  )

  if (embedded) return content

  return (
    <ClientPageShell
      suites={suites}
      activeSuite={activeSuite}
      conversations={conversations}
      requests={requests}
      currentUser={currentUser}
    >
      {content}
    </ClientPageShell>
  )
}
