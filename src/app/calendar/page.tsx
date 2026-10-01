"use client";

import { useState } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Video, FileText } from "lucide-react";
import { FaInstagram, FaYoutube, FaLinkedin, FaTiktok } from "react-icons/fa";
import clsx from "clsx";
import { useRole } from "@/context/RoleContext";
import { useContent } from "@/context/ContentContext";

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram": return <FaInstagram key={platform} className="w-3 h-3 text-pink-600" />;
    case "Youtube": return <FaYoutube key={platform} className="w-3 h-3 text-red-600" />;
    case "Linkedin": return <FaLinkedin key={platform} className="w-3 h-3 text-blue-600" />;
    case "TikTok": return <FaTiktok key={platform} className="w-3 h-3 text-gray-800" />;
    default: return <FileText key={platform} className="w-3 h-3 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Draft": return "bg-gray-300";
    case "In Review": return "bg-amber-400";
    case "Approved": return "bg-emerald-500";
    case "Needs Changes": return "bg-red-500";
    default: return "bg-gray-300";
  }
};

export default function CalendarPage() {
  const { role } = useRole();
  const { items, updateItemDate } = useContent();
  const mockToday = new Date("2026-10-01T00:00:00Z");
  const [currentDate, setCurrentDate] = useState(mockToday);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  // Filter out drafts if client
  const visibleItems = role === "client" 
    ? items.filter(item => item.status !== "Draft")
    : items;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(mockToday);

  // --- HTML5 Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.setData("text/plain", id); 
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedItemId) return;

    updateItemDate(draggedItemId, targetDate);
    setDraggedItemId(null);
  };

  return (
    <div className="space-y-8 font-['Helvetica',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">Content Calendar</h1>
          <p className="text-sm text-stone-500 mt-1 font-normal">
            {role === "admin" ? "Drag and drop to reschedule posts for Vidhi's review." : "See when content is scheduled to go live."}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={goToToday}
            className="text-xs font-semibold text-[#2C3E50] hover:text-[#4CA1AF] transition-colors bg-white border border-stone-200/80 shadow-sm px-3.5 py-2 rounded-xl"
          >
            Today
          </button>
          
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-gray-700 w-32 text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 bg-gray-200 gap-px">
          {days.map((day) => {
             const isCurrentMonth = isSameMonth(day, monthStart);
             const isMockToday = day.getTime() === mockToday.getTime();
             
             const postsToday = visibleItems.filter(p => 
                p.date.getFullYear() === day.getFullYear() &&
                p.date.getMonth() === day.getMonth() &&
                p.date.getDate() === day.getDate()
             );

             return (
              <div 
                key={day.toString()} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={clsx(
                  "min-h-[140px] p-2 transition-colors duration-200 relative group",
                  isCurrentMonth ? "bg-white hover:bg-slate-50" : "bg-gray-50"
                )}
              >
                <div className="flex justify-between items-start mb-2 px-1">
                  <div className={clsx(
                    "font-bold text-xs w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                    isMockToday 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : !isCurrentMonth 
                        ? "text-gray-400" 
                        : "text-gray-700 group-hover:text-indigo-600"
                  )}>
                    {format(day, "d")}
                  </div>
                </div>
                
                {/* Posts for the day */}
                <div className="space-y-2 flex flex-col">
                  {postsToday.map(post => (
                    <Link 
                      key={post.id} 
                      href={`/review/${post.id}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, post.id)}
                      className="block focus:outline-none"
                    >
                      <div className={clsx(
                        "flex flex-col gap-1.5 p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing",
                        draggedItemId === post.id ? "opacity-50 border-dashed scale-95" : "hover:shadow-sm hover:-translate-y-0.5"
                      )}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {(post.platforms || []).map(getPlatformIcon)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400 tracking-tight">
                              {format(post.date, "h:mm a")}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(post.status)} flex-shrink-0`} title={post.status} />
                          </div>
                        </div>
                        
                        {post.thumbnail && (
                          <div className="w-full h-20 mb-1.5 rounded bg-gray-100 overflow-hidden relative group-hover:opacity-90 transition-opacity">
                            {/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.thumbnail} alt="" className="object-cover w-full h-full" />
                            {post.type === "video" && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Video className="w-5 h-5 text-white drop-shadow-md" />
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">
                          {post.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
