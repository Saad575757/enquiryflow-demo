import {
  Inbox,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Pipeline health at a glance",
      },
      {
        href: "/enquiries",
        label: "Enquiries",
        icon: Inbox,
        description: "Every enquiry, owner and next action",
      },
      {
        href: "/team",
        label: "Team",
        icon: Users,
        description: "Workload across the team",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items,
);

/** Human-readable label for a route, used by the top-bar breadcrumb. */
export function routeLabel(pathname: string) {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/enquiries/new")) return "New enquiry";
  if (pathname.startsWith("/enquiries/")) return "Enquiry";
  if (pathname.startsWith("/enquiries")) return "Enquiries";
  if (pathname.startsWith("/team")) return "Team";

  return "Workspace";
}
