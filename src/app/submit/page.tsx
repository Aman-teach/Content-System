"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { useContent } from "@/context/ContentContext";

export default function SubmitContent() {
  const router = useRouter();
  const { addItem, addNotification } = useContent();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [scheduleDate, setScheduleDate] = useState("");
  const [caption, setCaption] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduleDate || !driveUrl) return;

    setLoading(true);

    try {
      await addItem({
        title,
        type: type === "Carousel" || type === "Single Post" ? "image" : "video",
        platforms: ["Instagram"],
        date: new Date(scheduleDate),
        status: "In Review",
        caption,
        videoUrl: driveUrl,
        thumbnail: "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=300&q=80",
      });
      
      // Notify client
      await addNotification({
        roleContext: "client",
        type: "review",
        message: `Admin submitted '${title}' for your review.`,
        link: `/`
      });

      router.push("/");
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Submit New Content</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700">Content Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 font-medium"
            placeholder="e.g. October Launch Reel"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Format</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 bg-white font-medium"
            >
              <option value="video">Reel / Video</option>
              <option value="Story">Story</option>
              <option value="Carousel">Carousel (Images)</option>
              <option value="Single Post">Single Post</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">Schedule Date</label>
            <div className="mt-1 flex rounded-xl shadow-sm overflow-hidden border border-gray-300">
              <span className="inline-flex items-center bg-gray-50 px-3 text-gray-500 border-r border-gray-300">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <input 
                type="date" 
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="block w-full min-w-0 flex-1 border-none focus:ring-0 sm:text-sm p-3 font-medium"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Google Drive Link (Video/Asset)</label>
          <div className="mt-1 flex rounded-xl shadow-sm overflow-hidden border border-gray-300">
            <span className="inline-flex items-center bg-gray-50 px-3 text-gray-500 border-r border-gray-300">
              <LinkIcon className="w-4 h-4" />
            </span>
            <input 
              type="url" 
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="block w-full min-w-0 flex-1 border-none focus:ring-0 sm:text-sm p-3 font-medium"
              placeholder="https://drive.google.com/file/d/.../view"
              required
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500 font-medium">
            Remember to set the Drive file permissions to <span className="text-gray-800">&quot;Anyone with the link can view&quot;</span>.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Instagram Caption</label>
          <textarea 
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 resize-none font-medium"
            placeholder="Write the caption here..."
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 py-3 px-6 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          >
            {loading ? "Saving to Appwrite..." : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
