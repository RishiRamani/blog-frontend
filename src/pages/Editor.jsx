import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createPost, updatePost, fetchPrivatePost } from "../lib/api";
import { useAuth } from "../context/AuthProvider";

export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [initial, setInitial] = useState({
    title: "",
    bannerImage: "",
    content: "",
    published: false,
  });

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const p = await fetchPrivatePost(id);
          setInitial({
            title: p.title || "",
            bannerImage: p.bannerImage || "",
            content: p.content || "",
            published: p.published || false,
            _id: p._id,
          });
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-slate-300 text-lg">You must be logged in to create/edit posts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span>{id ? "✏️" : "✨"}</span>
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
              return errors;
            }}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setSubmitting(true);
              try {
                if (values._id) {
                  await updatePost(values._id, values);
                } else {
                  await createPost(values);
                }
                setSubmitting(false);
                nav("/");
              } catch (err) {
                setStatus(err.message || "Save failed");
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting, status, errors }) => {
              const contentLength = values.content?.trim().length || 0;
              const isContentValid = contentLength >= 10;

              return (
                <Form className="p-8 space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Post Title
                    </label>
                    <Field
                      name="title"
                      placeholder="Enter an engaging title..."
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-400 text-sm mt-1 flex items-center gap-1"
                    />
                  </div>

                  {/* Banner Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cover Image URL
                    </label>
                    <Field
                      name="bannerImage"
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <ErrorMessage
                      name="bannerImage"
                      component="div"
                      className="text-red-400 text-sm mt-1"
                    />
                    {values.bannerImage && /^https?:\/\//.test(values.bannerImage) && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-slate-600">
                        <img
                          src={values.bannerImage}
                          alt="cover preview"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Content (Markdown)
                      </label>
                      <div className={`text-sm px-3 py-1 rounded-full ${
                        isContentValid 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {contentLength} / 10 chars {isContentValid ? '✓' : '⚠️'}
                      </div>
                    </div>
                    
                    <div className="rounded-xl overflow-hidden border border-slate-600">
                      <MDEditor
                        value={values.content}
                        onChange={(md) => setFieldValue("content", md)}
                        height={400}
                        data-color-mode="dark"
                      />
                    </div>
                    
                    {!isContentValid && (
                      <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
                        <span className="text-lg">⚠️</span>
                        <span>Content must be at least 10 characters to publish</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <label className="inline-flex items-center gap-3 cursor-pointer group">
                      <Field
                        type="checkbox"
                        name="published"
                        className="w-5 h-5 rounded bg-slate-900 border-slate-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-300 group-hover:text-white transition">
                        Publish immediately
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isContentValid}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isSubmitting || !isContentValid
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105'
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
                        <span className="flex items-center gap-2">
                          <span>🚀</span>
                          Publish Post
                        </span>
                      )}
                    </button>
                  </div>

                  {status && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 flex items-center gap-2">
                      <span className="text-xl">❌</span>
                      {status}
                    </div>
                  )}

                  {/* Live Preview */}
                  <div className="mt-8 pt-8 border-t border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>👁️</span>
                      Live Preview
                    </h3>
                    <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6 [&_.wmde-markdown]:!bg-transparent">
                      <div className="prose prose-invert prose-purple max-w-none">
                        <MDEditor.Markdown 
                          source={values.content || "*Start typing to see preview...*"} 
                        />
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