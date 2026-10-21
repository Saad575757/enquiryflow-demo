import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { BrandMark } from "@/components/brand-mark";
import { ResetDemoButton } from "@/components/reset-demo-button";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarNavStatic } from "@/components/sidebar-nav-static";
import { ThemeToggle } from "@/components/theme-toggle";
import { Topbar } from "@/components/topbar";
import { NAV_SECTIONS } from "@/lib/nav";

function MobileNav() {
  const items = NAV_SECTIONS.flatMap((section) => section.items);

  return (
    <nav className="scrollbar-thin flex min-w-0 items-center gap-1 overflow-x-auto">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-canvas min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Link
          href="/"
          className="mb-7 flex items-center gap-3 rounded-lg px-2 py-1 text-sidebar-foreground transition-opacity hover:opacity-90"
        >
          <BrandMark size={36} />
          <span className="min-w-0">
            <span className="block text-[0.9375rem] leading-tight font-semibold tracking-tight">
              EnquiryFlow
            </span>
            <span className="block text-xs leading-tight text-sidebar-muted">
              Enquiry management
            </span>
          </span>
        </Link>

        <Suspense fallback={<SidebarNavStatic />}>
          <SidebarNav />
        </Suspense>

        <div className="mt-auto space-y-3 pt-6">
          <Link
            href="/enquiries/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            New enquiry
          </Link>

          <ResetDemoButton />

          <div className="flex items-start gap-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 px-3 py-2.5 text-xs text-sidebar-muted">
            <Sparkles className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Demo workspace — sample data only. Reset restores the original set.
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-sidebar-border/70 pt-3">
            <span className="text-xs text-sidebar-muted">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[17rem]">
        <Topbar />

        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md sm:gap-3 lg:hidden">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <BrandMark size={30} />
            <span className="text-sm font-semibold tracking-tight">EnquiryFlow</span>
          </Link>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            <MobileNav />
          </div>
          <Link
            href="/enquiries/new"
            aria-label="New enquiry"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
          >
            <Plus className="size-4" />
          </Link>
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-6 lg:py-8 xl:px-10">
          <div className="mx-auto w-full max-w-[92rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
