import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase config from environment or default
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

const testAccounts = [
  {
    email: "mom@family.local",
    password: "MomTest123!",
    profile: { name: "Sarah Johnson", role: "parent", age: 58 }
  },
  {
    email: "dad@family.local",
    password: "DadTest123!",
    profile: { name: "Michael Johnson", role: "parent", age: 61 }
  },
  {
    email: "child@family.local",
    password: "ChildTest123!",
    profile: { name: "Emma Johnson", role: "family", age: 28 }
  }
];

async function seedTestAccounts() {
  try {
    console.log("🌱 Seeding test accounts...\n");
    
    for (const account of testAccounts) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, account.email, account.password);
        const userId = userCred.user.uid;
        
        // Create Firestore profile
        await setDoc(doc(db, "users", userId), {
          id: userId,
          email: account.email,
          full_name: account.profile.name,
          role: account.profile.role,
          family_id: "family_test_001",
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
        
        console.log(`✓ Created: ${account.email}`);
        console.log(`  UID: ${userId}`);
        console.log(`  Name: ${account.profile.name}\n`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠ Already exists: ${account.email}\n`);
        } else {
          console.error(`✗ Error creating ${account.email}:`, error.message);
        }
      }
    }
    
    console.log("\n✓ Test accounts ready!");
    console.log("Try logging in with:");
    testAccounts.forEach(acc => {
      console.log(`  ${acc.email} / ${acc.password}`);
    });
    
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedTestAccounts();
