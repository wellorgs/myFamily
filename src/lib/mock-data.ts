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

export const MOCK_MEDICINES = [
  {
    id: "med_001",
    name: "Aspirin",
    dosage: "500mg",
    frequency: "Twice daily",
    prescribedBy: "Dr. Smith",
    purpose: "Pain relief & blood thinner",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2027-01-15"),
    instructions: "Take with water after meals",
  },
  {
    id: "med_002",
    name: "Metformin",
    dosage: "1000mg",
    frequency: "Once daily",
    prescribedBy: "Dr. Johnson",
    purpose: "Diabetes management",
    startDate: new Date("2025-06-01"),
    endDate: null,
    instructions: "Take in the morning before breakfast",
  },
  {
    id: "med_003",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    prescribedBy: "Dr. Chen",
    purpose: "Blood pressure control",
    startDate: new Date("2025-03-20"),
    endDate: null,
    instructions: "Take in evening",
  },
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

export const parents = [
  { id: "user_mom", name: "Sarah Johnson", role: "parent", age: 58 },
  { id: "user_dad", name: "Michael Johnson", role: "parent", age: 61 },
];

export const insights = [
  { title: "Consistent Medication", value: "98%", icon: "pill" },
  { title: "Steps Today", value: "8,500", icon: "footsteps" },
  { title: "Water Intake", value: "2L / 8 cups", icon: "droplet" },
  { title: "Sleep Quality", value: "Good", icon: "moon" },
];

export const recommendations = [
  { id: 1, title: "Time for afternoon walk", time: "3:00 PM", icon: "walk" },
  { id: 2, title: "Refill medicine prescription", time: "Tomorrow", icon: "pharmacy" },
  { id: 3, title: "Drink more water", time: "Ongoing", icon: "water" },
  { id: 4, title: "Upcoming appointment", time: "Aug 5 at 10 AM", icon: "calendar" },
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

export const alerts = [
  { id: "1", title: "Medication Reminder", message: "Time to take your afternoon medication", severity: "info" },
  { id: "2", title: "Doctor Appointment Soon", message: "You have an appointment tomorrow at 10 AM", severity: "warning" },
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

export const notificationItems = [
  { id: "1", title: "Medication Reminder", description: "Take your afternoon medication", read: false },
  { id: "2", title: "Appointment Reminder", description: "You have an appointment tomorrow", read: false },
];

export const timeline = MOCK_ACTIVITIES;

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
