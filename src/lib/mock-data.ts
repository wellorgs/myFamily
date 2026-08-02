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
