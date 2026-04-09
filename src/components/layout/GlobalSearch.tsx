import { useState, useRef, useEffect } from "react";
import { Search, User, Calendar, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Mock data structured by "cluster"
const MOCK_RESULTS = {
  patients: [
    { id: "1", name: "Alice Johnson", detail: "Female, 34" },
    { id: "2", name: "John Smith", detail: "Male, 42" },
  ],
  appointments: [
    { id: "101", name: "Follow-up Checkup", detail: "Today, 10:00 AM" },
    { id: "102", name: "Ayurveda Consultation", detail: "Tomorrow, 2:30 PM" },
  ],
  records: [
    { id: "201", name: "Complete Blood Count", detail: "Uploaded: Oct 12" },
    { id: "202", name: "Liver Function Test", detail: "Uploaded: Oct 05" },
  ]
};

export default function GlobalSearch() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = query.length > 0;

  return (
    <div className="relative w-full max-w-[200px] md:max-w-xs lg:max-w-sm" ref={containerRef}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          placeholder={`${t.common.search || "Search"}...`}
          className="w-full pl-10 pr-8 bg-muted/50 border-none focus-visible:ring-1 transition-all rounded-full"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 left-0 w-full md:w-[400px] bg-card border border-border shadow-lg rounded-xl overflow-hidden z-50 flex flex-col max-h-[70vh]"
          >
            <div className="overflow-y-auto p-2 scrollbar-thin">
              
              {/* PATIENTS CLUSTER */}
              <div className="mb-3">
                <div className="px-2 py-1 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Patients</h3>
                </div>
                <div className="space-y-1 mt-1">
                  {MOCK_RESULTS.patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).map(patient => (
                    <button key={patient.id} className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 flex flex-col items-start transition-colors" onClick={() => setIsOpen(false)}>
                      <span className="text-sm font-medium text-foreground">{patient.name}</span>
                      <span className="text-[10px] text-muted-foreground">{patient.detail}</span>
                    </button>
                  ))}
                  {MOCK_RESULTS.patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                    <p className="text-xs text-muted-foreground px-3 py-1 italic">No matching patients</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-border/50 w-full my-2" />

              {/* APPOINTMENTS CLUSTER */}
              <div className="mb-3">
                <div className="px-2 py-1 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-secondary" />
                  <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">Appointments</h3>
                </div>
                <div className="space-y-1 mt-1">
                  {MOCK_RESULTS.appointments.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).map(apt => (
                    <button key={apt.id} className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 flex flex-col items-start transition-colors" onClick={() => setIsOpen(false)}>
                      <span className="text-sm font-medium text-foreground">{apt.name}</span>
                      <span className="text-[10px] text-muted-foreground">{apt.detail}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/50 w-full my-2" />

              {/* RECORDS CLUSTER */}
              <div className="mb-1">
                <div className="px-2 py-1 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                  <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">Records</h3>
                </div>
                <div className="space-y-1 mt-1">
                  {MOCK_RESULTS.records.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).map(rec => (
                    <button key={rec.id} className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 flex flex-col items-start transition-colors" onClick={() => setIsOpen(false)}>
                      <span className="text-sm font-medium text-foreground">{rec.name}</span>
                      <span className="text-[10px] text-muted-foreground">{rec.detail}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
            
            <div className="bg-muted p-2 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground">
              <span>Press <kbd className="px-1.5 py-0.5 bg-background rounded border shadow-sm mx-1">Enter</kbd> to see all results</span>
              <span>Advanced Search &rarr;</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
