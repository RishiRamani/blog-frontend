import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export default function PostCard({ post }) {
  // first 150 chars of content for excerpt
  const excerpt = post.content.slice(0, 150) + (post.content.length > 150 ? "..." : "");
  
  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <article className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-indigo-500/10">
      <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
        {/* Image Section */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
          {post.bannerImage ? (
            <img 
              src={post.bannerImage} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
              <div className="text-gray-600 text-4xl font-bold">
                {post.title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent sm:hidden" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 sm:py-4">
          <Link 
            to={`/post/${post.slug}`} 
            className="text-xl sm:text-2xl font-bold text-white hover:text-indigo-400 transition-colors duration-200 line-clamp-2 block mb-2"
          >
            {post.title}
          </Link>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Calendar size={14} />
            <time dateTime={post.updatedAt}>
              {formatDate(post.updatedAt)}
            </time>
          </div>
          
          {/* Markdown Rendered Excerpt with forced background match */}
          <div 
            className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3 overflow-hidden markdown-excerpt"
            data-color-mode="dark"
            style={{ maxHeight: '4.5em' }}
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
      </div>
      
      <style jsx>{`
        .markdown-excerpt :global(*) {
          background-color: transparent !important;
          background: none !important;
        }
        
        .markdown-excerpt :global(code) {
          background-color: rgba(55, 65, 81, 0.5) !important;
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        .markdown-excerpt :global(pre) {
          background-color: rgba(31, 41, 55, 0.5) !important;
        }
      `}</style>
    </article>
  );
}