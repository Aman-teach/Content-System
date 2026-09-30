"use client";

import { use } from "react";

import { CheckCircle, MessageSquare, Clock, DownloadCloud, Send, UserCircle2 } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { format } from "date-fns";

function getDriveEmbedUrl(url: string) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url; 
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { items } = useContent();
  
  const content = items.find(i => i.id === id);

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Post not found</h2>
        <p className="mt-4 text-gray-500">This link may have expired or the content was removed.</p>
      </div>
    );
  }

  const embedUrl = content.videoUrl ? getDriveEmbedUrl(content.videoUrl) : null;
  const isDriveLink = embedUrl && embedUrl.includes("drive.google.com");
  const isVertical = content.type === "video" || content.type === "Reel" || content.type === "Story";

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-0 py-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{content.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                {content.type}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {content.status}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                {format(content.date, "MMM d, yyyy")}
              </span>
              {content.platforms.map(p => (
                <span key={p} className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-gray-600 bg-gray-100">
                  {p}
                </span>
              ))}
          </div>
        </div>
        
        {isDriveLink && (
          <div className="flex-shrink-0 flex items-center gap-3">
            <a 
              href={content.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-bold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <DownloadCloud className="w-4 h-4 mr-2 text-gray-500" />
              Download
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-gray-100 rounded-[2rem] p-4 sm:p-8 border border-gray-200 shadow-inner flex justify-center items-center w-full relative">
             <div className={`relative rounded-xl overflow-hidden shadow-2xl bg-black ${isVertical ? "w-full max-w-[360px] aspect-[9/16]" : "w-full aspect-video"}`}>
               {isDriveLink ? (
                 <iframe 
                   src={embedUrl} 
                   className="absolute inset-0 w-full h-full border-0" 
                   allow="autoplay"
                   title="Google Drive Preview"
                 ></iframe>
               ) : (
                 <video controls className="absolute inset-0 w-full h-full">
                   <source src={content.videoUrl} type="video/mp4" />
                   Your browser does not support HTML video.
                 </video>
               )}
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              Instagram Caption
            </h3>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">
                {content.caption}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-12">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Your Decision</h3>
            <div className="space-y-3">
              <button className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve for Publishing
              </button>
              <button className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                Request Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm h-[500px]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Feedback History</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">1 Note</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <UserCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-900">Vidhi (Client)</span>
                    <span className="text-[10px] text-gray-400 font-medium">Oct 1, 2:30 PM</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3.5 text-sm text-gray-800 leading-relaxed border border-gray-200">
                    Can we make the first 2 seconds of the video a bit faster? The hook feels slightly slow right now.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="relative">
                <textarea 
                  rows={2}
                  placeholder="Type your feedback or reply..."
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none pr-12 p-3 bg-white"
                />
                <button className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
