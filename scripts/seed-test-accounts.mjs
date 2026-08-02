import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBMYMS7dv6cSfSq2O5VrUH2mqlya64eByg",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "myfamily-a5ec1.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "myfamily-a5ec1",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "myfamily-a5ec1.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "543100043664",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:543100043664:web:2a7de34bf26315041b7315",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const FAMILY_ID = "family_test_001";
const testAccounts = [
  { email: "mom@family.local", password: "MomTest123!", name: "Sarah Johnson", role: "parent" },
  { email: "dad@family.local", password: "DadTest123!", name: "Michael Johnson", role: "parent" },
  { email: "child@family.local", password: "ChildTest123!", name: "Emma Johnson", role: "family" },
];

async function seedTestAccounts() {
  try {
    console.log("🌱 Seeding test accounts with complete family data...\n");

    const userIds = {};

    // Step 1: Create Auth users and profiles
    for (const account of testAccounts) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, account.email, account.password);
        const userId = userCred.user.uid;
        userIds[account.email] = userId;

        // Create user profile document
        await setDoc(doc(db, "users", userId), {
          id: userId,
          email: account.email,
          full_name: account.name,
          role: account.role,
          family_id: FAMILY_ID,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });

        console.log(`✓ Created user: ${account.email}`);
        console.log(`  UID: ${userId}`);
        console.log(`  Role: ${account.role}\n`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠ User already exists: ${account.email}\n`);
          // Still need to get the UID for family setup
          try {
            const users = await db.collection('users').where('email', '==', account.email).limit(1).get();
            if (!users.empty) {
              userIds[account.email] = users.docs[0].id;
            }
          } catch (e) {
            console.error(`  Could not retrieve existing user: ${e.message}`);
          }
        } else {
          console.error(`✗ Error creating ${account.email}:`, error.message);
        }
      }
    }

    // Step 2: Create family document
    try {
      await setDoc(doc(db, "families", FAMILY_ID), {
        id: FAMILY_ID,
        name: "Johnson Family",
        invite_code: "JOHNSON1",
        created_by: userIds["mom@family.local"] || "unknown",
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        member_count: Object.keys(userIds).length,
      });
      console.log(`✓ Created family: Johnson Family`);
      console.log(`  Family ID: ${FAMILY_ID}\n`);
    } catch (error) {
      console.error("✗ Error creating family:", error.message);
    }

    // Step 3: Create family member documents
    for (const account of testAccounts) {
      try {
        const userId = userIds[account.email];
        if (!userId) continue;

        await setDoc(doc(db, "families", FAMILY_ID, "members", userId), {
          id: userId,
          family_id: FAMILY_ID,
          user_id: userId,
          name: account.name,
          role: account.role,
          joined_at: Timestamp.now(),
        });
        console.log(`  └─ Added member: ${account.name} (${account.role})`);
      } catch (error) {
        console.error(`  └─ Error adding member: ${error.message}`);
      }
    }

    console.log("\n✓ Full test setup complete!");
    console.log("\nLogin with any account:");
    testAccounts.forEach(acc => console.log(`  ${acc.email} / ${acc.password}`));
    console.log("\n→ All accounts already have roles set + family configured");

  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedTestAccounts();
