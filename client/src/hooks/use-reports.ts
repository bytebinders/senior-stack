import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateReportRequest, type UpdateReportStatusRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, apiRequest } from "@/lib/fetch";

export function useReports(filters?: { status?: 'pending' | 'reviewed' | 'closed'; category?: string }) {
  // Construct query string for filters
  const queryString = filters 
    ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [k, v]) => v ? { ...acc, [k]: v } : acc, {})
      ).toString() 
    : "";
    
  const path = `${api.reports.list.path}${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: [api.reports.list.path, filters],
    queryFn: async () => {
      const res = await apiFetch(path);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return api.reports.list.responses[200].parse(await res.json());
    },
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: [api.reports.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.reports.get.path, { id });
      const res = await apiFetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch report");
      return api.reports.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateReportRequest) => {
      const res = await apiRequest(api.reports.create.method, api.reports.create.path, data);

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.reports.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create report");
      }

      return api.reports.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({ title: "Report Submitted", description: "Your report has been successfully filed." });
    },
    onError: (error) => {
      toast({ 
        title: "Submission Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number } & UpdateReportStatusRequest) => {
      const url = buildUrl(api.reports.updateStatus.path, { id });
      const res = await apiRequest(api.reports.updateStatus.method, url, { status });

      if (!res.ok) throw new Error("Failed to update status");
      return api.reports.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({ title: "Status Updated", description: "Report status has been changed." });
    },
    onError: () => {
      toast({ title: "Update Failed", description: "Could not update report status.", variant: "destructive" });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.reports.delete.path, { id });
      const res = await apiRequest(api.reports.delete.method, url);

      if (!res.ok) throw new Error("Failed to delete report");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({ title: "Report Deleted", description: "The report has been removed." });
    },
    onError: () => {
      toast({ title: "Delete Failed", description: "Could not delete report.", variant: "destructive" });
    },
  });
}
