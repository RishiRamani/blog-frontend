const API = import.meta.env.VITE_API_URL || "";

// Helper to create auth headers with Clerk token
function createHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchPosts({ q, page = 1, limit = 10 }, token) {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  const headers = createHeaders(token);

  const res = await fetch(`${API}/posts?${qs.toString()}`, {
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchPostBySlug(slug) {
  const res = await fetch(`${API}/posts/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

export async function createPost(payload, token) {
  const headers = createHeaders(token);
  console.log(headers);
  const res = await fetch(`${API}/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Create failed");
  }
  return res.json();
}

export async function updatePost(id, payload, token) {
  const headers = createHeaders(token);
  const res = await fetch(`${API}/posts/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Update failed");
  }
  return res.json();
}

export async function deletePost(id, token) {
  const headers = createHeaders(token);
  const res = await fetch(`${API}/posts/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Delete failed");
  }
  return res.json();
}

export async function fetchMyPosts(token, page = 1, limit = 10) {
  const headers = createHeaders(token);
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  const res = await fetch(`${API}/posts/my-posts?${qs.toString()}`, {
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Fetch my posts failed");
  }
  return res.json();
}

export async function fetchUserPublishedPosts(authorId, page = 1, limit = 10) {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  const res = await fetch(`${API}/posts/user/${authorId}?${qs.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to fetch user posts");
  }
  return res.json();
}

