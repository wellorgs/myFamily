export const todayCards = {
  medicine: { name: "Metformin", dose: "500 mg", time: "8:00 AM", food: "After breakfast" },
  appointment: { doctor: "Dr. Sharma", specialty: "Cardiology", time: "4:00 PM", address: "Apollo Clinic, MG Road" },
  walk: { goal: 3000, done: 1820 },
  water: { goal: 8, done: 4 },
  familyMessage: { from: "Priya (Daughter)", preview: "Hi Dad, don't forget your evening walk 💙" },
  wellness: 82,
};

export const upcomingEvents = [
  { time: "1:00 PM", label: "Lunch reminder" },
  { time: "4:00 PM", label: "Dr. Sharma — Cardiology" },
  { time: "6:30 PM", label: "Evening walk" },
  { time: "9:00 PM", label: "Sleep wind-down" },
];

export const healthCards = [
  { key: "bp", label: "Blood Pressure", value: "122 / 78", unit: "mmHg", tone: "green" },
  { key: "sugar", label: "Sugar (Fasting)", value: "104", unit: "mg/dL", tone: "green" },
  { key: "hr", label: "Heart Rate", value: "72", unit: "bpm", tone: "green" },
  { key: "weight", label: "Weight", value: "68.4", unit: "kg", tone: "neutral" },
  { key: "sleep", label: "Sleep", value: "7h 20m", unit: "last night", tone: "green" },
  { key: "hydration", label: "Hydration", value: "4 / 8", unit: "glasses", tone: "amber" },
  { key: "walk", label: "Walking", value: "1,820", unit: "steps", tone: "amber" },
  { key: "adherence", label: "Medicine", value: "92%", unit: "this week", tone: "green" },
] as const;

export const familyMembers = [
  { id: "priya", name: "Priya", relation: "Daughter", emoji: "👩🏽", emergency: true },
  { id: "arjun", name: "Arjun", relation: "Son", emoji: "👨🏽", emergency: false },
  { id: "meera", name: "Meera", relation: "Wife", emoji: "👵🏽", emergency: true },
  { id: "dr", name: "Dr. Sharma", relation: "Cardiologist", emoji: "🩺", emergency: false },
];

export const aiSuggestions = [
  "Call my daughter",
  "Explain this medicine",
  "What's today's weather?",
  "Read my appointments",
  "Tell me today's medicines",
  "Play relaxing music",
  "Read my messages",
  "What should I eat?",
];

export const parents = [
  { id: "mom", name: "Mom (Anita)", status: "safe", steps: 4210, medsPending: 0, battery: 78, lastSeen: "Just now", mood: "Cheerful", sleep: "7h 20m", wellness: 88 },
  { id: "dad", name: "Dad (Rajiv)", status: "attention", steps: 1820, medsPending: 1, battery: 42, lastSeen: "12 min ago", mood: "Calm", sleep: "6h 05m", wellness: 74 },
];

export const alerts = [
  { id: 1, tone: "amber", title: "Dad missed evening medicine", time: "20 min ago" },
  { id: 2, tone: "blue", title: "Mom completed her walk (3,200 steps)", time: "1h ago" },
  { id: 3, tone: "amber", title: "Dad's phone battery low (42%)", time: "2h ago" },
];

export const timeline = [
  { time: "8:00 AM", label: "Medicine taken", tone: "green", icon: "pill" },
  { time: "9:15 AM", label: "Morning walk — 1,240 steps", tone: "blue", icon: "walk" },
  { time: "11:02 AM", label: "Priya called (12 min)", tone: "purple", icon: "phone" },
  { time: "1:00 PM", label: "Lunch reminder completed", tone: "green", icon: "utensils" },
  { time: "4:00 PM", label: "Dr. Sharma appointment", tone: "blue", icon: "stethoscope" },
  { time: "7:00 PM", label: "AI conversation (5 min)", tone: "purple", icon: "sparkles" },
  { time: "9:12 PM", label: "Phone charging started", tone: "amber", icon: "battery" },
];

export const insights = [
  { key: "adh", label: "Medicine adherence", value: "92%", trend: "+4% vs last week", tone: "green" },
  { key: "walk", label: "Walking trend", value: "2.9k avg", trend: "-8% vs last week", tone: "amber" },
  { key: "sleep", label: "Sleep trend", value: "7h 05m", trend: "steady", tone: "green" },
  { key: "mood", label: "Mood trend", value: "Positive", trend: "improving", tone: "green" },
  { key: "phone", label: "Phone usage", value: "Normal", trend: "typical for Dad", tone: "green" },
  { key: "hyd", label: "Hydration", value: "5 / 8", trend: "below target", tone: "amber" },
  { key: "fall", label: "Fall risk", value: "Low", trend: "no incidents", tone: "green" },
  { key: "lonely", label: "Loneliness score", value: "Medium", trend: "fewer calls this week", tone: "amber" },
];

export const recommendations = [
  "Dad has missed evening medicines twice this week. Consider a check-in call around 8 PM.",
  "Mom's walking is trending down. Suggest an evening walk with a family member.",
  "Dad's hydration is below target — send a friendly reminder.",
];

export const medicines = [
  { id: "m1", name: "Metformin", dose: "500 mg", freq: "2x daily", food: "After food", stock: 18, verified: true },
  { id: "m2", name: "Amlodipine", dose: "5 mg", freq: "1x morning", food: "After breakfast", stock: 6, verified: true },
  { id: "m3", name: "Atorvastatin", dose: "10 mg", freq: "1x night", food: "After dinner", stock: 24, verified: false },
];

export const appointments = [
  { id: "a1", doctor: "Dr. Sharma", specialty: "Cardiology", date: "Today", time: "4:00 PM", hospital: "Apollo Clinic" },
  { id: "a2", doctor: "Dr. Iyer", specialty: "Endocrinology", date: "Fri, Aug 2", time: "11:30 AM", hospital: "Fortis" },
];

export const weeklyChart = [
  { d: "Mon", steps: 3200, sleep: 7.2, adh: 100 },
  { d: "Tue", steps: 2800, sleep: 6.8, adh: 100 },
  { d: "Wed", steps: 3400, sleep: 7.5, adh: 80 },
  { d: "Thu", steps: 1800, sleep: 6.2, adh: 100 },
  { d: "Fri", steps: 2600, sleep: 7.1, adh: 100 },
  { d: "Sat", steps: 3800, sleep: 7.8, adh: 100 },
  { d: "Sun", steps: 1820, sleep: 7.3, adh: 60 },
];

export const familyFeed = [
  { id: "f1", kind: "photo", from: "Priya", emoji: "👩🏽", relation: "Daughter", time: "10 min ago", caption: "Aarav's first day at school!", gradient: "from-pink-300 via-orange-200 to-yellow-200", scene: "🎒🏫" },
  { id: "f2", kind: "voice", from: "Arjun", emoji: "👨🏽", relation: "Son", time: "1 h ago", caption: "Voice note · 0:18", duration: 18 },
  { id: "f3", kind: "video", from: "Meera", emoji: "👵🏽", relation: "Wife", time: "Yesterday", caption: "Sunset from the balcony", gradient: "from-purple-400 via-pink-300 to-orange-300", scene: "🌇🎥" },
  { id: "f4", kind: "text", from: "Priya", emoji: "👩🏽", relation: "Daughter", time: "Yesterday", caption: "Papa, don't forget your evening walk 💙", body: "Papa, don't forget your evening walk 💙 I'll call you at 7 to hear how it went. Love you!" },
  { id: "f5", kind: "photo", from: "Arjun", emoji: "👨🏽", relation: "Son", time: "2 d ago", caption: "Weekend hike with the kids", gradient: "from-emerald-300 via-teal-200 to-sky-200", scene: "🥾🏞️" },
] as const;

export const notificationItems = [
  { id: "n0", kind: "call", tone: "red", title: "Missed call from Dad", time: "5 min ago", detail: "Dad tried to call twice. Tap to call back." },
  { id: "n1", kind: "sos", tone: "red", title: "Dad triggered SOS", time: "Yesterday, 8:12 PM", detail: "Location shared. Priya responded in 42 seconds. Resolved as false alarm." },
  { id: "n2", kind: "medicine", tone: "amber", title: "Mom missed evening medicine", time: "Yesterday, 9:05 PM", detail: "Atorvastatin 10 mg was scheduled for 9:00 PM. Reminder repeated 3 times." },
  { id: "n3", kind: "voice", tone: "blue", title: "Priya sent a voice message", time: "Today, 7:20 AM", detail: "0:24 · Good morning Papa, your tea is ready downstairs." },
  { id: "n_call2", kind: "call", tone: "blue", title: "Incoming call — Priya", time: "Today, 7:45 AM", detail: "Tap to call Priya back." },
  { id: "n4", kind: "photo", tone: "blue", title: "Arjun shared a photo", time: "Today, 8:05 AM", detail: "Weekend hike with the kids." },
  { id: "n5", kind: "walk", tone: "green", title: "Dad completed morning walk", time: "Today, 8:40 AM", detail: "1,240 steps · 18 minutes · Around Lodhi Garden loop." },
  { id: "n6", kind: "summary", tone: "blue", title: "Weekly summary is ready", time: "Sun, 6:00 PM", detail: "Adherence 92%. Walking down 8%. Two missed evening medicines." },
] as const;
