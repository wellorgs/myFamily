// Test/development mock data - use when Gemini API unavailable
import { Timestamp } from "firebase/firestore";

export const MOCK_ACCOUNTS = {
  mom: {
    email: "mom@family.local",
    password: "MomTest123!",
    name: "Sarah Johnson",
    role: "parent" as const,
  },
  dad: {
    email: "dad@family.local",
    password: "DadTest123!",
    name: "Michael Johnson",
    role: "parent" as const,
  },
  child: {
    email: "child@family.local",
    password: "ChildTest123!",
    name: "Emma Johnson",
    role: "family" as const,
  },
};

// Shape must match the medicines list (family.medicines + parent-detail Meds
// tab): name/dose/freq/food/stock/verified. Content mirrors the meds screenshot.
export const MOCK_MEDICINES = [
  { id: "med_001", name: "Metformin", dose: "500 mg", freq: "2x daily", food: "After food", stock: 18, verified: true },
  { id: "med_002", name: "Amlodipine", dose: "5 mg", freq: "1x morning", food: "After breakfast", stock: 6, verified: true },
  { id: "med_003", name: "Atorvastatin", dose: "10 mg", freq: "1x night", food: "After dinner", stock: 24, verified: false },
];

export const MOCK_ACTIVITIES = [
  {
    id: "act_001",
    timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
    kind: "medicine",
    actor: "Sarah Johnson",
    description: "Took morning medications",
  },
  {
    id: "act_002",
    timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)),
    kind: "activity",
    actor: "Michael Johnson",
    description: "Attended doctor appointment",
  },
  {
    id: "act_003",
    timestamp: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    kind: "milestone",
    actor: "Emma Johnson",
    description: "Completed wellness check-in",
  },
];

export const MOCK_FAMILY_DATA = {
  familyId: "family_test_001",
  familyName: "Johnson Family",
  members: [
    { id: "user_mom", name: "Sarah Johnson", role: "parent", age: 58 },
    { id: "user_dad", name: "Michael Johnson", role: "parent", age: 61 },
    { id: "user_child", name: "Emma Johnson", role: "family", age: 28 },
  ],
};

export function getMockMedicineOCR() {
  const samples = [
    { name: "Aspirin", dosage: "500mg", frequency: "Twice daily", instructions: "Take with food" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "Every 6-8 hours", instructions: "Do not exceed 1200mg daily" },
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}

// Shape must match family.dashboard + family.parents.$id (id/status/lastSeen/
// wellness/medsPending/steps/sleep/battery). Content mirrors the child dashboard
// "with data" screenshot.
export const parents = [
  { id: "mom", name: "Mom (Anita)", status: "safe", lastSeen: "Just now", wellness: 88, medsPending: 0, steps: 4210, sleep: "7h 20m", battery: 78 },
  { id: "dad", name: "Dad (Rajiv)", status: "needs-attention", lastSeen: "12 min ago", wellness: 74, medsPending: 1, steps: 1820, sleep: "6h 05m", battery: 42 },
];

export const insights = [
  { title: "Consistent Medication", value: "98%", icon: "pill" },
  { title: "Steps Today", value: "8,500", icon: "footsteps" },
  { title: "Water Intake", value: "2L / 8 cups", icon: "droplet" },
  { title: "Sleep Quality", value: "Good", icon: "moon" },
];

// Consumed as string[] (rendered directly as text in family.insights).
export const recommendations = [
  "Dad missed his evening dose twice this week — a gentle reminder call around 8 PM helps.",
  "Mom's walking streak is strong (5 days). A word of encouragement goes a long way.",
  "Refill Dad's Metformin soon — about 5 days of tablets left.",
  "Dad's sleep dipped below 6 hours three nights running. Worth a check-in.",
];

export const weeklyChart = [
  { day: "Mon", steps: 7200, target: 8000 },
  { day: "Tue", steps: 8500, target: 8000 },
  { day: "Wed", steps: 9100, target: 8000 },
  { day: "Thu", steps: 8800, target: 8000 },
  { day: "Fri", steps: 7600, target: 8000 },
  { day: "Sat", steps: 10200, target: 8000 },
  { day: "Sun", steps: 6500, target: 8000 },
];

export { MOCK_MEDICINES as medicines };

// Shape must match what parent.home + useTodayCards consume (medicine/appointment/
// walk/water/familyMessage/wellness). This is the "with data" dashboard state.
export const todayCards = {
  medicine: { name: "Metformin", dose: "500 mg", time: "8:00 AM", food: "After breakfast" },
  appointment: { doctor: "Dr. Sharma", specialty: "Cardiology", time: "4:00 PM", address: "Apollo Clinic, MG Road" },
  walk: { goal: 3000, done: 1820 },
  water: { goal: 8, done: 4 },
  familyMessage: { from: "Priya (Daughter)", preview: "Hi Dad, don't forget your evening walk 💙" },
  wellness: 82,
};

// Shape must match family.dashboard alerts (id/tone/title/time).
export const alerts = [
  { id: "1", tone: "amber", title: "Dad missed evening medicine", time: "20 min ago" },
  { id: "2", tone: "blue", title: "Mom completed her walk (3,200 steps)", time: "1h ago" },
  { id: "3", tone: "amber", title: "Dad's phone battery low (42%)", time: "2h ago" },
];

export const appointments = [
  { id: "1", title: "Cardiology", date: "Aug 5", time: "10:00 AM", doctor: "Dr. Chen" },
  { id: "2", title: "Dental Cleaning", date: "Aug 12", time: "2:30 PM", doctor: "Dr. Williams" },
];

export const healthCards = [
  { id: "1", title: "Blood Pressure", value: "125/80", status: "normal" },
  { id: "2", title: "Heart Rate", value: "72", status: "normal" },
  { id: "3", title: "Steps", value: "8,500", goal: "10,000" },
];

export const familyFeed = [
  { id: "1", actor: "Sarah", action: "took medication", time: "2 hours ago" },
  { id: "2", actor: "Michael", action: "completed health check", time: "5 hours ago" },
  { id: "3", actor: "Emma", action: "shared a message", time: "1 day ago" },
];

export const familyMembers = [
  { id: "1", name: "Sarah Johnson", role: "parent", age: 58 },
  { id: "2", name: "Michael Johnson", role: "parent", age: 61 },
  { id: "3", name: "Emma Johnson", role: "family", age: 28 },
];

// Shape must match the notifications route (id/kind/tone/title/time). kinds are
// drawn from the FILTERS list: call, sos, medicine, photo, voice, text, activity.
export const notificationItems = [
  { id: "1", kind: "medicine", tone: "amber", title: "Time for Metformin (500 mg)", time: "8:00 AM", read: false },
  { id: "2", kind: "call", tone: "blue", title: "Missed call from Priya", time: "20 min ago", read: false },
  { id: "3", kind: "activity", tone: "green", title: "Mom completed her morning walk", time: "1h ago", read: true },
  { id: "4", kind: "photo", tone: "blue", title: "Arjun shared a photo", time: "Yesterday", read: true },
  { id: "5", kind: "sos", tone: "red", title: "SOS test alert resolved", time: "Yesterday", read: true },
];

// Parent-detail Timeline tab renders { time, label } rows (matches the real
// Firestore shape in use-timeline and the "mom tab" screenshot).
export const timeline = [
  { time: "8:00 AM", label: "Medicine taken" },
  { time: "9:15 AM", label: "Morning walk — 1,240 steps" },
  { time: "11:02 AM", label: "Priya called (12 min)" },
  { time: "1:00 PM", label: "Lunch reminder completed" },
  { time: "4:00 PM", label: "Dr. Sharma appointment" },
  { time: "7:00 PM", label: "AI conversation (5 min)" },
  { time: "9:12 PM", label: "Phone charging started" },
];

export const aiSuggestions = [
  { id: "1", title: "Increase water intake", description: "Aim for 8 glasses per day" },
  { id: "2", title: "Take a 30-minute walk", description: "Light exercise improves health" },
  { id: "3", title: "Check blood pressure regularly", description: "Monitor and log results" },
];

export const upcomingEvents = [
  { id: "1", title: "Doctor Appointment", date: "Aug 5", category: "medical" },
  { id: "2", title: "Medication Refill", date: "Aug 8", category: "health" },
  { id: "3", title: "Family Dinner", date: "Aug 10", category: "personal" },
];
