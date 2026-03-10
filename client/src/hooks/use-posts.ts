import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PostInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "";

export function usePosts() {
  return useQuery({
    queryKey: [api.posts.list.path],
    queryFn: async () => {
      const res = await fetch(API_BASE_URL + api.posts.list.path);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return await res.json();
    },
  });
}

export function useUploadImage() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(API_BASE_URL + api.upload.create.path, {
        method: "POST",
        body: formData,
      });
      return await res.json();
    }
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: PostInput) => {
      const res = await fetch(API_BASE_URL + api.posts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      toast({ title: "Postato!", description: "La nota è sulla bacheca." });
    }
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password }
      });
      if (!res.ok) throw new Error("Password errata");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      toast({ title: "Cancellato!", description: "Il post è stato rimosso." });
    }
  });
}
