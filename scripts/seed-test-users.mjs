import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let credential;
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "C:\\Users\\akhil\\Downloads\\myfamily-a5ec1-firebase-adminsdk-fbsvc-378c5a0bbd.json";

try {
  const keyData = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  credential = cert(keyData);
  console.log("✓ Loaded service account from:", keyPath);
} catch (e) {
  console.error("Failed to load service account:", e.message);
  process.exit(1);
}

const app = getApps()[0] ?? initializeApp({ credential });

const auth = getAuth(app);
const db = getFirestore(app);

// 7 test accounts: fam-1 (1 parent + 2 kids), fam-2 (2 parents + 2 kids)
const families = [
  {
    id: "fam-1",
    name: "Kumar Family",
    inviteCode: "KUMAR1",
    users: [
      { uid: "rajesh-k", email: "rajesh.kumar@test.myfamily.app", password: "Test1234!", full_name: "Rajesh Kumar", role: "parent", language: "en" },
      { uid: "arjun-k", email: "arjun.kumar@test.myfamily.app", password: "Test1234!", full_name: "Arjun Kumar", role: "family", language: "en" },
      { uid: "priya-k", email: "priya.kumar@test.myfamily.app", password: "Test1234!", full_name: "Priya Kumar", role: "family", language: "en" },
    ],
  },
  {
    id: "fam-2",
    name: "Singh Family",
    inviteCode: "SINGH1",
    users: [
      { uid: "anita-s", email: "anita.singh@test.myfamily.app", password: "Test1234!", full_name: "Anita Singh", role: "parent", language: "hi" },
      { uid: "vikram-s", email: "vikram.singh@test.myfamily.app", password: "Test1234!", full_name: "Vikram Singh", role: "parent", language: "hi" },
      { uid: "rohan-s", email: "rohan.singh@test.myfamily.app", password: "Test1234!", full_name: "Rohan Singh", role: "family", language: "en" },
      { uid: "sneha-s", email: "sneha.singh@test.myfamily.app", password: "Test1234!", full_name: "Sneha Singh", role: "family", language: "en" },
    ],
  },
];

async function seedFamily(family) {
  const { id, name, inviteCode, users } = family;

  // Create family doc
  await db.collection("families").doc(id).set({
    id,
    name,
    invite_code: inviteCode,
    created_by: users.find(u => u.role === "parent")?.uid,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    member_count: users.length,
  }, { merge: true });

  // Create users + profiles + roles + family members
  for (const user of users) {
    try {
      await auth.getUser(user.uid);
      console.log(`User ${user.email} already exists`);
    } catch {
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: user.password,
        displayName: user.full_name,
        emailVerified: true,
      });
      console.log(`Created user: ${user.email}`);
    }

    // Profile
    await db.collection("profiles").doc(user.uid).set({
      id: user.uid,
      role: user.role,
      full_name: user.full_name,
      language: user.language,
      family_id: id,
      email: user.email,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    // User role
    await db.collection("families").doc(id).collection("user_roles").doc(user.uid).set({
      user_id: user.uid,
      family_id: id,
      role: user.role,
      assigned_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Family member
    await db.collection("families").doc(id).collection("family_members").doc(user.uid).set({
      id: user.uid,
      family_id: id,
      user_id: user.uid,
      name: user.full_name,
      role: user.role,
      joined_at: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  // Add test data for parents
  const parents = users.filter(u => u.role === "parent");
  for (const parent of parents) {
    // Parent profile
    await db.collection("parents").doc(parent.uid).set({
      id: parent.uid,
      family_id: id,
      profile_id: parent.uid,
      allergies: [],
      address: id === "fam-1" ? "Bangalore" : "Delhi",
      doctor_info: "Dr. Sharma",
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Sample medicines
    const medicines = [
      { name: "Metformin", dose: "500 mg", freq: "2x daily", food: "After food", stock: 30 },
      { name: "Amlodipine", dose: "5 mg", freq: "1x morning", food: "After breakfast", stock: 15 },
    ];
    for (const med of medicines) {
      await db.collection("medicines").add({
        parentId: parent.uid,
        familyId: id,
        name: med.name,
        dose: med.dose,
        frequency: med.freq,
        food_instruction: med.food,
        stock_available: med.stock,
        verified: true,
        created_at: FieldValue.serverTimestamp(),
      });
    }

    // Sample appointment
    await db.collection("appointments").add({
      parentId: parent.uid,
      familyId: id,
      doctor: "Dr. Sharma",
      specialty: "General Medicine",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "10:00 AM",
      hospital: "Apollo Clinic",
      created_at: FieldValue.serverTimestamp(),
    });

    // Sample vitals
    await db.collection("vitals").doc(parent.uid).set({
      bloodPressure: "120/80",
      sugarFasting: "95",
      heartRate: "72",
      weight: "70",
      sleep: "7h 20m",
      hydration: 4,
      steps: 3500,
      medicineAdherence: "92",
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });
  }
}

// Seed all families
for (const family of families) {
  console.log(`\n=== Seeding family: ${family.name} ===`);
  await seedFamily(family);
  family.users.forEach(user => {
    console.log(`${user.full_name} (${user.role}): ${user.email} / Test1234!`);
  });
}

console.log("\n✓ All test accounts created successfully!");
