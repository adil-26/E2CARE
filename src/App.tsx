import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import RoleRedirect from "@/components/RoleRedirect";
import AppLayout from "@/components/layout/AppLayout";
import DoctorLayout from "@/components/layout/DoctorLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Auth pages
import AuthRoleSelect from "@/pages/auth/AuthRoleSelect";
import PatientAuth from "@/pages/auth/PatientAuth";
import DoctorAuth from "@/pages/auth/DoctorAuth";
import AdminAuth from "@/pages/auth/AdminAuth";

// Public pages
import EmergencyAccess from "@/pages/EmergencyAccess";
import NotFound from "@/pages/NotFound";
import DoctorRegister from "@/pages/DoctorRegister";

// Patient pages
import Dashboard from "@/pages/Dashboard";
import MedicalHistory from "@/pages/MedicalHistory";
import Records from "@/pages/Records";
import Appointments from "@/pages/Appointments";
import Messages from "@/pages/Messages";
import AIChat from "@/pages/AIChat";
import Emergency from "@/pages/Emergency";
import Conditions from "@/pages/Conditions";
import Timeline from "@/pages/Timeline";
import WalletPage from "@/pages/WalletPage";
import Referrals from "@/pages/Referrals";
import SettingsPage from "@/pages/SettingsPage";

// Doctor pages
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import DoctorPatients from "@/pages/doctor/DoctorPatients";
import PatientDetail from "@/pages/doctor/PatientDetail";
import DoctorPrescriptions from "@/pages/doctor/DoctorPrescriptions";
import CreatePrescription from "@/pages/doctor/CreatePrescription";
import DoctorAppointments from "@/pages/doctor/DoctorAppointments";
import DoctorMessages from "@/pages/doctor/DoctorMessages";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageDoctors from "@/pages/admin/ManageDoctors";
import ManagePatients from "@/pages/admin/ManagePatients";
import AdminAppointments from "@/pages/admin/AdminAppointments";
import AdminPatientDetail from "@/pages/admin/AdminPatientDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth" element={<AuthRoleSelect />} />
              <Route path="/auth/patient" element={<PatientAuth />} />
              <Route path="/auth/doctor" element={<DoctorAuth />} />
              <Route path="/auth/admin" element={<AdminAuth />} />

              {/* Public routes */}
              <Route path="/emergency-access/:medicalId" element={<EmergencyAccess />} />

              {/* Doctor registration (requires auth) */}
              <Route
                path="/doctor-register"
                element={
                  <ProtectedRoute>
                    <DoctorRegister />
                  </ProtectedRoute>
                }
              />

              {/* Role-based redirect */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Patient routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/medical-history" element={<MedicalHistory />} />
                <Route path="/records" element={<Records />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/chat" element={<AIChat />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/conditions" element={<Conditions />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Doctor routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["doctor", "admin"]} fallbackPath="/dashboard">
                      <DoctorLayout />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              >
                <Route path="/doctor" element={<DoctorDashboard />} />
                <Route path="/doctor/patients" element={<DoctorPatients />} />
                <Route path="/doctor/patients/:patientId" element={<PatientDetail />} />
                <Route path="/doctor/messages" element={<DoctorMessages />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                <Route path="/doctor/prescriptions/new" element={<CreatePrescription />} />
              </Route>

              {/* Admin routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["admin"]} fallbackPath="/dashboard">
                      <AdminLayout />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/doctors" element={<ManageDoctors />} />
                <Route path="/admin/patients" element={<ManagePatients />} />
                <Route path="/admin/patients/:patientId" element={<AdminPatientDetail />} />
                <Route path="/admin/appointments" element={<AdminAppointments />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
