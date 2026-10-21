"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-6", className)}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="space-y-1.5">
          <p className="px-3 text-[0.6875rem] font-semibold tracking-[0.08em] text-sidebar-muted/70 uppercase">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary-foreground transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active
                        ? "text-sidebar-foreground"
                        : "text-sidebar-muted group-hover:text-sidebar-foreground",
                    )}
                  />
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
