import { useEffect, useState, type ReactNode } from "react"
import { Moon, Sun } from "lucide-react"

import initiativeLogo from "@/assets/initiative-ia-logo.svg"
import AdminClientDetail from "@/components/admin/admin-client-detail"
import AdminClientsPage from "@/components/admin/admin-clients-page"
import AdminDashboard from "@/components/admin/admin-dashboard"
import AdminAgentEditor from "@/components/admin/admin-agent-editor"
import AdminAudit from "@/components/admin/admin-audit"
import AdminCatalogue from "@/components/admin/admin-catalogue"
import AdminModelsPage from "@/components/admin/admin-models-page"
import AdminPublication from "@/components/admin/admin-publication"
import AdminSandbox from "@/components/admin/admin-sandbox"
import AdminSupervision from "@/components/admin/admin-supervision"
import AdminSuiteEditor from "@/components/admin/admin-suite-editor"
import AdminTeamJournal from "@/components/admin/admin-team-journal"
import ClientSpace from "@/components/client-space"
import ConversationPage from "@/components/conversation-page"
import ActivityPage from "@/components/activity-page"
import DocumentsPage from "@/components/documents-page"
import RequestResponsePage from "@/components/request-response-page"
import RequestsPage from "@/components/requests-page"
import SettingsPage from "@/components/settings-page"
import {
  AgentStatusBadge,
  CreditsGauge,
  HumanAvatar,
  IdentityRow,
  RiskBadge,
} from "@/components/foundations"
import { Button } from "@/components/ui/button"
import type { AgentStatus, RiskClass } from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import {
  designAgents,
  designUser,
  usageExceeded,
  usageWithinPlan,
} from "@/mocks/design"
import {
  mockAgentConnectorAccess,
  mockConnections,
  mockConnectorTypes,
  mockKnowledge,
  mockOnboarding,
} from "@/mocks/integrations"
import {
  adminAuditEvents,
  adminDailyCostsEur,
  adminInfrastructureCostEur,
  adminPerformance,
  adminRequests,
  adminSuiteModels,
  adminSuites,
  adminSuiteVersions,
  adminTenants,
  adminUsage,
  adminUsers,
  mockHarnessView,
} from "@/mocks/admin"
import {
  mockActivityEvents,
  mockConversations,
  mockDocuments,
  mockMessages,
  mockRequests,
  mockSuite,
  mockTasks,
  mockTenant,
  mockUsage,
  mockUsageHistory,
  mockUsers,
  mockWorkInProgress,
} from "@/mocks/platform"

function ShowcaseSection({
  index,
  title,
  description,
  children,
}: {
  index: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-6 border-t border-line py-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:gap-14 lg:py-14">
      <div>
        <p className="font-mono text-xs font-bold tracking-widest text-teal-strong">
          {index}
        </p>
        <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-graphite">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </section>
  )
}

function DesignPage() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const statuses: AgentStatus[] = [
    "working",
    "waiting_human",
    "idle",
    "paused",
    "error",
  ]
  const risks: RiskClass[] = [
    "read",
    "write_internal",
    "write_external",
    "irreversible",
  ]

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <img
              src={initiativeLogo}
              alt={fr.common.productName}
              className="h-8 w-auto dark:rounded-sm dark:bg-paper dark:px-1"
            />
            <span className="hidden h-5 w-px bg-line sm:block" />
            <span className="hidden text-sm font-semibold text-graphite sm:block">
              {fr.common.designSystem}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDark((value) => !value)}
            aria-label={dark ? fr.common.lightMode : fr.common.darkMode}
          >
            {dark ? (
              <Sun aria-hidden="true" className="size-4" />
            ) : (
              <Moon aria-hidden="true" className="size-4" />
            )}
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
          <div className="absolute right-0 top-14 hidden h-36 w-3 rounded-full bg-teal lg:block" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal-strong">
            {fr.page.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {fr.page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-graphite sm:text-lg">
            {fr.page.description}
          </p>
          <div className="mt-10 flex items-center gap-3" aria-hidden="true">
            <span className="h-1.5 w-16 rounded-full bg-ink" />
            <span className="h-1.5 w-10 rounded-full bg-teal" />
            <span className="size-2 rotate-45 bg-lime" />
          </div>
        </section>

        <ShowcaseSection
          index="K1"
          title={fr.page.identityTitle}
          description={fr.page.identityDescription}
        >
          <div className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-7">
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {designAgents.map((agent) => (
                <IdentityRow
                  key={agent.name}
                  agent={agent}
                  naming="first_name_and_role"
                />
              ))}
              <div className="flex items-center gap-3">
                <HumanAvatar user={designUser} status="working" size="md" />
                <div>
                  <p className="text-sm font-bold text-ink">
                    {designUser.name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-graphite">
                    {fr.common.human}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-7 border-t border-line pt-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-graphite">
                {fr.common.roleNaming}
              </p>
              <IdentityRow agent={designAgents[0]} naming="role_only" />
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          index="K4"
          title={fr.page.riskTitle}
          description={fr.page.riskDescription}
        >
          <div className="flex min-h-40 flex-wrap content-center items-center gap-3 rounded-lg border border-line bg-surface p-6 shadow-card sm:p-8">
            {risks.map((risk) => (
              <RiskBadge key={risk} risk={risk} />
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          index="K5"
          title={fr.page.creditsTitle}
          description={fr.page.creditsDescription}
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-graphite">
                {fr.page.regularUsage}
              </p>
              <CreditsGauge usage={usageWithinPlan} />
            </div>
            <div>
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-graphite">
                {fr.page.exceededUsage}
              </p>
              <CreditsGauge usage={usageExceeded} />
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          index="K10"
          title={fr.page.statusesTitle}
          description={fr.page.statusesDescription}
        >
          <div className="flex min-h-40 flex-wrap content-center items-center gap-3 rounded-lg border border-line bg-surface p-6 shadow-card sm:p-8">
            {statuses.map((status) => (
              <AgentStatusBadge key={status} status={status} />
            ))}
          </div>
        </ShowcaseSection>
      </div>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 text-xs text-graphite sm:px-8 lg:px-12">
          <span>{fr.common.productName}</span>
          <span className="font-mono">{fr.common.foundations} · v0.1</span>
        </div>
      </footer>
    </main>
  )
}

export default function App() {
  const adminSandboxRoute = window.location.pathname.match(
    /^\/admin\/clients\/([^/]+)\/suites\/([^/]+)\/tester$/,
  )

  if (adminSandboxRoute) {
    const [, tenantId, suiteId] = adminSandboxRoute
    const tenant =
      adminTenants.find((item) => item.id === tenantId) ?? adminTenants[0]
    const suite =
      adminSuites.find((item) => item.id === suiteId) ?? adminSuites[0]

    return (
      <AdminSandbox
        tenant={tenant}
        suite={suite}
        messages={mockMessages}
        work={mockWorkInProgress}
        tasks={mockTasks}
        harness={mockHarnessView}
        user={mockUsers[1] ?? mockUsers[0]}
      />
    )
  }

  const adminPublicationRoute = window.location.pathname.match(
    /^\/admin\/clients\/([^/]+)\/suites\/([^/]+)\/publier$/,
  )

  if (adminPublicationRoute) {
    const [, tenantId, suiteId] = adminPublicationRoute
    const tenant =
      adminTenants.find((item) => item.id === tenantId) ?? adminTenants[0]
    const suite =
      adminSuites.find((item) => item.id === suiteId) ?? adminSuites[0]
    const versions = adminSuiteVersions.filter(
      (version) => version.suiteId === suite.id,
    )

    return (
      <AdminPublication
        tenant={tenant}
        suite={suite}
        versions={versions}
        harness={mockHarnessView}
      />
    )
  }

  const adminJournalRoute = window.location.pathname.match(
    /^\/admin\/supervision\/equipes\/([^/]+)\/journal$/,
  )

  if (adminJournalRoute) {
    const suiteId = adminJournalRoute[1]
    const suite =
      adminSuites.find((item) => item.id === suiteId) ?? adminSuites[0]
    return (
      <AdminTeamJournal
        suite={suite}
        events={mockActivityEvents.filter(
          (event) => event.teamId === suite.id,
        )}
        messages={mockMessages.filter(
          (message) => message.teamId === suite.id,
        )}
        requests={adminRequests.filter(
          (request) => request.teamId === suite.id,
        )}
        versions={adminSuiteVersions.filter(
          (version) => version.suiteId === suite.id,
        )}
        harness={mockHarnessView}
      />
    )
  }

  if (window.location.pathname === "/admin/supervision") {
    return (
      <AdminSupervision
        tenants={adminTenants}
        suites={adminSuites}
        usage={adminUsage}
        events={mockActivityEvents}
        messages={mockMessages}
        dailyCostsEur={adminDailyCostsEur}
        firstTokenP95Ms={adminPerformance.firstTokenP95Ms}
        agentTurnP95Seconds={adminPerformance.agentTurnP95Seconds}
      />
    )
  }

  if (window.location.pathname === "/admin/audit") {
    return <AdminAudit events={adminAuditEvents} suites={adminSuites} />
  }

  const adminAgentRoute = window.location.pathname.match(
    /^\/admin\/clients\/([^/]+)\/suites\/([^/]+)\/agents\/([^/]+)$/,
  )

  if (adminAgentRoute) {
    const [, tenantId, suiteId, encodedAgentName] = adminAgentRoute
    const tenant =
      adminTenants.find((item) => item.id === tenantId) ?? adminTenants[0]
    const suite =
      adminSuites.find((item) => item.id === suiteId) ?? adminSuites[0]
    const agentName = decodeURIComponent(encodedAgentName)
    const agent =
      suite.agents.find((item) => item.name === agentName) ?? suite.agents[0]

    return (
      <AdminAgentEditor
        tenant={tenant}
        suite={suite}
        agent={agent}
        harness={mockHarnessView}
        connectorTypes={mockConnectorTypes}
        connections={mockConnections}
        connectorAccess={mockAgentConnectorAccess}
        knowledge={mockKnowledge}
      />
    )
  }

  const adminSuiteRoute = window.location.pathname.match(
    /^\/admin\/clients\/([^/]+)\/suites\/([^/]+)$/,
  )

  if (adminSuiteRoute) {
    const [, tenantId, suiteId] = adminSuiteRoute
    const tenant =
      adminTenants.find((item) => item.id === tenantId) ?? adminTenants[0]
    const existingSuite =
      adminSuites.find((item) => item.id === suiteId) ?? adminSuites[0]
    const draftParams = new URLSearchParams(window.location.search)
    const requestedModelId = draftParams.get("model")
    const requestedModel = adminSuiteModels.find(
      (model) => model.id === requestedModelId,
    )
    const requestedNames = (draftParams.get("names") ?? "").split("|")
    const requestedNaming =
      draftParams.get("naming") === "role_only"
        ? ("role_only" as const)
        : ("first_name_and_role" as const)
    const suite = requestedModel
      ? {
          ...requestedModel,
          id: `draft-${tenant.id}-${requestedModel.templateKey}`,
          tenantId: tenant.id,
          name: `Suite ${requestedModel.name}`,
          status: "stopped" as const,
          agentNaming: requestedNaming,
          agents: requestedModel.agents.map((agent, index) => ({
            ...agent,
            firstName: requestedNames[index]?.trim() || agent.firstName,
          })),
          humans: adminUsers.filter((user) => user.tenantId === tenant.id),
          branding: {
            clientName: tenant.name,
            showPoweredBy: true,
          },
        }
      : existingSuite
    const versions = requestedModel
      ? [
          {
            suiteId: suite.id,
            version: 1,
            status: "draft" as const,
            author: "Léa Bernard",
            notes: "Création depuis un modèle.",
            createdAt: "2026-10-04T10:00:00Z",
          },
        ]
      : adminSuiteVersions.filter((version) => version.suiteId === suite.id)
    const catalogueAgents = adminSuiteModels
      .flatMap((model) => model.agents)
      .filter(
        (agent, index, all) =>
          all.findIndex((candidate) => candidate.name === agent.name) ===
          index,
      )

    return (
      <AdminSuiteEditor
        tenant={tenant}
        suite={suite}
        versions={versions}
        harness={mockHarnessView}
        catalogueAgents={catalogueAgents}
        connectorTypes={mockConnectorTypes}
        connections={mockConnections}
      />
    )
  }

  const adminClientRoute = window.location.pathname.match(
    /^\/admin\/clients\/([^/]+)$/,
  )

  if (adminClientRoute) {
    const tenantId = adminClientRoute[1]
    const tenant =
      adminTenants.find((item) => item.id === tenantId) ?? adminTenants[0]
    const suites = adminSuites.filter(
      (suite) => suite.tenantId === tenant.id,
    )
    const users = adminUsers.filter((user) => user.tenantId === tenant.id)
    const usage =
      adminUsage.find((item) => item.tenantId === tenant.id) ?? adminUsage[0]
    const versions = adminSuiteVersions.filter((version) =>
      suites.some((suite) => suite.id === version.suiteId),
    )

    return (
      <AdminClientDetail
        tenant={tenant}
        suites={suites}
        users={users}
        usage={usage}
        versions={versions}
        connectorTypes={mockConnectorTypes}
        connections={mockConnections.filter(
          (connection) => connection.tenantId === tenant.id,
        )}
        knowledge={mockKnowledge.filter(
          (document) => document.tenantId === tenant.id,
        )}
      />
    )
  }

  if (window.location.pathname === "/admin/clients") {
    return (
      <AdminClientsPage
        tenants={adminTenants}
        suites={adminSuites}
        users={adminUsers}
        usage={adminUsage}
      />
    )
  }

  if (window.location.pathname === "/admin/modeles") {
    return (
      <AdminModelsPage
        models={adminSuiteModels}
        clientSuites={adminSuites}
        tenants={adminTenants}
        connectorTypes={mockConnectorTypes}
        knowledge={mockKnowledge}
      />
    )
  }

  if (window.location.pathname === "/admin/catalogue") {
    return (
      <AdminCatalogue
        connectorTypes={mockConnectorTypes}
        models={adminSuiteModels}
        harness={mockHarnessView}
      />
    )
  }

  if (window.location.pathname.startsWith("/admin")) {
    return (
      <AdminDashboard
        tenants={adminTenants}
        suites={adminSuites}
        versions={adminSuiteVersions}
        usage={adminUsage}
        requests={adminRequests}
        events={mockActivityEvents}
        infrastructureCostEur={adminInfrastructureCostEur}
      />
    )
  }

  const responseRoute = window.location.pathname.match(/^\/app\/r\/([^/]+)$/)

  if (responseRoute) {
    const token = responseRoute[1]
    const linkState =
      token === "expired"
        ? "expired"
        : token === "answered"
          ? "answered"
          : token === "cancelled"
            ? "cancelled"
            : "active"
    const request =
      token === "action"
        ? mockRequests.find((item) => item.type === "tool_approval")
        : token === "message"
          ? mockRequests.find((item) => item.type === "message_approval")
          : mockRequests[0]

    return (
      <RequestResponsePage
        request={request ?? mockRequests[0]}
        suite={mockSuite}
        users={mockUsers}
        linkState={linkState}
        connectorTypes={mockConnectorTypes}
        connections={mockConnections}
      />
    )
  }

  if (window.location.pathname === "/app/demandes") {
    return (
      <RequestsPage
        suites={[mockSuite]}
        activeSuite={mockSuite}
        conversations={mockConversations}
        requests={mockRequests}
        currentUser={mockUsers[0]}
        connectorTypes={mockConnectorTypes}
        connections={mockConnections}
      />
    )
  }

  if (window.location.pathname === "/app/documents") {
    return (
      <DocumentsPage
        suites={[mockSuite]}
        activeSuite={mockSuite}
        conversations={mockConversations}
        requests={mockRequests}
        documents={mockDocuments}
        tasks={mockTasks}
        currentUser={mockUsers[0]}
      />
    )
  }

  if (window.location.pathname === "/app/activite") {
    return (
      <ActivityPage
        suites={[mockSuite]}
        activeSuite={mockSuite}
        conversations={mockConversations}
        requests={mockRequests}
        events={mockActivityEvents}
        currentUser={mockUsers[0]}
      />
    )
  }

  if (window.location.pathname.startsWith("/app/parametres")) {
    return (
      <SettingsPage
        tenant={mockTenant}
        suites={[mockSuite]}
        activeSuite={mockSuite}
        conversations={mockConversations}
        requests={mockRequests}
        usage={mockUsage}
        usageHistory={mockUsageHistory}
        users={mockUsers}
        currentUser={mockUsers[0]}
        connectorTypes={mockConnectorTypes}
        connections={mockConnections}
        knowledge={mockKnowledge}
      />
    )
  }

  const conversationRoute = window.location.pathname.match(
    /^\/app\/suites\/([^/]+)\/conversations\/([^/]+)$/,
  )

  if (conversationRoute) {
    const [, , conversationId] = conversationRoute
    const conversation =
      mockConversations.find((item) => item.id === conversationId) ??
      mockConversations[0]
    const params = new URLSearchParams(window.location.search)

    return (
      <ConversationPage
        suite={mockSuite}
        suites={[mockSuite]}
        conversation={conversation}
        conversations={mockConversations}
        messages={mockMessages}
        workInProgress={mockWorkInProgress}
        tasks={mockTasks}
        documents={mockDocuments}
        requests={mockRequests}
        usage={mockUsage}
        currentUser={mockUsers[0]}
        activityEvents={mockActivityEvents}
        connectorTypes={mockConnectorTypes}
        connections={mockConnections}
        connectionLost={params.get("offline") === "1"}
        hasNewMessages={params.get("scrolled") === "1"}
      />
    )
  }

  if (window.location.pathname.startsWith("/app")) {
    const state = new URLSearchParams(window.location.search).get("state")
    const pageState =
      state === "loading" || state === "error" || state === "empty"
        ? state
        : "ready"

    return (
      <ClientSpace
        suites={[mockSuite]}
        activeSuite={mockSuite}
        currentUser={mockUsers[0]}
        conversations={mockConversations}
        requests={mockRequests}
        usage={mockUsage}
        tasks={mockTasks}
        documents={mockDocuments}
        onboarding={mockOnboarding}
        state={pageState}
        supportMode={
          new URLSearchParams(window.location.search).get("support") === "1"
        }
      />
    )
  }

  return <DesignPage />
}
