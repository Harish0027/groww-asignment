"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LineChart,
  Star,
  Home,
  Briefcase,
  BellRing,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStockStore } from "../../store/dashboard-store";

export function Navbar() {
  const pathname = usePathname();

  // Zustand version of triggeredAlerts
  const triggeredAlerts = useStockStore((s) => s.triggeredAlerts);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="w-4 h-4 mr-2" />,
      mobileIcon: <Home className="w-4 h-4" />,
    },
    {
      name: "Watchlist",
      href: "/watchlist",
      icon: <Star className="w-4 h-4 mr-2" />,
      mobileIcon: <Star className="w-4 h-4" />,
    },
    {
      name: "Stocks",
      href: "/stocks",
      icon: <LineChart className="w-4 h-4 mr-2" />,
      mobileIcon: <LineChart className="w-4 h-4" />,
    },

    {
      name: "Compare",
      href: "/compare",
      icon: <BarChart3 className="w-4 h-4 mr-2" />,
      mobileIcon: <BarChart3 className="w-4 h-4" />,
    },
    {
      name: "Alerts",
      href: "/alerts",
      icon: (
        <>
          <BellRing className="w-4 h-4 mr-2" />
          {triggeredAlerts.length > 0 && (
            <Badge
              variant="destructive"
              className="h-5 w-5 p-0 flex items-center justify-center text-[10px] ml-1 mr-2"
            >
              {triggeredAlerts.length}
            </Badge>
          )}
        </>
      ),
      mobileIcon: (
        <div className="relative">
          <BellRing className="w-4 h-4" />
          {triggeredAlerts.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {triggeredAlerts.length}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg mr-6"
          >
            <LineChart className="h-5 w-5" />
            <span className="hidden md:inline-block">FinBoard</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Nav */}
          <nav className="flex items-center gap-1 md:hidden overflow-x-auto pb-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted",
                  pathname === item.href
                    ? "bg-muted text-foreground"
                    : "text-foreground/60"
                )}
              >
                <span className="sr-only">{item.name}</span>
                {item.mobileIcon}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          {/* Desktop Add Widget Button */}
          <Button variant="secondary" className="hidden md:flex">
            Add Widget
          </Button>

          {/* Mobile Add Widget Button */}
          <Button size="sm" className="md:hidden">
            +
          </Button>
        </div>
      </div>
    </header>
  );
}
