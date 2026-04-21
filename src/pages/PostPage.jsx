import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addCommentToPost, fetchPostBySlug } from "../lib/api";
import MDEditor from "@uiw/react-md-editor";
import { Calendar, Share2, Check, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";

// Toast Notification Component
function Toast({ message, type = "success", onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top duration-300 ${
      type === "error" 
        ? "bg-red-900/90 border-red-700 text-red-100" 
        : "bg-green-900/90 border-green-700 text-green-100"
    }`}>
      {type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
}

export default function PostPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [toast, setToast] = useState(null);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug),
  });

  // Check for 403 session expired error
  useEffect(() => {
    if (error?.response?.status === 403) {
      setToast({ 
        message: "Your session has expired. Please login again.", 
        type: "error" 
      });
      setTimeout(() => nav("/login"), 2000);
    }
  }, [error, nav]);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onShare = async () => {
    const shareData = {
      title: post.title,
      text: post.title,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setToast({ message: "Shared successfully!", type: "success" });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setToast({ message: "Link copied to clipboard!", type: "success" });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setToast({ message: "Failed to share", type: "error" });
      }
    }
  };

  const formatCommentDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const authorName =
    user?.fullName ||
    user?.username ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Reader";

  const submitComment = async (event) => {
    event.preventDefault();
    const trimmed = comment.trim();

    if (!trimmed) {
      setToast({ message: "Write a comment before posting.", type: "error" });
      return;
    }

    if (!isSignedIn) {
      setToast({ message: "Please sign in to leave a comment.", type: "error" });
      return;
    }

    setIsSubmittingComment(true);

    try {
      const token = await getToken();
      await addCommentToPost(slug, { authorName, content: trimmed }, token);
      setComment("");
      await qc.invalidateQueries({ queryKey: ["post", slug] });
      setToast({ message: "Comment posted.", type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Failed to post comment.", type: "error" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-lg">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-gray-800 rounded-full p-6 inline-block mb-6">
            <AlertCircle className="text-gray-400" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Post Not Found</h2>
          <p className="text-gray-400 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => nav("/")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => nav("/")}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back to posts
        </button>

        {/* Article Card */}
        <article className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Banner Image */}
          {post.bannerImage && (
            <div className="relative w-full h-64 sm:h-96 overflow-hidden">
              <img 
                src={post.bannerImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gray-950/20" />
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-10">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-800">
              <Calendar size={16} />
              <time dateTime={post.updatedAt}>
                Last updated: {formatDate(post.updatedAt)}
              </time>
            </div>

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Markdown Content */}
            <div 
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-headings:font-bold
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-indigo-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
                prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-400
                prose-hr:border-gray-800
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:text-gray-300
                prose-img:rounded-lg prose-img:shadow-lg
                [&_.wmde-markdown]:!bg-transparent"
              data-color-mode="dark"
            >
              <MDEditor.Markdown source={post.content} />
            </div>

            {/* Share Button */}
            <div className="mt-10 pt-8 border-t border-gray-800">
              <button
                onClick={onShare}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
              >
                <Share2 size={20} />
                Share this post
              </button>
            </div>

            <section className="mt-10 pt-8 border-t border-gray-800">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Comments ({post.comments?.length || 0})
                </h2>
                {!isSignedIn && (
                  <button
                    onClick={() => nav("/login")}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Sign in to comment
                  </button>
                )}
              </div>

              <form onSubmit={submitComment} className="mb-8">
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={isSignedIn ? "Share your thoughts about this post..." : "Sign in to join the discussion"}
                  disabled={!isSignedIn || isSubmittingComment}
                  rows={4}
                  className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Comments are posted under {authorName}.
                  </p>
                  <button
                    type="submit"
                    disabled={!isSignedIn || isSubmittingComment || comment.trim().length < 2}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    {isSubmittingComment ? "Posting..." : "Post comment"}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {post.comments?.length ? (
                  post.comments
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <article
                        key={entry._id}
                        className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5"
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-white">{entry.authorName}</p>
                            <p className="text-sm text-gray-500">{formatCommentDate(entry.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {entry.content}
                        </p>
                      </article>
                    ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-950/40 p-8 text-center">
                    <p className="text-gray-400">
                      No comments yet. Start the conversation.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
