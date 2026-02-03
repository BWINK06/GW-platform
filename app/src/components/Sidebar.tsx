"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Search,
  Handshake,
  Settings,
  LayoutDashboard,
  Users,
  Activity,
  BookOpen,
} from "lucide-react";
import { agents } from "@/lib/agents";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BarChart3,
  Search,
  Handshake,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
            GW
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Griffin Wink</div>
            <div className="text-xs text-white/50">Agency Platform</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-xs uppercase tracking-wider text-white/30 px-3 pt-3 pb-2">
          Portal
        </div>
        <SidebarLink
          href="/"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={pathname === "/"}
        />
        <SidebarLink
          href="/clients"
          icon={<Users size={18} />}
          label="Clients"
          active={pathname === "/clients"}
        />
        <SidebarLink
          href="/knowledge"
          icon={<BookOpen size={18} />}
          label="Knowledge Hub"
          active={pathname === "/knowledge"}
        />

        <div className="text-xs uppercase tracking-wider text-white/30 px-3 pt-5 pb-2">
          Agents
        </div>
        {agents.map((agent) => {
          const Icon = iconMap[agent.icon];
          return (
            <SidebarLink
              key={agent.id}
              href={`/agents/${agent.slug}`}
              icon={Icon ? <Icon size={18} /> : <Activity size={18} />}
              label={agent.name}
              active={pathname === `/agents/${agent.slug}`}
              dotColor={agent.color}
            />
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-xs text-white/40">
        GW Platform v0.1
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  dotColor,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  dotColor?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white/80"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
      {dotColor && (
        <span
          className="ml-auto w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
    </Link>
  );
}
