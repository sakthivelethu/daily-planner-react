import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertGymLog } from "@shared/routes";

export function useGymLog() {
  return useQuery({
    queryKey: [api.gym.get.path],
    queryFn: async () => {
      const res = await fetch(api.gym.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch gym log");
      return api.gym.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateGymLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertGymLog, "date">) => {
      const res = await fetch(api.gym.update.path, {
        method: api.gym.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update gym log");
      return api.gym.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.gym.get.path] });
    },
  });
}
