import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string | null;
  experience_years: number;
  rating: number | null;
  consultation_fee: number;
  avatar_url: string | null;
  bio: string | null;
  hospital: string | null;
  languages: string[] | null;
  is_available: boolean;
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
  doctor?: Doctor;
}

export function useAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all doctors
  const doctorsQuery = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_available", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as Doctor[];
    },
  });

  // Fetch availability for a specific doctor
  const useDoctorAvailability = (doctorId: string | null) =>
    useQuery({
      queryKey: ["doctor-availability", doctorId],
      enabled: !!doctorId,
      queryFn: async () => {
        const { data, error } = await supabase
          .from("doctor_availability")
          .select("*")
          .eq("doctor_id", doctorId!)
          .eq("is_active", true)
          .order("day_of_week");
        if (error) throw error;
        return data as DoctorAvailability[];
      },
    });

  // Fetch user's appointments
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });
      if (error) throw error;

      // Fetch doctor info for each appointment
      const doctorIds = [...new Set((data as any[]).map((a) => a.doctor_id))];
      const { data: doctors } = await supabase
        .from("doctors")
        .select("*")
        .in("id", doctorIds);

      const doctorMap = new Map((doctors || []).map((d: any) => [d.id, d]));

      return (data as any[]).map((a) => ({
        ...a,
        doctor: doctorMap.get(a.doctor_id),
      })) as Appointment[];
    },
  });

  // Fetch existing appointments for a doctor on a date (to check slot availability)
  const useBookedSlots = (doctorId: string | null, date: string | null) =>
    useQuery({
      queryKey: ["booked-slots", doctorId, date],
      enabled: !!doctorId && !!date,
      queryFn: async () => {
        const { data, error } = await supabase
          .from("appointments")
          .select("start_time, end_time")
          .eq("doctor_id", doctorId!)
          .eq("appointment_date", date!)
          .neq("status", "cancelled");
        if (error) throw error;
        return data as { start_time: string; end_time: string }[];
      },
    });

  // Book an appointment
  const bookAppointment = useMutation({
    mutationFn: async (params: {
      doctorId: string;
      date: string;
      startTime: string;
      endTime: string;
      reason?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("appointments").insert({
        user_id: user.id,
        doctor_id: params.doctorId,
        appointment_date: params.date,
        start_time: params.startTime,
        end_time: params.endTime,
        reason: params.reason || null,
        status: "upcoming",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["booked-slots"] });
      toast({ title: "Appointment Booked!", description: "Your appointment has been confirmed." });
    },
    onError: (err) => {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    },
  });

  // Cancel an appointment
  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["booked-slots"] });
      toast({ title: "Cancelled", description: "Appointment has been cancelled." });
    },
    onError: (err) => {
      toast({ title: "Cancel Failed", description: err.message, variant: "destructive" });
    },
  });

  return {
    doctors: doctorsQuery.data || [],
    isDoctorsLoading: doctorsQuery.isLoading,
    appointments: appointmentsQuery.data || [],
    isAppointmentsLoading: appointmentsQuery.isLoading,
    useDoctorAvailability,
    useBookedSlots,
    bookAppointment,
    cancelAppointment,
  };
}
