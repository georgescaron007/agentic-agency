import { BookOpenCheck } from "lucide-react"

import ClientPageShell from "@/components/client-page-shell"
import KnowledgeLibrary from "@/components/knowledge-library"
import {
  type Conversation,
  type HumanRequest,
  type KnowledgeDocument,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"

interface KnowledgePageProps {
  knowledge: KnowledgeDocument[]
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  requests: HumanRequest[]
  currentUser: User
}

export default function KnowledgePage({
  knowledge,
  suites,
  activeSuite,
  conversations,
  requests,
  currentUser,
}: KnowledgePageProps) {
  return (
    <ClientPageShell
      suites={suites}
      activeSuite={activeSuite}
      conversations={conversations}
      requests={requests}
      currentUser={currentUser}
    >
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.client.settings}
          </p>
          <div
            role="heading"
            aria-level={1}
            className="mt-1 font-heading text-3xl font-extrabold text-ink"
          >
            {fr.knowledge.title}
          </div>
        </header>
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-teal/25 bg-teal-soft p-4 text-sm leading-6 text-ink">
          <BookOpenCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-teal-strong"
          />
          {fr.knowledge.description}
        </div>
        <div className="mt-6">
          <KnowledgeLibrary documents={knowledge} suite={activeSuite} />
        </div>
      </main>
    </ClientPageShell>
  )
}
