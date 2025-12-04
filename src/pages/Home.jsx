import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../lib/api";
import PostCard from "../components/PostCard";
import { Search, Loader2, FileQuestion } from "lucide-react";

export default function Home() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const timerRef = useRef(null);

  // Manual debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [q]);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["posts", debouncedQ],
    queryFn: () => fetchPosts({ q: debouncedQ }),
    keepPreviousData: true,
  });

  // Check for 403 session expired error
  useEffect(() => {
    if (error?.response?.status === 403) {
      // Show session expired message
      const event = new CustomEvent('sessionExpired');
      window.dispatchEvent(event);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Discover Amazing Stories
          </h1>
          <p className="text-gray-400 text-lg">
            Explore the latest posts from our community
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts by title..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          {debouncedQ && (
            <p className="text-sm text-gray-400 mt-2 ml-1">
              Searching for: <span className="text-indigo-400 font-medium">"{debouncedQ}"</span>
            </p>
          )}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-400 mb-4" size={48} />
            <p className="text-gray-400 text-lg">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <div className="text-red-400 mb-2">
              {error?.response?.status === 403 
                ? "Your session has expired. Please login again." 
                : "Failed to load posts. Please try again."}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gray-800 rounded-full p-6 mb-6">
              <FileQuestion className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Posts Found</h3>
            <p className="text-gray-400 text-center max-w-md">
              {debouncedQ 
                ? `No posts match "${debouncedQ}". Try a different search term.`
                : "No posts available yet. Be the first to create one!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {data.map((p) => (
              <PostCard post={p} key={p._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}