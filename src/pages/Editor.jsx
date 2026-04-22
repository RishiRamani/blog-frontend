import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useCreatePost, useUpdatePost, usePost } from "../hooks/usePosts";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllTags } from "../lib/api";
import { X, Plus, Search } from "lucide-react";

const parseTags = (tags) => [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 10);

// ── Tag Picker Component ──────────────────────────────────────────────────────
function TagPicker({ value = [], onChange, token }) {
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const { data: allTags = [] } = useQuery({
    queryKey: ["all-tags"],
    queryFn: () => fetchAllTags(token),
    enabled: !!token,
    staleTime: 60_000,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allTags
    .filter((t) => !value.includes(t) && t.includes(inputVal.trim().toLowerCase()))
    .slice(0, 8);

  const trimmed = inputVal.trim().toLowerCase();
  const isNew = trimmed && !allTags.includes(trimmed) && !value.includes(trimmed);

  const addTag = (tag) => {
    const cleaned = tag.trim().toLowerCase();
    if (!cleaned || value.includes(cleaned) || value.length >= 10) return;
    onChange([...value, cleaned]);
    setInputVal("");
    setIsOpen(false);
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-indigo-400 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + dropdown */}
      {value.length < 10 && (
        <div className="relative">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (trimmed) addTag(trimmed);
                }
                if (e.key === "Escape") setIsOpen(false);
              }}
              placeholder="Search or type a new tag..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {isOpen && (filtered.length > 0 || isNew) && (
            <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
              {/* Existing tags */}
              {filtered.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag(tag)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-200 transition-colors text-left"
                >
                  <span className="text-indigo-500">#</span>
                  {tag}
                </button>
              ))}

              {/* Create new tag option */}
              {isNew && (
                <>
                  {filtered.length > 0 && <div className="border-t border-gray-800 my-1" />}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addTag(trimmed)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition-colors text-left"
                  >
                    <Plus size={14} />
                    Create new tag: <span className="font-medium">#{trimmed}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {value.length}/10 tags · Press Enter or click to add · New tags are created on submit
      </p>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────
export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [token, setToken] = useState(null);
  const { data: postData } = usePost(id);
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  // Fetch token once for tag query
  useEffect(() => {
    if (isSignedIn) getToken().then(setToken);
  }, [isSignedIn, getToken]);

  const [initial, setInitial] = useState({
    title: "",
    bannerImage: "",
    content: "",
    tags: [],
    published: false,
  });

  useEffect(() => {
    if (id && postData) {
      setInitial({
        title: postData.title || "",
        bannerImage: postData.bannerImage || "",
        content: postData.content || "",
        tags: Array.isArray(postData.tags) ? postData.tags : [],
        published: postData.published || false,
        _id: postData._id,
      });
    }
  }, [id, postData]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-xl">
          <p className="text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-xl">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-300 text-lg">You must be logged in to create/edit posts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-indigo-600 p-6">
            <h2 className="text-3xl font-bold text-white">
              {id ? "Edit Post" : "Create New Post"}
            </h2>
          </div>

          <Formik
            enableReinitialize
            initialValues={initial}
            validate={(values) => {
              const errors = {};
              if (!values.title || values.title.trim().length < 3)
                errors.title = "Title required (min 3 chars)";
              if (!values.bannerImage || !/^https?:\/\//.test(values.bannerImage))
                errors.bannerImage = "Valid image URL required";
              if (!values.content || values.content.trim().length < 10)
                errors.content = "Content must be at least 10 characters";
              if (!values.tags || values.tags.length === 0)
                errors.tags = "Add at least one tag";
              else if (values.tags.some((t) => t.length > 30))
                errors.tags = "Each tag must be 30 characters or less";
              return errors;
            }}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setSubmitting(true);
              try {
                const tok = await getToken();
                const payload = {
                  ...values,
                  tags: parseTags(values.tags),
                };

                if (values._id) {
                  await updateMutation.mutateAsync({ id: values._id, payload, token: tok });
                } else {
                  await createMutation.mutateAsync({ payload, token: tok });
                }

                nav("/");
              } catch (err) {
                setStatus(err.message || "Save failed");
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting, status }) => {
              const contentLength = values.content?.trim().length || 0;
              const isContentValid = contentLength >= 10;

              return (
                <Form className="p-8 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Post Title</label>
                    <Field
                      name="title"
                      placeholder="Enter an engaging title..."
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <ErrorMessage name="title" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Banner image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL</label>
                    <Field
                      name="bannerImage"
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <ErrorMessage name="bannerImage" component="div" className="text-red-400 text-sm mt-1" />
                    {values.bannerImage && /^https?:\/\//.test(values.bannerImage) && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-700">
                        <img src={values.bannerImage} alt="cover preview" className="w-full h-64 object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Tags — new searchable picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <TagPicker
                      value={values.tags}
                      onChange={(tags) => setFieldValue("tags", tags)}
                      token={token}
                    />
                    <ErrorMessage name="tags" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">Content (Markdown)</label>
                      <div className={`text-sm px-3 py-1 rounded-full ${isContentValid ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {contentLength} / 10 chars {isContentValid ? "✅" : "❌"}
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-700">
                      <MDEditor
                        value={values.content}
                        onChange={(md) => setFieldValue("content", md)}
                        height={400}
                        data-color-mode="dark"
                      />
                    </div>
                    {!isContentValid && (
                      <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
                        Content must be at least 10 characters to publish
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <label className="inline-flex items-center gap-3 cursor-pointer group">
                      <Field
                        type="checkbox"
                        name="published"
                        className="w-5 h-5 rounded bg-gray-950 border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                      />
                      <span className="text-gray-300 group-hover:text-white transition">Publish immediately</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isContentValid}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isSubmitting || !isContentValid
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-105"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        "Publish Post"
                      )}
                    </button>
                  </div>

                  {status && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 flex items-center gap-2">
                      <span>❌</span> {status}
                    </div>
                  )}

                  {/* Live preview */}
                  <div className="mt-8 pt-8 border-t border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
                    <div className="bg-gray-950/70 border border-gray-700 rounded-xl p-6 [&_.wmde-markdown]:!bg-transparent">
                      <div className="prose prose-invert max-w-none">
                        <MDEditor.Markdown source={values.content || "*Start typing to see preview...*"} />
                      </div>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}