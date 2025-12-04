import { supabase } from "./supabaseClient";

const API = import.meta.env.VITE_API_URL || "";

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPosts({ q, page = 1, limit = 10 }) {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  const res = await fetch(`${API}/api/posts?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchPostBySlug(slug) {
  const res = await fetch(`${API}/api/posts/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

export async function createPost(payload) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Create failed");
  }
  return res.json();
}

export async function updatePost(id, payload) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deletePost(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/posts/${id}`, {
    method: "DELETE",
    headers: { ...headers },
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function fetchMyPosts() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/posts/me`, { headers });
  if (!res.ok) throw new Error("Fetch my posts failed");
  return res.json();
}

export async function fetchPrivatePost(slug) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/posts/private/${slug}`, {
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch private post");
  return res.json();
}

