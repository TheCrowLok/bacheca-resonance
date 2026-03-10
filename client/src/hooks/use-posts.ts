import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PostInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch all posts
export function usePosts() {
  return useQuery({
    queryKey: [api.posts.list.path],
    queryFn: async () => {
      const res = await fetch(api.posts.list.path, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }
      return api.posts.list.responses[200].parse(await res.json());
    },
  });
}

// Upload an image
export function useUploadImage() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch(api.upload.create.path, {
        method: api.upload.create.method,
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to upload image");
      }
      
      return api.upload.create.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Create a new post
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: PostInput) => {
      // Validate input before sending to prevent unnecessary network requests
      const validated = api.posts.create.input.parse(data);
      
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.posts.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create post");
      }
      
      return api.posts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate the posts list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      toast({
        title: "Success!",
        description: "Your note has been pinned to the board.",
      });
    },
    onError: (error) => {
      toast({
        title: "Couldn't pin note",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
