import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../lib/api";
import PostCard from "../components/PostCard";
import { Search, Loader2, FileQuestion } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

export default function Home() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const timerRef = useRef(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [q]);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["posts", debouncedQ, selectedTag],
    queryFn: async () => {
      const token = await getToken();
      return fetchPosts({ q: debouncedQ, tag: selectedTag }, token);
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (error?.response?.status === 403) {
      const event = new CustomEvent("sessionExpired");
      window.dispatchEvent(event);
    }
  }, [error]);

  const popularTags = useMemo(
    () => Array.from(new Set((data || []).flatMap((post) => post.tags || []))).slice(0, 12),
    [data]
  );

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-300 mb-4">
            Discover Blogs
          </h1>
          <p className="text-gray-400 text-lg">
            Explore the latest posts from our community
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts by title or tag..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            )}
          </div>
          {(debouncedQ || selectedTag) && (
            <p className="text-sm text-gray-400 mt-2 ml-1">
              {debouncedQ && (
                <>
                  Searching for: <span className="text-indigo-400 font-medium">"{debouncedQ}"</span>
                </>
              )}
              {debouncedQ && selectedTag && <span className="mx-2 text-gray-600">•</span>}
              {selectedTag && (
                <>
                  Filtering tag: <span className="text-indigo-400 font-medium">#{selectedTag}</span>
                </>
              )}
            </p>
          )}
        </div>

        {popularTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Filter by tag
              </h2>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag("")}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear tag filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(active ? "" : tag)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                      active
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                        : "border-gray-700 bg-gray-900 text-gray-300 hover:border-indigo-500/40 hover:text-white"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
              {debouncedQ || selectedTag
                ? `No posts match ${selectedTag ? `#${selectedTag}` : `"${debouncedQ}"`}. Try a different filter.`
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
