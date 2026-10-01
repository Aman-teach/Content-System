"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { storage } from "@/lib/appwrite";
import { ID } from "appwrite";

export default function SubmitContent() {
  const router = useRouter();
  const { addItem, addNotification } = useContent();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [scheduleDate, setScheduleDate] = useState("");
  const [caption, setCaption] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [status, setStatus] = useState("In Review");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduleDate || !driveUrl) return;

    setLoading(true);

    try {
      let finalThumbnailUrl = "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=300&q=80";
      
      if (thumbnailFile) {
        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "6abe7d3d0014f9fdd1d6";
        const uploadedFile = await storage.createFile(bucketId, ID.unique(), thumbnailFile);
        const fileViewUrl = storage.getFileView(bucketId, uploadedFile.$id);
        finalThumbnailUrl = typeof fileViewUrl === 'string' ? fileViewUrl : fileViewUrl.toString();
      }

      await addItem({
        title,
        type: type === "Carousel" || type === "Single Post" ? "image" : "video",
        platforms: ["Instagram"],
        date: new Date(scheduleDate),
        status: status,
        caption,
        videoUrl: driveUrl,
        thumbnail: finalThumbnailUrl,
      });
      
      // Notify client only if it's sent for review
      if (status === "In Review") {
        await addNotification({
          roleContext: "client",
          type: "review",
          message: `Admin submitted '${title}' for your review.`,
          link: `/`
        });
      }

      router.push("/");
    } catch (err) {
      console.warn("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-['Helvetica',sans-serif] px-4 sm:px-0 pb-12">
      <div className="flex items-center space-x-3">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Link>
      </div>
      
      <div>
        <h1 className="font-serif text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">Submit New Content</h1>
        <p className="text-sm text-stone-500 mt-1 font-normal">Add a new post to the pipeline for client review.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-3xl border border-stone-200/70 p-6 sm:p-8 space-y-6">
        
        {/* Row 1: Title and Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Content Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-xl border border-stone-200 shadow-sm focus:border-[#4CA1AF] focus:ring-1 focus:ring-[#4CA1AF] sm:text-sm p-3 font-medium outline-none transition-all text-stone-800 placeholder:text-stone-400"
              placeholder="e.g. Behind the Scenes Vlog"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Format</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full rounded-xl border border-stone-200 shadow-sm focus:border-[#4CA1AF] focus:ring-1 focus:ring-[#4CA1AF] sm:text-sm p-3 bg-white font-medium outline-none transition-all text-stone-800"
            >
              <option value="video">Reel / Video</option>
              <option value="Story">Story</option>
              <option value="Carousel">Carousel (Images)</option>
              <option value="Single Post">Single Post</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date and Cover Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Schedule Date</label>
            <div className="flex rounded-xl shadow-sm overflow-hidden border border-stone-200 focus-within:border-[#4CA1AF] focus-within:ring-1 focus-within:ring-[#4CA1AF] transition-all bg-white">
              <span className="inline-flex items-center bg-stone-50/80 px-3.5 text-stone-400 border-r border-stone-200">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <input 
                type="date" 
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="block w-full min-w-0 flex-1 border-none focus:ring-0 sm:text-sm p-3 font-medium text-stone-800 outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Cover Image <span className="text-stone-300 font-normal ml-1">(Optional)</span></label>
            <div className="flex rounded-xl shadow-sm overflow-hidden border border-stone-200 focus-within:border-[#4CA1AF] focus-within:ring-1 focus-within:ring-[#4CA1AF] transition-all bg-white relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setThumbnailFile(file);
                    // Create a local preview URL
                    const objectUrl = URL.createObjectURL(file);
                    setThumbnailUrl(objectUrl);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center w-full min-w-0 flex-1 border-none sm:text-sm p-3 font-medium text-stone-800">
                {thumbnailUrl ? (
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailUrl} alt="Preview" className="w-6 h-6 rounded object-cover shadow-sm" />
                    <span className="text-sm truncate max-w-[150px]">{thumbnailFile?.name || "Image Selected"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-stone-400 font-normal">
                    <span className="bg-stone-100 text-stone-500 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm border border-stone-200">Browse...</span>
                    <span>Upload an image</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Drive Link and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Asset Link (Google Drive)</label>
            <div className="flex rounded-xl shadow-sm overflow-hidden border border-stone-200 focus-within:border-[#4CA1AF] focus-within:ring-1 focus-within:ring-[#4CA1AF] transition-all bg-white">
              <span className="inline-flex items-center bg-stone-50/80 px-3.5 text-stone-400 border-r border-stone-200">
                <LinkIcon className="w-4 h-4" />
              </span>
              <input 
                type="url" 
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="block w-full min-w-0 flex-1 border-none focus:ring-0 sm:text-sm p-3 font-medium text-stone-800 outline-none placeholder:font-normal placeholder:text-stone-400"
                placeholder="https://drive.google.com/file/d/.../view"
                required
              />
            </div>
            <p className="mt-2 text-[10px] text-stone-400 font-medium">
              Remember to set the Drive file permissions to <span className="font-bold text-stone-600">"Anyone with the link can view"</span>.
            </p>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Initial Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-xl border border-stone-200 shadow-sm focus:border-[#4CA1AF] focus:ring-1 focus:ring-[#4CA1AF] sm:text-sm p-3 bg-white font-medium outline-none transition-all text-stone-800"
            >
              <option value="Draft">Draft (Hidden from client)</option>
              <option value="In Review">In Review (Ready for client)</option>
            </select>
          </div>
        </div>

        {/* Row 4: Caption */}
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Instagram Caption</label>
          <textarea 
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 shadow-sm focus:border-[#4CA1AF] focus:ring-1 focus:ring-[#4CA1AF] sm:text-sm p-3.5 resize-none font-medium text-stone-800 outline-none transition-all leading-relaxed placeholder:font-normal placeholder:text-stone-400"
            placeholder="Write the caption here..."
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-transparent bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] py-3 px-8 text-sm font-semibold text-white shadow-md hover:opacity-95 focus:outline-none transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
