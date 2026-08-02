import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBMYMS7dv6cSfSq2O5VrUH2mqlya64eByg",
  authDomain: "myfamily-a5ec1.firebaseapp.com",
  projectId: "myfamily-a5ec1",
  storageBucket: "myfamily-a5ec1.firebasestorage.app",
  messagingSenderId: "543100043664",
  appId: "1:543100043664:web:2a7de34bf26315041b7315",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userUpdates = [
  { uid: "mYTvkmKt1dYdAk3CrlGdUJNAjri2", role: "parent", family: "family_test_001" },
  { uid: "HZmuhXCkxzdup92HLk7KcXg2gqV2", role: "parent", family: "family_test_001" },
  { uid: "Z4ZRMeD77IRqbdYZEzSq4fpdXUB3", role: "family", family: "family_test_001" },
];

async function fixProfiles() {
  console.log("🔧 Updating test account profiles...\n");
  
  for (const update of userUpdates) {
    try {
      await updateDoc(doc(db, "users", update.uid), {
        role: update.role,
        family_id: update.family,
        updated_at: Timestamp.now(),
      });
      console.log(`✓ Updated ${update.uid}: role=${update.role}, family=${update.family}`);
    } catch (error) {
      console.error(`✗ Error updating ${update.uid}:`, error.message);
    }
  }
  
  console.log("\n✓ Profiles fixed! Try logging in again.");
  process.exit(0);
}

fixProfiles();
