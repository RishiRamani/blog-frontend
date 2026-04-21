import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export default function PostCard({ post }) {
  const excerpt = post.content.slice(0, 150) + (post.content.length > 150 ? "..." : "");

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <article className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-indigo-500/10">
      <div className="relative w-full h-56 overflow-hidden">
        {post.bannerImage ? (
          <img
            src={post.bannerImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-gray-600 text-5xl font-bold">
              {post.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gray-950/20" />
      </div>

      <div className="p-5 sm:p-6">
        <Link
          to={`/post/${post.slug}`}
          className="text-xl sm:text-2xl font-bold text-white hover:text-indigo-400 transition-colors duration-200 line-clamp-2 block mb-2"
        >
          {post.title}
        </Link>

        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Calendar size={14} />
          <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
        </div>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3 overflow-hidden markdown-excerpt"
          data-color-mode="dark"
          style={{ maxHeight: "4.5em" }}
        >
          <div className="prose prose-invert prose-sm max-w-none prose-p:m-0 prose-headings:m-0 prose-ul:m-0 prose-ol:m-0">
            <MDEditor.Markdown source={excerpt} />
          </div>
        </div>

        <Link
          to={`/post/${post.slug}`}
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200 group/link"
        >
          Read more
          <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </article>
  );
}
