import { useState } from "react"
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  FileCode2,
  FileImage,
  FileText,
  Link2,
} from "lucide-react"

import ClientPageShell from "@/components/client-page-shell"
import { AgentAvatar, HumanAvatar } from "@/components/foundations"
import { Button } from "@/components/ui/button"
import {
  type Conversation,
  type DocumentItem,
  type HumanRequest,
  type Suite,
  type Task,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

interface DocumentsPageProps {
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  requests: HumanRequest[]
  documents: DocumentItem[]
  tasks: Task[]
  currentUser: User
}

function documentKind(document: DocumentItem) {
  if (document.mimeType === "application/pdf") return fr.documentsPage.pdf
  if (document.mimeType.startsWith("image/")) return fr.documentsPage.image
  if (
    document.mimeType.includes("typescript") ||
    document.mimeType.includes("javascript")
  ) {
    return fr.documentsPage.code
  }
  if (document.mimeType.includes("markdown")) return fr.documentsPage.markdown
  return fr.documentsPage.data
}

function DocumentIcon({ document }: { document: DocumentItem }) {
  const className = "size-5"
  if (document.mimeType.startsWith("image/")) {
    return <FileImage aria-hidden="true" className={className} />
  }
  if (
    document.mimeType.includes("typescript") ||
    document.mimeType.includes("javascript")
  ) {
    return <FileCode2 aria-hidden="true" className={className} />
  }
  return <FileText aria-hidden="true" className={className} />
}

function formatDocumentDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function MarkdownPreview() {
  return (
    <div className="prose-preview p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
        Pipeline commercial
      </p>
      <h3 className="mt-3 font-heading text-2xl font-bold text-ink">
        Synthèse de la semaine
      </h3>
      <p className="mt-4 text-sm leading-7 text-graphite">
        Le pipeline progresse de 12 % cette semaine. Trois opportunités
        nécessitent une action prioritaire avant vendredi.
      </p>
      <h4 className="mt-6 font-heading text-base font-bold text-ink">
        Points d’attention
      </h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-graphite">
        <li>• Valider la remise proposée à Dupont SA</li>
        <li>• Relancer les prospects sans réponse depuis 14 jours</li>
        <li>• Préparer la revue du portefeuille entreprise</li>
      </ul>
    </div>
  )
}

function PdfPreview({ title }: { title: string }) {
  return (
    <div className="bg-graphite-soft p-5 sm:p-8">
      <div className="mx-auto max-w-md rounded-sm bg-white p-7 shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-strong">
              Dupont & Associés
            </p>
            <h3 className="mt-3 text-xl font-bold text-slate-900">{title}</h3>
          </div>
          <span className="h-12 w-2 rounded-full bg-teal" />
        </div>
        <div className="mt-7 space-y-3">
          <span className="block h-2 w-2/5 rounded-full bg-slate-800" />
          <span className="block h-1.5 w-full rounded-full bg-slate-200" />
          <span className="block h-1.5 w-11/12 rounded-full bg-slate-200" />
          <span className="block h-1.5 w-4/5 rounded-full bg-slate-200" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="h-24 rounded-md bg-slate-100" />
          <div className="h-24 rounded-md bg-teal/10" />
        </div>
        <div className="mt-8 space-y-3">
          <span className="block h-1.5 w-full rounded-full bg-slate-200" />
          <span className="block h-1.5 w-5/6 rounded-full bg-slate-200" />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-graphite">
        {fr.documentsPage.pdfPreview} · {fr.documentsPage.pages}
      </p>
    </div>
  )
}

function ImagePreview() {
  return (
    <div className="p-6 sm:p-8">
      <div className="rounded-lg border border-line bg-paper p-5">
        <div className="flex items-center gap-2">
          <BarChart3 aria-hidden="true" className="size-5 text-teal-strong" />
          <p className="text-sm font-bold text-ink">Évolution du pipeline</p>
        </div>
        <div className="mt-8 flex h-52 items-end gap-3 border-b border-l border-line px-4">
          {[40, 55, 48, 72, 66, 84, 92].map((height, index) => (
            <span
              key={height}
              className={cn(
                "flex-1 rounded-t-sm",
                index === 6 ? "h-[92%] bg-teal" : `bg-action/35`,
                height <= 40 && "h-2/5",
                height > 40 && height <= 55 && "h-1/2",
                height > 55 && height <= 72 && "h-2/3",
                height > 72 && height < 90 && "h-4/5",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CodePreview() {
  return (
    <div className="bg-brand-ink p-5 font-mono text-xs leading-6 text-slate-300 sm:p-8">
      <pre className="overflow-x-auto">
        <code>{`export function scoreProspect(prospect: Prospect) {
  const engagement = prospect.recentInteractions * 12
  const companyFit = prospect.employeeCount > 20 ? 25 : 10
  const intent = prospect.requestedDemo ? 35 : 0

  return Math.min(engagement + companyFit + intent, 100)
}`}</code>
      </pre>
    </div>
  )
}

function DocumentPreview({
  document,
  suite,
  tasks,
}: {
  document: DocumentItem
  suite: Suite
  tasks: Task[]
}) {
  const authorAgent = suite.agents.find(
    (agent) => agent.name === document.author,
  )
  const authorHuman = suite.humans.find(
    (user) => user.id === document.author,
  )
  const task = tasks.find((item) => item.id === document.taskId)

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <header className="border-b border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal-strong">
              <DocumentIcon document={document} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-graphite">
                {documentKind(document)}
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold text-ink">
                {document.title}
              </h2>
              <p className="mt-1 text-xs text-graphite">
                {formatDocumentDate(document.updatedAt)}
              </p>
            </div>
          </div>
          <Button>
            <Download aria-hidden="true" className="size-4" />
            {fr.documentsPage.download}
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-xs text-graphite">
          <div className="flex items-center gap-2">
            {authorAgent && <AgentAvatar agent={authorAgent} size="sm" />}
            {authorHuman && (
              <HumanAvatar user={authorHuman} status="working" size="sm" />
            )}
            <span>
              {fr.documentsPage.author}{" "}
              <strong className="text-ink">
                {authorAgent?.firstName ??
                  authorHuman?.name ??
                  fr.client.unknownAgent}
              </strong>
            </span>
          </div>
          <span className="hidden h-5 w-px bg-line sm:block" />
          <span>
            {fr.documentsPage.relatedTask} :{" "}
            <strong className="text-ink">
              {task?.title ?? fr.documentsPage.noTask}
            </strong>
          </span>
        </div>
      </header>

      <div className="max-h-[34rem] overflow-y-auto">
        {document.mimeType === "application/pdf" && (
          <PdfPreview title={document.title} />
        )}
        {document.mimeType.includes("markdown") && <MarkdownPreview />}
        {document.mimeType.startsWith("image/") && <ImagePreview />}
        {document.mimeType.includes("typescript") && <CodePreview />}
        {document.mimeType.includes("csv") && (
          <div className="p-6">
            <div className="overflow-hidden rounded-md border border-line">
              {["Entreprise · Contact · Dernière activité", "Aster · M. Bernard · 12 jours", "Nova · Mme Leroy · 15 jours", "Kanso · M. Petit · 18 jours"].map(
                (row, index) => (
                  <p
                    key={row}
                    className={cn(
                      "px-4 py-3 text-xs",
                      index === 0
                        ? "bg-brand-ink font-bold text-white"
                        : "border-t border-line text-graphite",
                    )}
                  >
                    {row}
                  </p>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {document.messageId && (
        <footer className="border-t border-line p-4">
          <Button variant="ghost" className="text-action-strong">
            <Link2 aria-hidden="true" className="size-4" />
            {fr.documentsPage.originalMessage}
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </Button>
        </footer>
      )}
    </article>
  )
}

export default function DocumentsPage({
  suites,
  activeSuite,
  conversations,
  requests,
  documents,
  tasks,
  currentUser,
}: DocumentsPageProps) {
  const [selectedPath, setSelectedPath] = useState(documents[0]?.path)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const selected =
    documents.find((document) => document.path === selectedPath) ?? documents[0]

  return (
    <ClientPageShell
      suites={suites}
      activeSuite={activeSuite}
      conversations={conversations}
      requests={requests}
      currentUser={currentUser}
      contentClassName="flex min-h-0"
    >
      <section
        className={cn(
          "w-full overflow-y-auto border-r border-line bg-surface lg:w-96",
          mobilePreviewOpen && "hidden lg:block",
        )}
      >
        <header className="border-b border-line px-5 py-6">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-strong">
            {fr.documentsPage.eyebrow}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-ink">
            {fr.documentsPage.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-graphite">
            {fr.documentsPage.description}
          </p>
          <p className="mt-4 text-xs font-semibold text-graphite">
            {activeSuite.name} · {documents.length}{" "}
            {fr.documentsPage.documentCount}
          </p>
        </header>
        <div>
          {documents.map((document) => {
            const agent = activeSuite.agents.find(
              (item) => item.name === document.author,
            )
            const human = activeSuite.humans.find(
              (item) => item.id === document.author,
            )
            return (
              <Button
                key={document.path}
                variant="ghost"
                className={cn(
                  "relative h-auto w-full justify-start rounded-none border-b border-line px-5 py-4 text-left hover:bg-paper",
                  selected?.path === document.path &&
                    "bg-action-soft hover:bg-action-soft",
                )}
                onClick={() => {
                  setSelectedPath(document.path)
                  setMobilePreviewOpen(true)
                }}
              >
                {selected?.path === document.path && (
                  <span className="absolute left-0 h-12 w-1 rounded-r-full bg-teal" />
                )}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-graphite-soft text-graphite">
                  <DocumentIcon document={document} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 whitespace-normal text-sm font-semibold leading-5 text-ink">
                    {document.title}
                  </span>
                  <span className="mt-2 flex items-center gap-2 text-xs font-normal text-graphite">
                    {agent?.firstName ?? human?.name}
                    <span>·</span>
                    {documentKind(document)}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="size-4 text-graphite" />
              </Button>
            )
          })}
        </div>
      </section>

      <section
        className={cn(
          "min-w-0 flex-1 overflow-y-auto bg-paper p-4 sm:p-6 lg:p-8",
          !mobilePreviewOpen && "hidden lg:block",
        )}
      >
        {selected ? (
          <div className="mx-auto max-w-4xl">
            <Button
              variant="ghost"
              className="mb-4 pl-0 lg:hidden"
              onClick={() => setMobilePreviewOpen(false)}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {fr.requestsPage.backToList}
            </Button>
            <DocumentPreview
              document={selected}
              suite={activeSuite}
              tasks={tasks}
            />
          </div>
        ) : (
          <p className="text-sm text-graphite">
            {fr.documentsPage.selectDocument}
          </p>
        )}
      </section>
    </ClientPageShell>
  )
}
