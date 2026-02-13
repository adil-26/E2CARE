import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface MedicalReport {
  id: string;
  user_id: string;
  title: string;
  report_type: string;
  report_date: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  status: string;
  extracted_data: any;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export function useMedicalReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["medical-reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MedicalReport[];
    },
  });

  const uploadAndAnalyze = useMutation({
    mutationFn: async ({
      file,
      reportType,
      title,
      reportDate,
    }: {
      file: File;
      reportType: string;
      title: string;
      reportDate?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // 1. Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get signed URL for the file
      const { data: urlData } = await supabase.storage
        .from("medical-reports")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      const fileUrl = urlData?.signedUrl || fileName;

      // 3. Create report record
      const { data: report, error: insertError } = await supabase
        .from("medical_reports")
        .insert({
          user_id: user.id,
          title,
          report_type: reportType,
          report_date: reportDate || null,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Convert file to base64 for AI analysis
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);

      // 5. Call analyze edge function
      const { data: analyzeResult, error: analyzeError } =
        await supabase.functions.invoke("analyze-report", {
          body: {
            reportId: report.id,
            imageBase64: base64,
            reportType,
            fileType: file.type,
          },
        });

      if (analyzeError) {
        console.error("Analysis error:", analyzeError);
        // Report is saved even if analysis fails
        toast({
          title: "Upload successful",
          description: "Report uploaded but AI analysis failed. You can retry later.",
          variant: "destructive",
        });
      }

      return { report, analyzeResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-reports"] });
    },
    onError: (err) => {
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (reportId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("medical_reports")
        .delete()
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-reports"] });
      toast({ title: "Deleted", description: "Report removed." });
    },
    onError: (err) => {
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const retryAnalysis = useMutation({
    mutationFn: async ({ reportId, reportType }: { reportId: string; reportType: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Get the report to find the file
      const report = query.data?.find((r) => r.id === reportId);
      if (!report) throw new Error("Report not found");

      // Download the file from storage to get base64
      const filePath = report.file_url.includes("/")
        ? report.file_url.split("medical-reports/")[1]?.split("?")[0]
        : report.file_url;

      if (!filePath) throw new Error("Cannot determine file path");

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("medical-reports")
        .download(filePath);

      if (downloadError) throw downloadError;

      const arrayBuffer = await fileData.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);

      const { data, error } = await supabase.functions.invoke("analyze-report", {
        body: { reportId, imageBase64: base64, reportType, fileType: report.file_type || "image/jpeg" },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-reports"] });
      toast({ title: "Analysis Complete", description: "Report re-analyzed." });
    },
    onError: (err) => {
      toast({
        title: "Analysis Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    reports: query.data || [],
    isLoading: query.isLoading,
    uploadAndAnalyze,
    deleteReport,
    retryAnalysis,
  };
}
