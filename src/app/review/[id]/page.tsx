"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, MessageSquare, Clock, DownloadCloud, Send, UserCircle2, Pencil, Trash2, X, Save } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

// Helper function to extract Drive ID and format preview URL
function getDriveEmbedUrl(url: string) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url; // fallback to original if parsing fails
}

type Comment = {
  $id: string;
  postId: string;
  author: string;
  text: string;
  $createdAt: string;
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6abd15200019b4edff61";
const COMMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID || "6abd38c4002d235460d5";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const { items, updateItemStatus, updateItemDetails, updateItemDate, deleteItem, addNotification } = useContent();
  const { role, user } = useAuth();
  
  const content = items.find(i => i.id === id);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editDate, setEditDate] = useState("");

  // Initialize edit state when entering edit mode
  const handleEditClick = () => {
    if (!content) return;
    setEditTitle(content.title);
    setEditCaption(content.caption || "");
    setEditVideoUrl(content.videoUrl || "");
    setEditDate(format(new Date(content.date), "yyyy-MM-dd"));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!content) return;
    setIsUpdatingStatus(true);
    
    try {
      await updateItemDetails(id, {
        title: editTitle,
        caption: editCaption,
        videoUrl: editVideoUrl,
      });
      if (editDate) {
        await updateItemDate(id, new Date(editDate));
      }
    } catch (err) {
      console.error(err);
    }
    
    setIsEditing(false);
    setIsUpdatingStatus(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    setIsUpdatingStatus(true);
    await deleteItem(id);
    router.push("/");
  };

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COMMENTS_COLLECTION_ID,
          [
            Query.equal("postId", id),
            Query.orderAsc("$createdAt")
          ]
        );
        setComments(response.documents as unknown as Comment[]);
      } catch (err: unknown) {
        const appwriteErr = err as { code?: number };
        if (appwriteErr.code !== 401) {
          console.warn("Failed to load comments:", err);
        }
      }
    }
    fetchComments();
  }, [id]);

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-['Helvetica',sans-serif]">
        <h2 className="font-serif text-3xl text-stone-900">Post not found</h2>
        <Link href="/" className="mt-4 text-xs font-semibold text-[#2C3E50] hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const isVertical = content.type === 'Reel' || content.type === 'TikTok' || content.type === 'Story';
  const embedUrl = getDriveEmbedUrl(content.videoUrl || "");
  const isDriveLink = !!embedUrl;

  const handleApprove = async () => {
    setIsUpdatingStatus(true);
    await updateItemStatus(id, "Approved");
    
    // Notify admin
    await addNotification({
      roleContext: "admin",
      type: "status",
      message: `Vidhi approved '${content.title}' for publishing!`,
      link: `/review/${id}`
    });
    setIsUpdatingStatus(false);
  };

  const handleRequestChanges = async () => {
    setIsUpdatingStatus(true);
    await updateItemStatus(id, "Needs Changes");

    // Notify admin
    await addNotification({
      roleContext: "admin",
      type: "status",
      message: `Vidhi requested changes on '${content.title}'`,
      link: `/review/${id}`
    });
    setIsUpdatingStatus(false);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);

    const authorName = user?.name || (role === "admin" ? "Admin" : "Vidhi");

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId: id,
          author: authorName,
          text: newComment,
        }
      );

      setComments(prev => [...prev, doc as unknown as Comment]);
      
      // Notify the other person
      await addNotification({
        roleContext: role === "admin" ? "client" : "admin",
        type: "comment",
        message: `${authorName} left a comment on '${content.title}'`,
        link: `/review/${id}`
      });
      
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to send comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-['Helvetica',sans-serif] pb-12">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Link>
        
        {/* Admin Controls */}
        {role === "admin" && !isEditing && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleEditClick}
              className="inline-flex items-center text-xs font-semibold text-stone-700 bg-white border border-stone-200/80 hover:bg-stone-50 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
              Edit
            </button>
            <button 
              onClick={handleDelete}
              className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50/70 hover:bg-red-100 border border-red-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-normal text-stone-900">Edit Post</h2>
            <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-500">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Title</label>
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-stone-200 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#4CA1AF]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Date</label>
              <input 
                type="date" 
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-xl border border-stone-200 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#4CA1AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Video URL (Google Drive)</label>
              <input 
                type="url" 
                value={editVideoUrl}
                onChange={(e) => setEditVideoUrl(e.target.value)}
                className="w-full rounded-xl border border-stone-200 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#4CA1AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Caption</label>
              <textarea 
                rows={4}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full rounded-xl border border-stone-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#4CA1AF] resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveEdit}
                disabled={isUpdatingStatus}
                className="inline-flex items-center px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] hover:opacity-95 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdatingStatus ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 border-b border-stone-200/70 pb-6">
            <div>
              <h1 className="font-serif text-4xl lg:text-5xl font-normal text-stone-900 mb-3">{content.title}</h1>
              <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200/60">
                    {content.type}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${content.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80' : 'bg-amber-50 text-amber-800 border-amber-200/80'}`}>
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {content.status}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200/60">
                    {format(content.date, "MMM d, yyyy")}
                  </span>
                  {content.platforms.map(p => (
                    <span key={p} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-stone-600 bg-stone-100/70 border border-stone-200/50">
                      {p}
                    </span>
                  ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/share/${content.id}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert("Client Share Link copied to clipboard!");
                }}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] hover:opacity-95 shadow-md shadow-[#2C3E50]/15 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Share with Client
              </button>

              {isDriveLink && (
                <a 
                  href={content.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-200/80 hover:bg-stone-50 shadow-sm transition-all"
                >
                  <DownloadCloud className="w-4 h-4 mr-2 text-stone-500" />
                  Download
                </a>
              )}
            </div>
          </div>

          {/* Main Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Media & Context */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Media Player */}
              <div className="bg-white rounded-[2rem] p-4 sm:p-8 border border-stone-200/70 shadow-sm flex justify-center items-center w-full relative">
                 <div className={`relative rounded-2xl overflow-hidden shadow-xl bg-black ${isVertical ? "w-full max-w-[360px] aspect-[9/16]" : "w-full aspect-video"}`}>
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

              {/* Caption Context */}
              <div className="bg-white rounded-2xl border border-stone-200/70 p-6 sm:p-8 shadow-sm">
                <h3 className="font-serif text-2xl text-stone-900 mb-4 flex items-center">
                  Caption
                </h3>
                <div className="bg-stone-50/70 rounded-xl p-5 border border-stone-200/50">
                  <p className="text-stone-800 whitespace-pre-wrap leading-relaxed text-sm font-normal">
                    {content.caption}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Communication */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Review Actions */}
              <div className="bg-white rounded-2xl border border-stone-200/70 p-6 shadow-sm sticky top-24">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-5">Your Decision</h3>
                <div className="space-y-3">
                  {content.status !== 'Approved' ? (
                    <button 
                      onClick={handleApprove}
                      disabled={isUpdatingStatus}
                      className="w-full flex justify-center items-center px-4 py-3.5 rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {isUpdatingStatus ? "Updating..." : "Approve for Publishing"}
                    </button>
                  ) : (
                    <div className="w-full flex justify-center items-center px-4 py-3.5 border border-emerald-200 rounded-xl shadow-sm text-sm font-semibold text-emerald-800 bg-emerald-50">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approved
                    </div>
                  )}
                  
                  <button 
                    onClick={handleRequestChanges}
                    disabled={isUpdatingStatus}
                    className="w-full flex justify-center items-center px-4 py-3.5 border border-stone-200/80 rounded-xl text-sm font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors disabled:opacity-50"
                  >
                    <MessageSquare className="w-5 h-5 mr-2 text-stone-500" />
                    Request Changes
                  </button>
                </div>
              </div>

              {/* Activity / Feedback Thread */}
              <div className="bg-white rounded-2xl border border-stone-200/70 flex flex-col shadow-sm h-[500px]">
                <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 rounded-t-2xl">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Feedback History</h3>
                  <span className="bg-[#4CA1AF]/15 text-[#2C3E50] text-xs font-semibold px-2.5 py-0.5 rounded-full">{comments.length} Notes</span>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
                  {comments.length === 0 ? (
                    <div className="text-center text-stone-400 text-xs font-normal mt-10">No feedback yet.</div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.$id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200/60 flex items-center justify-center flex-shrink-0 mt-1">
                          <UserCircle2 className="w-5 h-5 text-[#2C3E50]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-stone-900">{comment.author}</span>
                            <span className="text-[10px] text-stone-400 font-normal">
                              {format(new Date(comment.$createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <div className="bg-stone-100/70 rounded-2xl rounded-tl-sm p-3.5 text-sm text-stone-800 leading-relaxed border border-stone-200/50 font-normal">
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-stone-100 bg-stone-50/50 rounded-b-2xl">
                  <div className="relative">
                    <textarea 
                      rows={2}
                      placeholder="Type your feedback or reply..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendComment();
                        }
                      }}
                      className="block w-full rounded-xl border-stone-200 shadow-sm focus:border-[#4CA1AF] focus:ring-[#4CA1AF] text-sm resize-none pr-12 p-3 bg-white font-normal outline-none"
                    />
                    <button 
                      onClick={handleSendComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="absolute bottom-2.5 right-2.5 p-2 bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] text-white rounded-lg hover:opacity-95 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
