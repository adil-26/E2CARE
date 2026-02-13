

# 🏥 Patient Portal — MVP Implementation Plan

## Overview Name is E2Care 
A patient-centric digital health portal with a clean, minimal design. Built with React + Supabase for auth, database, and storage. The MVP covers the core patient journey: health dashboard, medical records, appointments, messaging, AI assistant, and emergency access.
Which can be acces in both the webite and if it is phine then make the ui as the application like ui
---

## Phase 1: Foundation & Authentication

### User Authentication
- Email/password signup and login with the ggole authentication
- Patient profile setup (name, DOB, gender, blood group, contact info, profile photo)
- Protected routes — all pages require login

### Navigation & Layout
- Clean sidebar navigation with icons for all modules
- Top header with greeting, notification bell, and profile avatar
- Mobile-responsive layout with collapsible sidebar

---

## Phase 2: Dashboard (Home)

### Health Overview Screen (`/dashboard`)
- Dynamic greeting (Good Morning/Afternoon/Evening + patient name)
- Health status badge (Stable / Attention / Critical)
- Quick action buttons: Book Appointment, Upload Report, Share Medical ID
- Ai Chat

### Vital Cards
- Blood Pressure, Heart Rate, Blood Sugar, BMI display cards and more ..
- Color-coded thresholds (green/yellow/red)
- Log new readings via modal

### Daily Routine Tracker
- Water intake counter, sleep hours, steps, exercise, diet logging -Animated
- Simple daily tracking with visual progress -Animated

### AI Health Score
- Composite score (0–100) based on vitals and medical history - Calculate 
- Visual gauge/meter display - Calculate

### Upcoming Appointments Widget
- Next appointment card with doctor name, date, time

### Medcicine intake higlght wiht notification fetures if that medication given by the Dr
-   Share Scan QR code to view profile.
Visitor must enter the 6-digit PIN.
---

## Phase 3: Medical History Wizard

### Multi-Step Health History Form (`/medical-history`) u need to search the webb that what all data could be asked more deeply as i have shared the some example 
- **Step 1:** Birth history (delivery type, birth weight more)
- **Step 2:** Childhood illnesses checklist
- **Step 3:** Family medical history (diabetes, BP, cardiac — by parent more details as a doctor is asking )
- **Step 4:** Gender-specific health data
- **Step 5:** Surgeries & hospitalizations
- **Step 6:** Allergies (drug, food, environmental)
- **Step 7:** Lifestyle & habits (smoking, alcohol, exercise And moore that can be asked )
- Auto-save progress at each step, resume anytime
- Profile completion meter on dashboard

---

## Phase 4: Health Reports & Records  
AI Reoort analayse With ocr teseract 
--Upload: User uploads a file in Report Uploader.
Conversion: The server converts the image to a "Base64" string.
The "Eye": This string is sent to api.groq.com.
Extraction: The Llama-4 model looks at the image and follows your prompt: "Extract ALL text... Maintain structure".
Result: It returns clean, structured text that is then saved to your database.
and then this will be given to the ai model then they provide the data in jason file every sinle data fromm name to the report numerci dataa nd the name of the test and then it will show in yhe graph formate and sae then we will upload for the next dat then it will analyse and use the grph to see how was befor and how is now 

### Report Archive (`/dashboard/reports`)
- Upload medical reports (PDF, JPG, PNG) to Supabase Storage
- Filter by category: Blood Work, MRI, CT Scan, X-Ray
- Search by report name or doctor
- In-app report viewer

### Records Tabs (`/records`)
- **Prescriptions:** View/download doctor-issued prescriptions
- **Medications:** Active medication list with dosage, schedule (morning/afternoon/night), pill reminders
- **Reports:** Unified view linked to Health Reports

---

## Phase 5: Appointments & Doctor Discovery

### Find a Doctor (`/appointments`)
- Search doctors by name or specialty
- Doctor cards: name, specialization, experience, rating, fee
- Booking flow: select date → pick time slot → confirm

### Appointment Management
- View upcoming and past appointments
- Cancel/reschedule options

---

## Phase 6: Messages & Communication

### Doctor-Patient Chat (`/dashboard/messages`)
- Sidebar listing engaged doctors with online/offline status
- Real-time text messaging
- Audio call link and video call (Google Meet link)
- Message history

---

## Phase 7: AI Health Assistant

### AI Chat (`/chat`)
- Conversational AI assistant aware of patient profile and medical history
- Medical Q&A, lifestyle guidance, diet suggestions
- Streaming chat responses
- Context from uploaded reports and vitals

---

## Phase 8: Emergency Mode

### Emergency Access (`/emergency`)
- Prominent emergency button accessible from every screen
- Emergency profile: blood group, allergies, chronic conditions, current medications
- QR code for temporary read-only access by doctors/paramedics
- Emergency contacts with one-tap call
- Works with minimal data (offline-ready design)

---

## Phase 9: Chronic Disease Management

### Condition Dashboards (`/conditions`)
- Support for Diabetes, Hypertension, Thyroid, Asthma
- Trend charts showing readings over time (Recharts)
- AI alerts for concerning patterns (e.g., "3 high readings in a row")
- Medication adherence scoring

---

## Phase 10: Health Timeline & Wallet

### Health Timeline (`/timeline`)
- Chronological visual timeline of appointments, reports, surgeries, medications, symptoms
- Scrollable journey view

### Wallet & Referrals (`/dashboard/wallet`, `/dashboard/referral`)
- Wallet balance display, withdraw to UPI/bank
- Transaction history with status
- Referral code, sharing, stats, and earnings tracking

---

## Design Principles
- **Clean & minimal** aesthetic with plenty of white space
- Soft blues and greens for a trustworthy medical feel
- Card-based layouts with subtle shadows
- Consistent iconography using Lucide icons
- Fully responsive for desktop and mobile

## Technical Foundation
- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Charts:** Recharts for vitals and trend visualization
- **AI:** Lovable AI integration for the health assistant
- **Security:** Row-level security, role-based access, data privacy controls

