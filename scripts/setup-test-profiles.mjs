import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// Try to load service account key
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  "C:\Users\akhil\Downloads\myfamily-a5ec1-firebase-adminsdk-fbsvc-378c5a0bbd.json";

let app;
try {
  const keyData = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const credential = cert(keyData);
  app = initializeApp({ credential });
  console.log("✓ Loaded Admin SDK\n");
} catch (e) {
  console.error("Service account key not available. Requires: npm run seed:test-users first");
  process.exit(1);
}

const db = getFirestore(app);

const updates = [
  { uid: "mYTvkmKt1dYdAk3CrlGdUJNAjri2", email: "mom@family.local", role: "parent" },
  { uid: "HZmuhXCkxzdup92HLk7KcXg2gqV2", email: "dad@family.local", role: "parent" },
  { uid: "Z4ZRMeD77IRqbdYZEzSq4fpdXUB3", email: "child@family.local", role: "family" },
];

async function setup() {
  console.log("⚙️  Setting up test profiles with family...\n");
  
  for (const update of updates) {
    try {
      await db.collection("users").doc(update.uid).set({
        id: update.uid,
        email: update.email,
        full_name: update.email.split("@")[0].charAt(0).toUpperCase() + update.email.split("@")[0].slice(1),
        role: update.role,
        family_id: "family_test_001",
        created_at: new Date(),
        updated_at: new Date(),
      }, { merge: true });
      console.log(`✓ ${update.email}: role=${update.role}`);
    } catch (error) {
      console.error(`✗ ${update.email}: ${error.message}`);
    }
  }

  // Create family doc
  try {
    await db.collection("families").doc("family_test_001").set({
      id: "family_test_001",
      name: "Johnson Family",
      invite_code: "JOHNSON1",
      created_by: "mYTvkmKt1dYdAk3CrlGdUJNAjri2",
      created_at: new Date(),
      updated_at: new Date(),
      member_count: 3,
    }, { merge: true });
    console.log(`✓ Family created: Johnson Family`);
  } catch (error) {
    console.error(`✗ Family: ${error.message}`);
  }

  console.log("\n✓ Test setup complete! Login now - no onboarding needed.");
  process.exit(0);
}

setup();
