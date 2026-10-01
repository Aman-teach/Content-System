"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar as CalendarIcon, PlusCircle, UserCircle2, Lightbulb, Bell, LogOut } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/RoleContext";
import { useContent } from "@/context/ContentContext";
import { useAuth } from "@/context/AuthContext";

export function Navigation() {
  const { role } = useRole();
  const { user, logout } = useAuth();
  const { notifications } = useContent();
  const pathname = usePathname();

  // Hide the entire navigation bar on public share page and login page
  if (pathname.startsWith("/share") || pathname.startsWith("/login")) return null;

  const visibleNotifications = notifications.filter(
    (n) => n.roleContext === role || n.roleContext === "both"
  );
  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Calendar", href: "/calendar", icon: CalendarIcon },
    { name: "Ideas", href: "/ideas", icon: Lightbulb },
    { name: "Notifications", href: "/notifications", icon: Bell },
    // Only show Submit Content if admin
    ...(role === "admin" ? [{ name: "Submit Content", href: "/submit", icon: PlusCircle }] : []),
  ];

  return (
    <div className="flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-stone-200/70 h-screen sticky top-0 left-0 flex-shrink-0 shadow-sm z-20 font-['Helvetica',sans-serif]">
      <div className="flex-1 overflow-y-auto pt-10 pb-6 px-3 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] text-white shadow-md shadow-[#2C3E50]/15" 
                  : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 border border-transparent"
              )}
            >
              <div className="flex items-center">
                <Icon className={clsx("w-5 h-5 mr-3 flex-shrink-0 transition-colors", isActive ? "text-white" : "text-stone-400 group-hover:text-stone-700")} />
                {link.name}
              </div>
              {link.name === "Notifications" && unreadCount > 0 && (
                <span className={clsx(
                  "inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full",
                  isActive ? "bg-white text-[#2C3E50]" : "bg-[#4CA1AF] text-white"
                )}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Profile & Logout Section */}
      <div className="p-5 border-t border-stone-100 bg-stone-50/30">
         <div className="flex items-center space-x-3 mb-4">
           {/* Avatar with Initial */}
           <div className={clsx(
             "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0",
             role === "admin" ? "bg-gradient-to-tr from-[#2C3E50] to-[#4CA1AF]" : "bg-gradient-to-tr from-stone-400 to-stone-500"
           )}>
             {(user?.name || (role === "admin" ? "Admin" : "Client")).charAt(0).toUpperCase()}
           </div>
           <div className="overflow-hidden flex-1">
             <p className="text-sm font-bold text-stone-800 truncate">
               {user?.name || (role === "admin" ? "Admin" : "Client Workspace")}
             </p>
             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
               {role === "admin" ? "Admin Access" : "Client Access"}
             </p>
           </div>
         </div>
         
         <button 
           onClick={logout}
           className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-stone-500 bg-white border border-stone-200/80 hover:bg-stone-50 hover:text-stone-700 hover:border-stone-300 rounded-xl transition-all shadow-sm"
         >
           <LogOut className="w-3.5 h-3.5" />
           Sign Out
         </button>
      </div>
    </div>
  );
}
