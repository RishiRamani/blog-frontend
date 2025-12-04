import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyPosts, updatePost, deletePost } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { Edit3, Trash2, Eye, EyeOff, Calendar, Loader2, FileText, AlertCircle } from "lucide-react";

// Toast Notification Component
function Toast({ message, type = "error", onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top duration-300 ${
      type === "error" 
        ? "bg-red-900/90 border-red-700 text-red-100" 
        : type === "success"
        ? "bg-green-900/90 border-green-700 text-green-100"
        : "bg-blue-900/90 border-blue-700 text-blue-100"
    }`}>
      <AlertCircle size={20} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyPosts() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["myPosts"],
    queryFn: fetchMyPosts,
  });

  // Check for 403 session expired error
  useEffect(() => {
    if (error?.response?.status === 403) {
      setToast({ 
        message: "Your session has expired. Please login again.", 
        type: "error" 
      });
      setTimeout(() => nav("/login"), 2000);
    } else if (error) {
      setToast({ 
        message: "Failed to load posts. Please try again.", 
        type: "error" 
      });
    }
  }, [error, nav]);

  const toggleVisibility = async (post) => {
    setUpdatingId(post._id);
    try {
      const result = await updatePost(post._id, { published: !post.published });
      
      if (result?.error?.response?.status === 403) {
        setToast({ 
          message: "Your session has expired. Please login again.", 
          type: "error" 
        });
        setTimeout(() => nav("/login"), 2000);
        return;
      }

      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      
      setToast({ 
        message: `Post ${post.published ? "hidden" : "published"} successfully!`, 
        type: "success" 
      });
    } catch (err) {
      setToast({ 
        message: "Failed to update post visibility.", 
        type: "error" 
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const onDelete = async (post) => {
    try {
      const result = await deletePost(post._id);
      
      if (result?.error?.response?.status === 403) {
        setToast({ 
          message: "Your session has expired. Please login again.", 
          type: "error" 
        });
        setTimeout(() => nav("/login"), 2000);
        return;
      }

      qc.invalidateQueries({ queryKey: ["myPosts"] });
      setToast({ 
        message: "Post deleted successfully!", 
        type: "success" 
      });
    } catch (err) {
      setToast({ 
        message: "Failed to delete post.", 
        type: "error" 
      });
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-lg">Loading your posts...</p>
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

      <ConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={() => deleteModal && onDelete(deleteModal)}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">My Posts</h2>
          <p className="text-gray-400">Manage your blog posts</p>
        </div>

        {/* Posts List */}
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gray-800 rounded-full p-6 mb-6">
              <FileText className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              You haven't created any posts yet. Start writing to share your thoughts!
            </p>
            <button
              onClick={() => nav("/editor")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((p) => (
              <div
                key={p._id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {p.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        p.published 
                          ? "bg-green-900/50 text-green-400 border border-green-800" 
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}>
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      <time>{formatDate(p.updatedAt)}</time>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => nav(`/editor/${p.slug}`)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                      title="Edit post"
                    >
                      <Edit3 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => toggleVisibility(p)}
                      disabled={updatingId === p._id}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title={p.published ? "Hide post" : "Publish post"}
                    >
                      {updatingId === p._id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : p.published ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                      <span className="hidden sm:inline">
                        {p.published ? "Hide" : "Show"}
                      </span>
                    </button>

                    <button
                      onClick={() => setDeleteModal(p)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                      title="Delete post"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}