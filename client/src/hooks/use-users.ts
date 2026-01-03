import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, apiRequest } from "@/lib/fetch";

export function useUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usersQuery = useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.users.list.path);
      if (res.status === 401) return [];
      if (res.status === 403) return [];
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.list.responses[200].parse(await res.json());
    },

    retry: false,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof api.users.create.input>) => {
      const res = await apiRequest("POST", api.users.create.path, data);

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        if (res.status === 403) {
          throw new Error("Only admins can create users");
        }
        throw new Error("Failed to create user");
      }

      return api.users.create.responses[201].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({
        title: "User Created",
        description: `User "${user.username}" created as ${user.role}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create User",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
  };
}
