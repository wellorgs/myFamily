// Seeds one fully-linked demo family in Firestore so the demo accounts show real,
// derived data instead of client-side mock. Signs in as each existing account
// (client SDK) and writes to the exact collections/shapes the app's data hooks
// read, honoring the deployed security rules (each user writes its own profile +
// membership; the parent writes the shared family data).
//
// Run:  node scripts/seed-demo-family.mjs
// Requires the demo accounts to already exist in Firebase Auth.

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  getFirestore, doc, setDoc, collection, serverTimestamp, Timestamp,
  query, where, getDocs, deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBMYMS7dv6cSfSq2O5VrUH2mqlya64eByg",
  authDomain: "myfamily-a5ec1.firebaseapp.com",
  projectId: "myfamily-a5ec1",
  storageBucket: "myfamily-a5ec1.firebasestorage.app",
  messagingSenderId: "543100043664",
  appId: "1:543100043664:web:2a7de34bf26315041b7315",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const FAMILY_ID = "family_test_001";
const INVITE_CODE = "JOHNSON1";

const ACCOUNTS = [
  { email: "mom@family.local", password: "MomTest123!", name: "Mom (Anita)", role: "parent" },
  { email: "dad@family.local", password: "DadTest123!", name: "Dad (Rajiv)", role: "parent" },
  { email: "child@family.local", password: "ChildTest123!", name: "Priya (Daughter)", role: "family" },
];

const uids = {};

async function as(account, fn) {
  const cred = await signInWithEmailAndPassword(auth, account.email, account.password);
  uids[account.email] = cred.user.uid;
  await fn(cred.user.uid);
  await signOut(auth);
}

// Pass 1 — every user writes its own profile + membership (rules require this).
async function seedIdentity(account) {
  await as(account, async (uid) => {
    await setDoc(doc(db, "profiles", uid), {
      id: uid, full_name: account.name, email: account.email,
      role: account.role, family_id: FAMILY_ID,
      updated_at: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(db, "families", FAMILY_ID, "family_members", uid), {
      id: uid, family_id: FAMILY_ID, user_id: uid,
      name: account.name, role: account.role, joined_at: serverTimestamp(),
    });
    console.log(`  ✓ ${account.email} → ${uid}`);
  });
}

// Pass 2 — the parent writes the family doc + all shared, derived data.
async function seedFamilyData() {
  const mom = uids["mom@family.local"];
  const dad = uids["dad@family.local"];

  await as(ACCOUNTS[0], async () => {
    // Family
    await setDoc(doc(db, "families", FAMILY_ID), {
      id: FAMILY_ID, name: "Kumar Family", invite_code: INVITE_CODE,
      created_by: mom, member_count: 3,
      created_at: serverTimestamp(), updated_at: serverTimestamp(),
    }, { merge: true });

    // Purge any prior auto-id duplicates (earlier seed runs used addDoc, which
    // stacked duplicate rows every run). Delete by family/parent, then rewrite
    // with deterministic ids below.
    const purge = async (coll, field, value) => {
      const snap = await getDocs(query(collection(db, coll), where(field, "==", value)));
      for (const d of snap.docs) await deleteDoc(d.ref);
    };
    await purge("medicines", "familyId", FAMILY_ID);
    await purge("notifications", "familyId", FAMILY_ID);
    await purge("media_posts", "familyId", FAMILY_ID);
    for (const pid of [mom, dad]) {
      await purge("events", "parentId", pid);
      await purge("timeline", "parentId", pid);
    }

    // parents/{uid}: carries BOTH the child-dashboard fields and the
    // parent-home today-cards fields, keyed by the parent's uid.
    await setDoc(doc(db, "parents", mom), {
      familyId: FAMILY_ID, name: "Mom (Anita)", status: "safe", lastSeen: "Just now",
      wellness: 88, medsPending: 0, steps: 4210, sleep: "7h 20m", battery: 78,
      nextMedicine: { name: "Metformin", dose: "500 mg", time: "8:00 AM", food: "After breakfast" },
      nextAppointment: { doctor: "Dr. Sharma", specialty: "Cardiology", time: "4:00 PM", address: "Apollo Clinic, MG Road" },
      todayWalk: { goal: 5000, done: 4210 }, todayWater: { goal: 8, done: 5 },
      lastFamilyMessage: { from: "Priya (Daughter)", preview: "Hi Mom, don't forget your evening walk 💙" },
      wellnessScore: 88,
    });
    await setDoc(doc(db, "parents", dad), {
      familyId: FAMILY_ID, name: "Dad (Rajiv)", status: "needs-attention", lastSeen: "12 min ago",
      wellness: 74, medsPending: 1, steps: 1820, sleep: "6h 05m", battery: 42,
      nextMedicine: { name: "Atorvastatin", dose: "10 mg", time: "9:00 PM", food: "After dinner" },
      nextAppointment: { doctor: "Dr. Rao", specialty: "General", time: "11:00 AM", address: "City Clinic" },
      todayWalk: { goal: 5000, done: 1820 }, todayWater: { goal: 8, done: 3 },
      lastFamilyMessage: { from: "Arjun (Son)", preview: "Call me when you're free, Dad." },
      wellnessScore: 74,
    });

    // medicines (queried by parentId)
    const meds = [
      { parentId: mom, name: "Metformin", dose: "500 mg", freq: "2x daily", food: "After food", stock: 18, verified: true, status: "approved" },
      { parentId: mom, name: "Amlodipine", dose: "5 mg", freq: "1x morning", food: "After breakfast", stock: 6, verified: true, status: "approved" },
      { parentId: dad, name: "Atorvastatin", dose: "10 mg", freq: "1x night", food: "After dinner", stock: 24, verified: false, status: "pending" },
    ];
    for (const m of meds) {
      // Deterministic id so re-running the seed overwrites instead of duplicating.
      const id = `${m.parentId}_${m.name}`.replace(/[^A-Za-z0-9_]/g, "");
      await setDoc(doc(db, "medicines", id), { ...m, familyId: FAMILY_ID, createdAt: serverTimestamp() });
    }

    // timeline (queried by parentId, ordered by timestamp)
    const tl = [
      { time: "8:00 AM", label: "Medicine taken" },
      { time: "9:15 AM", label: "Morning walk — 1,240 steps" },
      { time: "11:02 AM", label: "Priya called (12 min)" },
      { time: "1:00 PM", label: "Lunch reminder completed" },
      { time: "4:00 PM", label: "Dr. Sharma appointment" },
      { time: "7:00 PM", label: "AI conversation (5 min)" },
      { time: "9:12 PM", label: "Phone charging started" },
    ];
    let t = Date.now();
    for (let i = 0; i < tl.length; i++) {
      await setDoc(doc(db, "timeline", `${mom}_tl_${i}`), {
        parentId: mom, time: tl[i].time, label: tl[i].label, tone: "blue",
        timestamp: Timestamp.fromMillis(t),
      });
      t -= 60 * 60 * 1000;
    }

    // notifications → child-dashboard alerts (queried by familyId)
    const alerts = [
      { tone: "amber", title: "Dad missed evening medicine", time: "20 min ago" },
      { tone: "blue", title: "Mom completed her walk (3,200 steps)", time: "1h ago" },
      { tone: "amber", title: "Dad's phone battery low (42%)", time: "2h ago" },
    ];
    for (let i = 0; i < alerts.length; i++) {
      await setDoc(doc(db, "notifications", `${FAMILY_ID}_alert_${i}`), { ...alerts[i], familyId: FAMILY_ID, createdAt: serverTimestamp() });
    }

    // insights/{parentId} (flat fields the hook overrides onto the labels) — seed
    // BOTH parents so the child's insights view has data whichever parent is first.
    const insightsFor = (adh, walk, sleep) => ({
      medicineAdherence: adh, adherenceTrend: "+4% this week",
      walkingTrend: walk, walkingTrendText: "Up this week",
      sleepTrend: sleep, sleepTrendText: "Steady",
      moodTrend: "Positive", moodTrendText: "Improving",
      phoneUsage: "2h 40m", phoneUsageTrendText: "Normal",
      hydration: "6/8", hydrationTrendText: "On track",
      fallRisk: "Low", fallRiskTrendText: "No incidents",
      loneliness: "Low", lonelinessTrendText: "3 calls today",
    });
    await setDoc(doc(db, "insights", mom), insightsFor("92%", "5.2k avg", "7h 10m"));
    await setDoc(doc(db, "insights", dad), insightsFor("78%", "3.1k avg", "6h 05m"));

    // weeklyStats/{parentId} → insights adherence chart (both parents)
    const week = (vals) => ({ days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({ d, adh: vals[i] })) });
    await setDoc(doc(db, "weeklyStats", mom), week([100, 80, 100, 60, 100, 90, 100]));
    await setDoc(doc(db, "weeklyStats", dad), week([80, 60, 100, 40, 80, 70, 90]));

    // recommendations/{familyId} (string[])
    await setDoc(doc(db, "recommendations", FAMILY_ID), {
      items: [
        "Dad missed his evening dose twice this week — a reminder call around 8 PM helps.",
        "Mom's walking streak is strong (5 days). A word of encouragement goes a long way.",
        "Refill Dad's Atorvastatin soon — about 5 days of tablets left.",
      ],
    });

    // events → parent home "Upcoming today" (queried by parentId, ordered by time)
    const events = [
      { time: "4:00 PM", label: "Dr. Sharma — Cardiology" },
      { time: "6:30 PM", label: "Evening walk reminder" },
      { time: "9:00 PM", label: "Night medicine — Atorvastatin" },
    ];
    for (let i = 0; i < events.length; i++) {
      await setDoc(doc(db, "events", `${mom}_ev_${i}`), { parentId: mom, time: events[i].time, label: events[i].label });
    }

    // media_posts → family feed (queried by familyId, ordered by createdAt)
    const feed = [
      { kind: "voice", from: "Priya", emoji: "👩🏽", time: "10 min ago", caption: "Hi Mom, don't forget your walk 💙" },
      { kind: "photo", from: "Arjun", emoji: "👨🏽", time: "2h ago", caption: "Weekend trip photos", scene: "🏞️" },
    ];
    for (let i = 0; i < feed.length; i++) {
      await setDoc(doc(db, "media_posts", `${FAMILY_ID}_post_${i}`), { ...feed[i], familyId: FAMILY_ID, createdAt: serverTimestamp() });
    }

    console.log("  ✓ family + parent data (parents, medicines, timeline, alerts, insights, weeklyStats, recommendations, feed)");
  });
}

async function main() {
  console.log("🌱 Seeding demo family (family_test_001)…\n");
  for (const a of ACCOUNTS) await seedIdentity(a);
  await seedFamilyData();
  console.log("\n✅ Done. Sign in as any account to see the linked family:");
  ACCOUNTS.forEach((a) => console.log(`   ${a.email} / ${a.password}  (${a.role})`));
  process.exit(0);
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); });
