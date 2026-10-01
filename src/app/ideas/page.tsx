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

const initialIdeas: Idea[] = [
  { id: "1", title: "Day in the Life Vlog", description: "Let's do a quick BTS of how a standard Tuesday goes. People love authenticity.", author: "client", votes: 3 },
  { id: "2", title: "Common Mistakes Carousel", description: "3 biggest mistakes people make when trying to XYZ. High save value.", author: "admin", votes: 5 },
];

export default function IdeasPage() {
  const { role } = useRole();
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
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
          // Seed initial ideas if empty
          for (const idea of initialIdeas) {
            try {
              await databases.createDocument(
                DATABASE_ID,
                IDEAS_COLLECTION_ID,
                ID.unique(),
                {
                  title: idea.title,
                  description: idea.description,
                  author: idea.author,
                  votes: idea.votes,
                }
              );
            } catch (seedErr) {
              console.warn("Seed idea error:", seedErr);
            }
          }
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <UserCircle2 className="w-10 h-10 text-gray-300" />
            </div>
            
            <div className="flex-1 space-y-3">
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="Got a content idea? Give it a catchy title..."
                className="w-full text-lg font-bold text-gray-900 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 bg-transparent"
                required
              />
              
              {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Add some details, or drop a link to a TikTok/Reel that inspired you..."
                    rows={2}
                    className="w-full text-sm text-gray-600 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 bg-transparent resize-none"
                  />
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 flex items-center">
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
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={!newTitle.trim()}
                        className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-sm transition-colors"
                      >
                        <Send className="w-4 h-4 mr-2" />
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
          <div key={idea.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 sm:gap-5 hover:border-indigo-200 transition-colors group">
            
            {/* Upvote Column */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => toggleVote(idea.id)}
                className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-gray-50 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex-shrink-0"
              >
                <ThumbsUp className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 mb-1" />
                <span className="text-sm font-black text-gray-700 group-hover:text-indigo-600">{idea.votes}</span>
              </button>
            </div>
            
            {/* Content Column */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="text-base font-bold text-gray-900 truncate">{idea.title}</h3>
                <span className={clsx(
                  "text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide uppercase",
                  idea.author === "client" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                )}>
                  {idea.author === "client" ? "Vidhi" : "Admin"}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pr-4">
                {idea.description}
              </p>
            </div>
            
            {/* Actions Column */}
            <div className="flex items-start flex-shrink-0 pt-1">
               <button className="flex items-center text-sm font-bold text-gray-400 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                 <MessageSquare className="w-4 h-4 mr-1.5" />
                 Discuss
               </button>
            </div>
          </div>
        ))}

        {!loading && ideas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
             <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Lightbulb className="w-8 h-8 text-amber-500" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">No ideas yet</h3>
             <p className="mt-1 text-sm text-gray-500">Be the first to share a great concept!</p>
          </div>
        )}
      </div>
    </div>
  );
}
