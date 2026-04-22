import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPosts,
  fetchPostBySlug,
  createPost,
  updatePost,
  deletePost,
  fetchMyPosts,
  addCommentToPost,
} from "../lib/api";

// GET POSTS
export const usePosts = (params, token) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchPosts(params, token),
    keepPreviousData: true,
  });
};

// GET SINGLE POST
export const usePost = (slug) => {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
  });
};

// MY POSTS
export const useMyPosts = (token, page, limit) => {
  return useQuery({
    queryKey: ["my-posts", page, limit],
    queryFn: () => fetchMyPosts(token, page, limit),
    enabled: !!token,
  });
};

// CREATE POST
export const useCreatePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, token }) => createPost(payload, token),
    onSuccess: () => {
      qc.invalidateQueries(["posts"]);
      qc.invalidateQueries(["my-posts"]);
    },
  });
};

// UPDATE POST
export const useUpdatePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, token }) =>
      updatePost(id, payload, token),
    onSuccess: () => {
      qc.invalidateQueries(["posts"]);
      qc.invalidateQueries(["my-posts"]);
    },
  });
};

// DELETE POST
export const useDeletePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, token }) => deletePost(id, token),
    onSuccess: () => {
      qc.invalidateQueries(["posts"]);
      qc.invalidateQueries(["my-posts"]);
    },
  });
};

// ADD COMMENT
export const useAddComment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, payload, token }) =>
      addCommentToPost(slug, payload, token),
    onSuccess: (_, variables) => {
      qc.invalidateQueries(["post", variables.slug]);
    },
  });
};