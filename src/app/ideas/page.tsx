"use client";

import { useState, useEffect } from "react";
import { Lightbulb, MessageSquare, ThumbsUp, Send, UserCircle2, Sparkles, TrendingUp } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import clsx from "clsx";

type Idea = {
  id: string;
  title: string;
  description: string;
  author: "admin" | "client";
  votes: number;
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6abd15200019b4edff61";
const IDEAS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_IDEAS_COLLECTION_ID || "6abd17ad002b014cbcc8";

export default function IdeasPage() {
  const { role } = useRole();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch ideas from Appwrite
  useEffect(() => {
    async function fetchIdeas() {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          IDEAS_COLLECTION_ID,
          [Query.orderDesc("$createdAt"), Query.limit(100)]
        );

        if (response.documents.length > 0) {
          const loadedIdeas: Idea[] = response.documents.map((doc: Record<string, unknown>) => ({
            id: doc.$id as string,
            title: doc.title as string,
            description: (doc.description as string) || "",
            author: doc.author as "admin" | "client",
            votes: (doc.votes as number) || 0,
          }));
          setIdeas(loadedIdeas);
        } else {
          setIdeas([]);
        }
      } catch (err: unknown) {
        const appwriteErr = err as { code?: number };
        if (appwriteErr.code !== 401) {
          console.warn("Failed to load ideas from Appwrite:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchIdeas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tempId = Date.now().toString();
    const newIdeaItem: Idea = {
      id: tempId,
      title: newTitle,
      description: newDesc,
      author: role as "admin" | "client",
      votes: 1,
    };

    setIdeas((prev) => [newIdeaItem, ...prev]);
    setNewTitle("");
    setNewDesc("");
    setIsExpanded(false);

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        IDEAS_COLLECTION_ID,
        ID.unique(),
        {
          title: newIdeaItem.title,
          description: newIdeaItem.description,
          author: newIdeaItem.author,
          votes: 1,
        }
      );

      setIdeas((prev) =>
        prev.map((item) => (item.id === tempId ? { ...item, id: doc.$id } : item))
      );
    } catch (err) {
      console.error("Failed to save idea to Appwrite:", err);
    }
  };

  const toggleVote = async (id: string) => {
    const targetIdea = ideas.find((i) => i.id === id);
    if (!targetIdea) return;

    const newVotes = targetIdea.votes + 1;

    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, votes: newVotes } : idea))
    );

    try {
      await databases.updateDocument(
        DATABASE_ID,
        IDEAS_COLLECTION_ID,
        id,
        { votes: newVotes }
      );
    } catch (err) {
      console.error("Failed to update votes in Appwrite:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-['Helvetica',sans-serif]">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight flex items-center">
          <Sparkles className="w-8 h-8 mr-3 text-amber-500" />
          Content Brainstorm
        </h1>
        <p className="text-sm text-stone-500 mt-1 font-normal">
          Drop inspiration, requests, and concepts for future content. Upvote the best ones!
        </p>
      </div>

      {/* Modern Sleek Input Area */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-[#4CA1AF] focus-within:border-[#4CA1AF]">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <UserCircle2 className="w-10 h-10 text-stone-300" />
            </div>
            
            <div className="flex-1 space-y-3">
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="Got a content idea? Give it a catchy title..."
                className="w-full text-base font-semibold text-stone-900 placeholder-stone-400 border-none outline-none focus:ring-0 p-0 bg-transparent"
                required
              />
              
              {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Add some details, or drop a link to a TikTok/Reel that inspired you..."
                    rows={2}
                    className="w-full text-sm font-normal text-stone-600 placeholder-stone-400 border-none outline-none focus:ring-0 p-0 bg-transparent resize-none"
                  />
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100">
                    <span className="text-xs font-semibold text-stone-400 flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      Ideas with details perform 3x better
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsExpanded(false);
                          setNewTitle("");
                          setNewDesc("");
                        }} 
                        className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={!newTitle.trim()}
                        className="inline-flex items-center px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Post Idea
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Ideas Feed */}
      <div className="space-y-4">
        {ideas.map((idea) => (
          <div key={idea.id} className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-sm flex gap-4 sm:gap-5 hover:border-[#4CA1AF] transition-colors group">
            
            {/* Upvote Column */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => toggleVote(idea.id)}
                className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-stone-50 border border-stone-200/60 hover:bg-stone-100 hover:text-[#2C3E50] transition-all flex-shrink-0"
              >
                <ThumbsUp className="w-4 h-4 text-stone-400 group-hover:text-[#2C3E50] mb-1" />
                <span className="text-xs font-semibold text-stone-700 group-hover:text-[#2C3E50]">{idea.votes}</span>
              </button>
            </div>
            
            {/* Content Column */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="text-base font-semibold text-stone-900 truncate">{idea.title}</h3>
                <span className={clsx(
                  "text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase",
                  idea.author === "client" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-purple-50 text-purple-700 border border-purple-200/60"
                )}>
                  {idea.author === "client" ? "Vidhi" : "Admin"}
                </span>
              </div>
              <p className="text-sm font-normal text-stone-600 leading-relaxed pr-4">
                {idea.description}
              </p>
            </div>
            
            {/* Actions Column */}
            <div className="flex items-start flex-shrink-0 pt-1">
               <button className="flex items-center text-xs font-semibold text-stone-400 hover:text-[#2C3E50] px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors">
                 <MessageSquare className="w-4 h-4 mr-1.5" />
                 Discuss
               </button>
            </div>
          </div>
        ))}

        {!loading && ideas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/70 border-dashed">
             <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Lightbulb className="w-8 h-8 text-amber-500" />
             </div>
             <h3 className="text-base font-semibold text-stone-900">No ideas yet</h3>
             <p className="mt-1 text-xs text-stone-500 font-normal">Be the first to share a great concept!</p>
          </div>
        )}
      </div>
    </div>
  );
}
