import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutGrid, Dumbbell, History } from "lucide-react";
import { Button } from "@/components/ui/button";

import logoImg from "@assets/generated_images/minimalist_white_d_in_rounded_blue_square_logo.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/progress", label: "Progress", icon: History },
    { href: "/gym", label: "Gym Tracker", icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900 selection:bg-blue-100">
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white shadow-lg shadow-primary/25 font-display">
              D
            </div>
            <span className="hidden font-display text-lg font-bold tracking-tight text-slate-900 sm:block">
              DailyPlanner
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className={`
                  group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-slate-100 text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                `}>
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-slate-500 sm:block">
              Hi, {user?.username}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => logout()} 
              className="text-slate-400 hover:bg-red-50 hover:text-red-600"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
