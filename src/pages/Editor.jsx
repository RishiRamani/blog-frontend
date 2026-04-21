import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createPost, updatePost, fetchPostBySlug } from "../lib/api";
import { useAuth } from "@clerk/clerk-react";

const splitTags = (value) =>
  value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

const parseTags = (value) => [...new Set(splitTags(value))].slice(0, 10);

export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [initial, setInitial] = useState({
    title: "",
    bannerImage: "",
    content: "",
    tagsInput: "",
    published: false,
  });

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const p = await fetchPostBySlug(id);
          setInitial({
            title: p.title || "",
            bannerImage: p.bannerImage || "",
            content: p.content || "",
            tagsInput: Array.isArray(p.tags) ? p.tags.join(", ") : "",
            published: p.published || false,
            _id: p._id,
          });
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [id]);

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
          <div className="text-6xl mb-4">ðŸ”’</div>
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
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              {id ? "Edit Post" : "Create New Post"}
            </h2>
          </div>

          <Formik
            enableReinitialize
            initialValues={initial}
            validate={(values) => {
              const errors = {};
              const rawTags = splitTags(values.tagsInput || "");

              if (!values.title || values.title.trim().length < 3) {
                errors.title = "Title required (min 3 chars)";
              }
              if (!values.bannerImage || !/^https?:\/\//.test(values.bannerImage)) {
                errors.bannerImage = "Valid image URL required";
              }
              if (!values.content || values.content.trim().length < 10) {
                errors.content = "Content must be at least 10 characters";
              }
              if (rawTags.length === 0) {
                errors.tagsInput = "Add at least one tag";
              } else if (rawTags.some((tag) => tag.length > 30)) {
                errors.tagsInput = "Each tag must be 30 characters or less";
              } else if (rawTags.length > 10) {
                errors.tagsInput = "Use up to 10 tags";
              }

              return errors;
            }}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setSubmitting(true);
              try {
                const token = await getToken();
                const payload = {
                  ...values,
                  tags: parseTags(values.tagsInput || ""),
                };
                delete payload.tagsInput;

                if (values._id) {
                  await updatePost(values._id, payload, token);
                } else {
                  await createPost(payload, token);
                }

                setSubmitting(false);
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
              const previewTags = parseTags(values.tagsInput || "");

              return (
                <Form className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Post Title
                    </label>
                    <Field
                      name="title"
                      placeholder="Enter an engaging title..."
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-400 text-sm mt-1 flex items-center gap-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cover Image URL
                    </label>
                    <Field
                      name="bannerImage"
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <ErrorMessage
                      name="bannerImage"
                      component="div"
                      className="text-red-400 text-sm mt-1"
                    />
                    {values.bannerImage && /^https?:\/\//.test(values.bannerImage) && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-700">
                        <img
                          src={values.bannerImage}
                          alt="cover preview"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                    </label>
                    <Field
                      name="tagsInput"
                      placeholder="react, mongodb, clerk"
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <p className="mt-2 text-sm text-gray-400">
                      Add 1 to 10 comma-separated tags to help readers discover the post.
                    </p>
                    <ErrorMessage
                      name="tagsInput"
                      component="div"
                      className="text-red-400 text-sm mt-1"
                    />
                    {previewTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {previewTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Content (Markdown)
                      </label>
                      <div
                        className={`text-sm px-3 py-1 rounded-full ${
                          isContentValid
                            ? "bg-green-500/20 text-green-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
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
                        <span>Content must be at least 10 characters to publish</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <label className="inline-flex items-center gap-3 cursor-pointer group">
                      <Field
                        type="checkbox"
                        name="published"
                        className="w-5 h-5 rounded bg-gray-950 border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                      />
                      <span className="text-gray-300 group-hover:text-white transition">
                        Publish immediately
                      </span>
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
                        <span className="flex items-center gap-2">
                          Publish Post
                        </span>
                      )}
                    </button>
                  </div>

                  {status && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 flex items-center gap-2">
                      <span className="text-xl">âŒ</span>
                      {status}
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      Live Preview
                    </h3>
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
