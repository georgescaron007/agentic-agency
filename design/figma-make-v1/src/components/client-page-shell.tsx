import { useState, type ReactNode } from "react"
import { X } from "lucide-react"

import {
  ClientAppHeader,
  ClientSidebar,
} from "@/components/client-space"
import { Button } from "@/components/ui/button"
import {
  type Conversation,
  type HumanRequest,
  type Suite,
  type User,
} from "@/contrat-donnees"
import { fr } from "@/i18n/fr"
import { pendingItemCount } from "@/lib/human-requests"

interface ClientPageShellProps {
  suites: Suite[]
  activeSuite: Suite
  conversations: Conversation[]
  requests: HumanRequest[]
  currentUser: User
  children: ReactNode
  contentClassName?: string
}

export default function ClientPageShell({
  suites,
  activeSuite,
  conversations,
  requests,
  currentUser,
  children,
  contentClassName = "overflow-y-auto",
}: ClientPageShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const pendingCount = pendingItemCount(requests, currentUser, activeSuite)

  return (
    <div className="h-screen overflow-hidden bg-paper text-ink">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">
        <ClientSidebar
          suites={suites}
          activeSuite={activeSuite}
          conversations={conversations}
          pendingCount={pendingCount}
          isOwner={currentUser.role === "owner"}
          onClose={() => setMobileNavigationOpen(false)}
        />
      </div>

      {mobileNavigationOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <Button
            variant="ghost"
            className="absolute inset-0 h-full w-full rounded-none bg-ink/45 p-0 backdrop-blur-sm"
            onClick={() => setMobileNavigationOpen(false)}
            aria-label={fr.client.closeNavigation}
          >
            <X aria-hidden="true" className="sr-only" />
          </Button>
          <div className="relative h-full w-72 shadow-2xl">
            <ClientSidebar
              suites={suites}
              activeSuite={activeSuite}
              conversations={conversations}
              pendingCount={pendingCount}
              isOwner={currentUser.role === "owner"}
              onClose={() => setMobileNavigationOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex h-full flex-col lg:pl-72">
        <ClientAppHeader
          currentUser={currentUser}
          pendingCount={pendingCount}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
        />
        <div className={`min-h-0 flex-1 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  )
}
