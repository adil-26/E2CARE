import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, User, Stethoscope, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const roles = [
  {
    key: "patient",
    label: "Patient",
    desc: "Access your health records, book appointments, and track vitals",
    icon: User,
    path: "/auth/patient",
    gradient: "from-primary to-primary/70",
  },
  {
    key: "doctor",
    label: "Doctor",
    desc: "Manage patients, write prescriptions, and view appointments",
    icon: Stethoscope,
    path: "/auth/doctor",
    gradient: "from-secondary to-secondary/70",
  },
  {
    key: "admin",
    label: "Admin",
    desc: "Manage doctors, patients, and oversee the platform",
    icon: Shield,
    path: "/auth/admin",
    gradient: "from-warning to-warning/70",
  },
];

export default function AuthRoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl health-gradient shadow-lg">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">E2Care</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose how you'd like to continue</p>
        </div>

        <div className="space-y-3">
          {roles.map((role, i) => (
            <motion.div
              key={role.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
            >
              <Card
                className="cursor-pointer border-border/50 shadow-md transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => navigate(role.path)}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient} shadow-md`}>
                    <role.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{role.label}</h3>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
