import { type ReactNode } from "react"
import {
  Bell,
  Blocks,
  BookOpenCheck,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"

import inverseLogo from "@/assets/initiative-ia-logo-inverse.svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fr } from "@/i18n/fr"
import { cn } from "@/lib/utils"

interface AdminShellProps {
  children: ReactNode
  supportMode?: boolean
  onExitSupport?: () => void
}

const navItems = [
  { label: fr.admin.dashboard, icon: LayoutDashboard, path: "/admin" },
  { label: fr.admin.clients, icon: Users, path: "/admin/clients" },
  {
    label: fr.admin.suiteModels,
    icon: BookOpenCheck,
    path: "/admin/modeles",
  },
  { label: fr.admin.catalog, icon: Blocks, path: "/admin/catalogue" },
  {
    label: fr.admin.supervision,
    icon: ShieldCheck,
    path: "/admin/supervision",
  },
  {
    label: fr.admin.auditLog,
    icon: ClipboardList,
    path: "/admin/audit",
  },
  { label: fr.admin.settings, icon: Settings, path: "/admin/parametres" },
] as const

function isActive(path: string) {
  if (path === "/admin") return window.location.pathname === "/admin"
  if (path === "/admin/clients") {
    return window.location.pathname.startsWith("/admin/clients")
  }
  return window.location.pathname.startsWith(path)
}

export default function AdminShell({
  children,
  supportMode = false,
  onExitSupport,
}: AdminShellProps) {
  return (
    <div className="min-h-screen min-w-[68rem] bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-ink text-white">
        <div className="flex h-17 items-center border-b border-white/10 px-5">
          <img
            src={inverseLogo}
            alt={fr.admin.product}
            className="h-8 w-auto"
          />
        </div>
        <div className="px-5 pb-2 pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-white/35">
            {fr.admin.backOffice}
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ label, icon: Icon, path }) => {
            const active = isActive(path)
            return (
              <Button
                key={path}
                variant="ghost"
                className={cn(
                  "relative h-9 w-full justify-start px-3 text-sm text-white/65 hover:bg-white/8 hover:text-white",
                  active && "bg-white/10 text-white hover:bg-white/10",
                )}
                onClick={() => window.location.assign(path)}
              >
                {active && (
                  <span className="absolute -left-0.5 h-5 w-1 rounded-full bg-teal" />
                )}
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </Button>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-teal text-xs font-bold text-white">
              LB
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">
                Léa Bernard
              </p>
              <p className="mt-0.5 truncate text-xs text-white/40">
                {fr.admin.platformTeam}
              </p>
            </div>
            <ChevronDown aria-hidden="true" className="size-3.5 text-white/40" />
          </div>
        </div>
      </aside>

      <div className="pl-64">
        {supportMode && (
          <div className="sticky top-0 z-50 flex h-10 items-center justify-center gap-4 bg-waiting px-5 text-xs font-bold text-brand-ink shadow-sm">
            <span className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {fr.admin.supportBanner}
            </span>
            <span className="rounded-full bg-brand-ink/10 px-2 py-0.5">
              {fr.admin.readOnly}
            </span>
            {onExitSupport && (
              <Button
                variant="ghost"
                className="h-7 px-2 text-xs text-brand-ink hover:bg-brand-ink/10"
                onClick={onExitSupport}
              >
                {fr.admin.exitSupport}
              </Button>
            )}
          </div>
        )}
        <header
          className={cn(
            "sticky top-0 z-30 flex h-17 items-center gap-4 border-b border-line bg-surface/95 px-6 backdrop-blur",
            supportMode && "top-10",
          )}
        >
          <div className="relative max-w-xl flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite"
            />
            <Input
              aria-label={fr.admin.search}
              placeholder={fr.admin.search}
              className="h-9 border-transparent bg-muted pl-9"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9"
            aria-label={fr.admin.notifications}
          >
            <Bell aria-hidden="true" className="size-4.5" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
          </Button>
          <span className="h-6 w-px bg-line" />
          <Button variant="ghost" className="h-10 gap-2 px-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-ink text-xs font-bold text-white">
              LB
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold text-ink">
                Léa Bernard
              </span>
              <span className="block text-xs font-normal text-graphite">
                {fr.admin.administrator}
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="size-3.5 text-graphite" />
          </Button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
