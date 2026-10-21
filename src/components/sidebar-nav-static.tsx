import Link from "next/link";

import { NAV_SECTIONS } from "@/lib/nav";

export function SidebarNavStatic({ className }: { className?: string }) {
  return (
    <nav className={className ?? "flex flex-col gap-6"}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="space-y-1.5">
          <p className="px-3 text-[0.6875rem] font-semibold tracking-[0.08em] text-sidebar-muted/70 uppercase">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
