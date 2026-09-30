"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, CheckCircle, MessageSquare, FileText, PlusCircle, XCircle, Filter } from "lucide-react";
import { FaInstagram, FaYoutube, FaLinkedin, FaTiktok } from "react-icons/fa";
import clsx from "clsx";
import { useRole } from "@/context/RoleContext";
import { useContent } from "@/context/ContentContext";

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram": return <FaInstagram key={platform} className="w-3.5 h-3.5 text-pink-600 mr-1" />;
    case "Youtube": return <FaYoutube key={platform} className="w-3.5 h-3.5 text-red-600 mr-1" />;
    case "Linkedin": return <FaLinkedin key={platform} className="w-3.5 h-3.5 text-blue-600 mr-1" />;
    case "TikTok": return <FaTiktok key={platform} className="w-3.5 h-3.5 text-gray-800 mr-1" />;
    default: return <FileText key={platform} className="w-3.5 h-3.5 text-gray-500 mr-1" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Draft": return <Clock className="w-4 h-4 mr-1.5" />;
    case "In Review": return <MessageSquare className="w-4 h-4 mr-1.5" />;
    case "Approved": return <CheckCircle className="w-4 h-4 mr-1.5" />;
    case "Needs Changes": return <XCircle className="w-4 h-4 mr-1.5" />;
    default: return <Clock className="w-4 h-4 mr-1.5" />;
  }
};

const statusStyles = {
  "Draft": "bg-gray-100 text-gray-700 border-gray-200",
  "In Review": "bg-amber-50 text-amber-700 border-amber-200",
  "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Needs Changes": "bg-red-50 text-red-700 border-red-200"
};

export default function Dashboard() {
  const { role } = useRole();
  const { items } = useContent();
  const [statusFilter, setStatusFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");

  // If client, hide drafts. If admin, show all.
  const baseItems = role === "client" 
    ? items.filter(item => item.status !== "Draft")
    : items;

  const visibleItems = baseItems.filter(post => {
    if (statusFilter !== "All" && post.status !== statusFilter) return false;
    if (platformFilter !== "All" && !post.platforms.includes(platformFilter)) return false;
    return true;
  });

  const actionRequiredCount = role === "admin" 
    ? baseItems.filter(i => i.status === "Needs Changes").length 
    : baseItems.filter(i => i.status === "In Review").length;

  const waitingOnClientCount = role === "admin"
    ? baseItems.filter(i => i.status === "In Review").length 
    : baseItems.filter(i => i.status === "Needs Changes" || i.status === "Draft").length;

  const readyToPublishCount = baseItems.filter(i => i.status === "Approved").length;

  return (
    <div className="space-y-8 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Content Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === "admin" ? "Coordinate and track your upcoming posts." : "Review and approve upcoming content."}
          </p>
        </div>
        {role === "admin" && (
          <Link 
            href="/submit" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Content
          </Link>
        )}
      </div>

      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setStatusFilter("All")}>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action Required (You)</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{actionRequiredCount}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setStatusFilter("In Review")}>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Waiting on Client</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{waitingOnClientCount}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setStatusFilter("Approved")}>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ready to Publish</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{readyToPublishCount}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-2 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border border-gray-200">
        <div className="flex items-center space-x-4 px-2">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filter By:</span>
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm font-medium outline-none border-none"
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
            className="text-sm border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm font-medium outline-none border-none"
          >
            <option value="All">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="Youtube">YouTube</option>
            <option value="TikTok">TikTok</option>
            <option value="Linkedin">LinkedIn</option>
          </select>
        </div>
        
        <div className="text-sm font-medium text-gray-500 px-2">
          Showing {visibleItems.length} {visibleItems.length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-all duration-200 group">
            <div className="px-5 py-5 sm:p-6 flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-2">
                  <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold", statusStyles[item.status as keyof typeof statusStyles])}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </div>
                <div className="flex flex-wrap justify-end gap-1 max-w-[50%]">
                  {item.platforms.map(platform => (
                    <span key={platform} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                      {getPlatformIcon(platform)}
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{item.title}</h3>
              <p className="text-sm font-bold text-indigo-500 mb-4">
                {format(item.date, "MMM d, yyyy 'at' h:mm a")}
              </p>
              
              {item.caption && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mt-auto">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caption Snippet</h4>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-5 py-4 flex justify-between items-center border-t border-gray-200 rounded-b-2xl">
              <div className="flex items-center text-sm font-semibold text-gray-500">
                <MessageSquare className="w-4 h-4 mr-1.5" />
                {item.id === "1" ? "2 Comments" : "0 Comments"}
              </div>
              <Link href={`/review/${item.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                {role === "client" && item.status === "In Review" ? "Review Now →" : "View Details →"}
              </Link>
            </div>
          </div>
        ))}

        {visibleItems.length === 0 && (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-gray-200 border-dashed">
            <Filter className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No content found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              We couldn&apos;t find any posts matching your current filters. Try changing the status or platform.
            </p>
            <button 
              onClick={() => { setStatusFilter("All"); setPlatformFilter("All"); }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
