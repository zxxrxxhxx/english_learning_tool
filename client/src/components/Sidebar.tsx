import { BookOpen, Search, History, FolderTree } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Search, label: "查询" },
    { href: "/categories", icon: FolderTree, label: "分类" },
    { href: "/history", icon: History, label: "历史" },
  ];

  return (
    <aside className={cn("w-16 border-r flex flex-col items-center py-4 gap-6", className)}>
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
          <BookOpen className="w-5 h-5" />
        </div>
      </Link>

      {/* 导航项 */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors cursor-pointer group relative",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
