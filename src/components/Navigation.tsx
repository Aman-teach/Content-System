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
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 left-0 flex-shrink-0 shadow-sm z-20">
      <div className="flex items-center h-16 border-b border-gray-100 px-6">
        <span className="text-xl font-black text-indigo-600 tracking-tight">Content System</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
              )}
            >
              <div className="flex items-center">
                <Icon className={clsx("w-5 h-5 mr-3 flex-shrink-0 transition-colors", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                {link.name}
              </div>
              {link.name === "Notifications" && unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Profile & Logout Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
         <div className="flex items-center space-x-3">
           <UserCircle2 className="w-10 h-10 text-gray-400 bg-white rounded-full shadow-sm flex-shrink-0" />
           <div className="overflow-hidden">
             <p className="text-sm font-bold text-gray-900 truncate">
               {user?.name || (role === "admin" ? "Admin" : "Client")}
             </p>
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
               {role === "admin" ? "Admin Access" : "Client Workspace"}
             </p>
           </div>
         </div>
         
         <button 
           onClick={logout}
           className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-colors"
         >
           <LogOut className="w-3.5 h-3.5" />
           Sign Out
         </button>
      </div>
    </div>
  );
}
