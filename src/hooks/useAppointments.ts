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
  day_of_week: number; // 0=Sun, 1=Mon, ...6=Sat
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

// --------------- MOCK FALLBACK DATA ---------------
const MOCK_DOCTORS: Doctor[] = [
  {
    id: "mock-1",
    full_name: "Dr. Priya Sharma",
    specialization: "General Physician",
    qualification: "MBBS, MD (Internal Medicine)",
    experience_years: 12,
    rating: 4.8,
    consultation_fee: 500,
    avatar_url: null,
    bio: "Expert in general medicine and preventive care.",
    hospital: "Apollo Clinic, New Delhi",
    languages: ["English", "Hindi"],
    is_available: true,
  },
  {
    id: "mock-2",
    full_name: "Dr. Rajesh Kumar",
    specialization: "Cardiologist",
    qualification: "MBBS, MD, DM (Cardiology)",
    experience_years: 18,
    rating: 4.9,
    consultation_fee: 1200,
    avatar_url: null,
    bio: "Specializes in heart disease management and preventive cardiology.",
    hospital: "Max Hospital, Gurugram",
    languages: ["English", "Hindi", "Punjabi"],
    is_available: true,
  },
  {
    id: "mock-3",
    full_name: "Dr. Ananya Rao",
    specialization: "Dermatologist",
    qualification: "MBBS, MD (Dermatology)",
    experience_years: 9,
    rating: 4.7,
    consultation_fee: 800,
    avatar_url: null,
    bio: "Expert in skin, hair, and nail disorders.",
    hospital: "Skin & Care Centre, Bangalore",
    languages: ["English", "Kannada", "Hindi"],
    is_available: true,
  },
  {
    id: "mock-4",
    full_name: "Dr. Sanjay Mehta",
    specialization: "Orthopedic Surgeon",
    qualification: "MBBS, MS (Orthopaedics)",
    experience_years: 15,
    rating: 4.6,
    consultation_fee: 1000,
    avatar_url: null,
    bio: "Joint replacement and sports injury specialist.",
    hospital: "Fortis Hospital, Mumbai",
    languages: ["English", "Hindi", "Marathi"],
    is_available: true,
  },
  {
    id: "mock-5",
    full_name: "Dr. Meena Nair",
    specialization: "Pediatrician",
    qualification: "MBBS, MD (Paediatrics)",
    experience_years: 11,
    rating: 4.9,
    consultation_fee: 600,
    avatar_url: null,
    bio: "Child health specialist with expertise in growth and development.",
    hospital: "Rainbow Children's Hospital, Hyderabad",
    languages: ["English", "Hindi", "Telugu"],
    is_available: true,
  },
  {
    id: "mock-6",
    full_name: "Dr. Arun Verma",
    specialization: "ENT Specialist",
    qualification: "MBBS, MS (ENT)",
    experience_years: 14,
    rating: 4.7,
    consultation_fee: 700,
    avatar_url: null,
    bio: "Expert in ear, nose and throat disorders.",
    hospital: "AIIMS, New Delhi",
    languages: ["English", "Hindi"],
    is_available: true,
  },
  {
    id: "mock-7",
    full_name: "Dr. Sunita Patel",
    specialization: "Gynecologist",
    qualification: "MBBS, MD (Obstetrics & Gynaecology)",
    experience_years: 16,
    rating: 4.9,
    consultation_fee: 900,
    avatar_url: null,
    bio: "Women's health specialist with expertise in high-risk pregnancies.",
    hospital: "Cloudnine Hospital, Chennai",
    languages: ["English", "Tamil", "Hindi"],
    is_available: true,
  },
  {
    id: "mock-8",
    full_name: "Dr. Vikram Singh",
    specialization: "Neurologist",
    qualification: "MBBS, MD, DM (Neurology)",
    experience_years: 20,
    rating: 4.8,
    consultation_fee: 1500,
    avatar_url: null,
    bio: "Expert in stroke, epilepsy and movement disorders.",
    hospital: "NIMHANS, Bangalore",
    languages: ["English", "Hindi", "Kannada"],
    is_available: true,
  },
];

// All mock doctors available Mon–Sat, 9am–5pm, 30-min slots
function getMockAvailability(doctorId: string): DoctorAvailability[] {
  return [1, 2, 3, 4, 5, 6].map((dow) => ({
    id: `avail-${doctorId}-${dow}`,
    doctor_id: doctorId,
    day_of_week: dow,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 30,
    is_active: true,
  }));
}
// ---------------------------------------------------

export function useAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all doctors — fall back to mock data if DB is empty
  const doctorsQuery = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_available", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data as Doctor[];
      // DB empty — use demo data
      return MOCK_DOCTORS;
    },
  });

  // Fetch availability for a specific doctor
  const useDoctorAvailability = (doctorId: string | null) =>
    useQuery({
      queryKey: ["doctor-availability", doctorId],
      enabled: !!doctorId,
      queryFn: async () => {
        // If it's a mock doctor, return mock availability
        if (doctorId?.startsWith("mock-")) {
          return getMockAvailability(doctorId);
        }
        const { data, error } = await supabase
          .from("doctor_availability")
          .select("*")
          .eq("doctor_id", doctorId!)
          .eq("is_active", true)
          .order("day_of_week");
        if (error) throw error;
        if (data && data.length > 0) return data as DoctorAvailability[];
        // Real doctor but no availability rows — give default Mon-Sat
        return getMockAvailability(doctorId!);
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

      const doctorIds = [...new Set((data as any[]).map((a) => a.doctor_id))];
      const dbDoctorIds = doctorIds.filter((id) => !id.startsWith("mock-"));
      const mockDoctorIds = doctorIds.filter((id) => id.startsWith("mock-"));

      const doctorMap = new Map<string, Doctor>();

      // Fetch real doctors
      if (dbDoctorIds.length > 0) {
        const { data: doctors } = await supabase
          .from("doctors")
          .select("*")
          .in("id", dbDoctorIds);
        (doctors || []).forEach((d: any) => doctorMap.set(d.id, d));
      }

      // Add mock doctors from local map
      mockDoctorIds.forEach((id) => {
        const mock = MOCK_DOCTORS.find((m) => m.id === id);
        if (mock) doctorMap.set(id, mock);
      });

      return (data as any[]).map((a) => ({
        ...a,
        doctor: doctorMap.get(a.doctor_id),
      })) as Appointment[];
    },
  });

  // Fetch booked slots for a doctor on a date
  const useBookedSlots = (doctorId: string | null, date: string | null) =>
    useQuery({
      queryKey: ["booked-slots", doctorId, date],
      enabled: !!doctorId && !!date,
      queryFn: async () => {
        // Mock doctors use in-memory appointments only
        if (doctorId?.startsWith("mock-")) {
          const { data, error } = await supabase
            .from("appointments")
            .select("start_time, end_time")
            .eq("doctor_id", doctorId!)
            .eq("appointment_date", date!)
            .neq("status", "cancelled");
          if (error) return [];
          return data as { start_time: string; end_time: string }[];
        }
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
      toast({ title: "Appointment Booked! 🎉", description: "Your appointment has been confirmed." });
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
