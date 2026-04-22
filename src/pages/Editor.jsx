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

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span key={tag}>
              #{tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {value.length < 10 && (
        <div className="relative">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search or type a new tag..."
          />

          {isOpen && (filtered.length > 0 || isNew) && (
            <div>
              {filtered.map((tag) => (
                <button key={tag} type="button" onClick={() => addTag(tag)}>
                  #{tag}
                </button>
              ))}

              {isNew && (
                <button type="button" onClick={() => addTag(trimmed)}>
                  Create new tag: #{trimmed}
                </button>
              )}
            </div>
          )}
        </div>
      )}
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
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>You must be logged in.</div>;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initial}
      onSubmit={async (values) => {

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
      }}
    >
      {({ values, setFieldValue }) => (
        <Form>

          <Field name="title" />

          <Field name="bannerImage" />

          <TagPicker
            value={values.tags}
            onChange={(tags) => setFieldValue("tags", tags)}
            token={token}
          />

          <MDEditor
            value={values.content}
            onChange={(md) => setFieldValue("content", md)}
          />

          <Field type="checkbox" name="published" />

          <button type="submit">
            Publish
          </button>

        </Form>
      )}
    </Formik>
  );
}
