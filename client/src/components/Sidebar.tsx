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
    <aside 
      className={cn(
        "w-16 border-r flex flex-col items-center py-4 gap-6 flex-shrink-0 bg-background",
        className
      )}
    >
      {/* Logo */}
      <Link href="/">
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          title="英语学习工具"
        >
          <BookOpen className="w-5 h-5" />
        </div>
      </Link>

      {/* 分隔线 */}
      <div className="w-8 h-px bg-border" />

      {/* 导航项 */}
      <nav className="flex flex-col gap-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 底部占位 */}
      <div className="h-4" />
    </aside>
  );
}
