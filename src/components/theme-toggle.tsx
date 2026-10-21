"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "enquiryflow-theme";
const CHANGE_EVENT = "enquiryflow-theme-change";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function readTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const stored = window.localStorage.getItem(STORAGE_KEY);

  return stored === "light" || stored === "dark" ? stored : "system";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, (): Theme => "system");

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  function handleSelect(value: Theme) {
    window.localStorage.setItem(STORAGE_KEY, value);
    applyTheme(value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => handleSelect(value)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active && "bg-card text-foreground shadow-sm",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
