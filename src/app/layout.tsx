import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { AppShell } from "@/components/app-shell";
import { InlineScript } from "@/components/inline-script";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EnquiryFlow — Enquiry management",
    template: "%s · EnquiryFlow",
  },
  description:
    "EnquiryFlow keeps track of every enquiry, who owns it, and what happens next.",
  applicationName: "EnquiryFlow",
  keywords: [
    "enquiry management",
    "CRM",
    "pipeline",
    "lead management",
    "education consultancy",
  ],
  openGraph: {
    title: "EnquiryFlow — Enquiry management",
    description:
      "Track every enquiry, who owns it, and what happens next.",
    type: "website",
    siteName: "EnquiryFlow",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161a24" },
  ],
};

/**
 * Applies the stored colour theme before the first paint so the page never
 * flashes the wrong palette.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('enquiryflow-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!rounded-xl !border-border !bg-popover !text-popover-foreground !shadow-overlay",
            },
          }}
        />
      </body>
    </html>
  );
}
