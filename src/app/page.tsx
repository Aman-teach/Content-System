"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Clock, CheckCircle, MessageSquare, Filter, Video, XCircle } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";
import { useRole } from "@/context/RoleContext";
import { useContent } from "@/context/ContentContext";

const statusStyles = {
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  "In Review": "bg-amber-50 text-amber-800 border-amber-200/80",
  "Needs Changes": "bg-red-50 text-red-800 border-red-200/80",
  Approved: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Draft": return <Clock className="w-3.5 h-3.5 mr-1" />;
    case "In Review": return <MessageSquare className="w-3.5 h-3.5 mr-1 text-amber-600" />;
    case "Needs Changes": return <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />;
    case "Approved": return <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
    default: return null;
  }
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram": return <Video className="w-3.5 h-3.5 mr-1 text-pink-600" />;
    case "Youtube": return <Video className="w-3.5 h-3.5 mr-1 text-red-600" />;
    case "TikTok": return <span className="mr-1 text-[10px] font-bold">TikTok</span>;
    default: return <Video className="w-3.5 h-3.5 mr-1 text-stone-500" />;
  }
};

export default function Dashboard() {
  const { role } = useRole();
  const { items } = useContent();

  const [statusFilter, setStatusFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");

  const visibleItems = items.filter((item) => {
    if (role === "client" && item.status === "Draft") {
      return false;
    }
    if (statusFilter !== "All" && item.status !== statusFilter) {
      return false;
    }
    if (platformFilter !== "All" && !item.platforms.includes(platformFilter)) {
      return false;
    }
    return true;
  });

  const actionRequiredCount = items.filter(i => i.status === 'Needs Changes').length;
  const waitingOnClientCount = items.filter(i => i.status === 'In Review').length;
  const readyToPublishCount = items.filter(i => i.status === 'Approved').length;

  return (
    <div className="space-y-8 font-['Helvetica',sans-serif]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">Content Pipeline</h1>
          <p className="text-sm text-stone-500 mt-1 font-normal">
            Coordinate and track your upcoming posts.
          </p>
        </div>

        {role === "admin" && (
          <Link 
            href="/submit" 
            className="inline-flex items-center px-4 py-2.5 rounded-xl shadow-md shadow-[#2C3E50]/15 text-sm font-semibold text-white bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] hover:opacity-95 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Content
          </Link>
        )}
      </div>

      {/* Quick Metrics (Admin) */}
      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#2C3E50]/40 transition-all" onClick={() => setStatusFilter("All")}>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Action Required (You)</p>
              <h2 className="font-serif text-3xl font-normal text-stone-900 mt-1">{actionRequiredCount}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#2C3E50]/40 transition-all" onClick={() => setStatusFilter("In Review")}>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Waiting on Client</p>
              <h2 className="font-serif text-3xl font-normal text-stone-900 mt-1">{waitingOnClientCount}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#2C3E50]/40 transition-all" onClick={() => setStatusFilter("Approved")}>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Ready to Publish</p>
              <h2 className="font-serif text-3xl font-normal text-stone-900 mt-1">{readyToPublishCount}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-2.5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border border-stone-200/70 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 px-2">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Filter By:</span>
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border-stone-200 rounded-xl py-2 pl-3 pr-8 bg-stone-50/80 shadow-sm font-semibold text-stone-700 outline-none border focus:ring-1 focus:ring-[#4CA1AF]"
          >
            <option value="All">All Statuses</option>
            {role === "admin" && <option value="Draft">Draft</option>}
            <option value="In Review">In Review</option>
            <option value="Needs Changes">Needs Changes</option>
            <option value="Approved">Approved</option>
          </select>

          <select 
            value={platformFilter} 
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="text-xs border-stone-200 rounded-xl py-2 pl-3 pr-8 bg-stone-50/80 shadow-sm font-semibold text-stone-700 outline-none border focus:ring-1 focus:ring-[#4CA1AF]"
          >
            <option value="All">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="Youtube">YouTube</option>
            <option value="TikTok">TikTok</option>
            <option value="Linkedin">LinkedIn</option>
          </select>
        </div>
        
        <div className="text-xs font-semibold text-stone-400 px-2">
          Showing {visibleItems.length} {visibleItems.length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      {/* Grid of Post Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-stone-200/70 flex flex-col hover:shadow-md hover:border-stone-300 transition-all duration-200 group overflow-hidden">
            <div className="px-6 py-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-semibold", statusStyles[item.status as keyof typeof statusStyles])}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </span>
                <div className="flex flex-wrap justify-end gap-1 max-w-[50%]">
                  {item.platforms.map(platform => (
                    <span key={platform} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-50 text-stone-600 border border-stone-200/60">
                      {getPlatformIcon(platform)}
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
              
              <h3 className="font-serif text-2xl font-normal text-stone-900 leading-snug mb-1 group-hover:text-[#2C3E50] transition-colors line-clamp-2">{item.title}</h3>
              <p className="text-xs font-semibold text-[#4CA1AF] mb-4">
                {format(item.date, "MMM d, yyyy 'at' h:mm a")}
              </p>
              
              {item.caption && (
                <div className="bg-stone-50/70 rounded-xl p-3.5 border border-stone-200/50 mt-auto">
                  <h4 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Caption Snippet</h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-stone-50/50 px-6 py-4 flex justify-between items-center border-t border-stone-100 rounded-b-2xl">
              <div className="flex items-center text-xs font-semibold text-stone-400">
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Notes
              </div>
              <Link href={`/review/${item.id}`} className="text-xs font-bold text-[#2C3E50] hover:text-[#4CA1AF] transition-colors">
                {role === "client" && item.status === "In Review" ? "Review Now →" : "View Details →"}
              </Link>
            </div>
          </div>
        ))}

        {visibleItems.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-stone-200 border-dashed">
            <Filter className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <h3 className="font-serif text-2xl text-stone-900 font-normal">No content found</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto font-normal">
              We couldn&apos;t find any posts matching your current filters. Try changing the status or platform.
            </p>
            <button 
              onClick={() => { setStatusFilter("All"); setPlatformFilter("All"); }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-stone-300 shadow-sm text-xs font-semibold rounded-xl text-stone-700 bg-white hover:bg-stone-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
