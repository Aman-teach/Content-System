"use client";

import { useRole } from "@/context/RoleContext";
import { useContent } from "@/context/ContentContext";
import { CheckCircle, MessageSquare, Clock, PlusCircle, Lightbulb, UserCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

// Removed mockNotifications array

const getIcon = (type: string) => {
  switch (type) {
    case "review": return <Clock className="w-5 h-5 text-amber-500" />;
    case "comment": return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case "status": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "idea": return <Lightbulb className="w-5 h-5 text-purple-500" />;
    default: return <PlusCircle className="w-5 h-5 text-gray-500" />;
  }
};

export default function NotificationsPage() {
  const { role } = useRole();
  const { notifications, markAllNotificationsAsRead } = useContent();

  const visibleNotifications = notifications.filter(
    (n) => n.roleContext === role || n.roleContext === "both"
  );

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-['Helvetica',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-stone-200/70 pb-6">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight flex items-center">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#4CA1AF]/15 text-[#2C3E50]">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-stone-500 mt-1 font-normal">
            Stay updated on content approvals, feedback, and ideas.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllNotificationsAsRead(role)}
            className="text-xs font-semibold text-[#2C3E50] hover:text-[#4CA1AF] bg-white border border-stone-200/80 shadow-sm px-4 py-2 rounded-xl transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {visibleNotifications.map((notification) => (
            <li key={notification.id} className={clsx(
              "hover:bg-gray-50 transition-colors",
              !notification.read ? "bg-indigo-50/30" : ""
            )}>
              <Link href={notification.link} className="block px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm",
                    !notification.read ? "bg-white border-indigo-100" : "bg-gray-50 border-gray-200"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      "text-sm leading-relaxed",
                      !notification.read ? "font-bold text-gray-900" : "font-medium text-gray-700"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 mt-1.5 flex items-center">
                      {notification.time}
                      {!notification.read && (
                        <span className="ml-2 w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {visibleNotifications.length === 0 && (
            <div className="p-12 text-center">
              <UserCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">You&apos;re all caught up!</h3>
              <p className="text-sm text-gray-500 mt-1">No new activity to show.</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
