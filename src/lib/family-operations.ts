import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  getFirestore,
  Timestamp,
} from "firebase/firestore";
import { firebaseApp, firebaseAuth } from "@/integrations/firebase/client";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase-schema";
import { getState, setState } from "@/lib/app-state";

type Role = "parent" | "family";

export interface FamilyProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  family_id: string;
  language?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  member_count: number;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  name: string;
  role: Role;
  joined_at: Timestamp;
}

export interface UserRole {
  id: string;
  user_id: string;
  family_id: string;
  role: Role;
  assigned_at: Timestamp;
}

// Generate a unique 6-character alphanumeric invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Check if invite code is unique
async function isInviteCodeUnique(code: string): Promise<boolean> {
  const db = getFirestore(firebaseApp);
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.families),
    where("invite_code", "==", code)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

// Generate a unique invite code
export async function generateUniqueInviteCode(): Promise<string> {
  let code = generateInviteCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (!(await isInviteCodeUnique(code)) && attempts < maxAttempts) {
    code = generateInviteCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique invite code");
  }

  return code;
}

// Complete user profile
export async function completeProfile(input: {
  full_name: string;
  phone?: string;
  email?: string;
}): Promise<FamilyProfile> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const db = getFirestore(firebaseApp);
  const state = getState();
  const role = state.role as Role;

  const profileData: FamilyProfile = {
    id: user.uid,
    full_name: input.full_name,
    email: input.email || user.email || "",
    ...(input.phone && { phone: input.phone }),
    role,
    family_id: state.familyId || "",
    ...(state.lang && { language: state.lang }),
    updated_at: serverTimestamp(),
  };

  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.profiles, user.uid),
    profileData,
    { merge: true }
  );

  setState({ name: input.full_name });
  return profileData;
}

// Create a new family
export async function createFamily(input: {
  family_name: string;
}): Promise<Family> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const db = getFirestore(firebaseApp);
  const inviteCode = await generateUniqueInviteCode();
  const familyId = doc(collection(db, FIRESTORE_COLLECTIONS.families)).id;

  const familyData: Family = {
    id: familyId,
    name: input.family_name,
    invite_code: inviteCode,
    created_by: user.uid,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    member_count: 1,
  };

  await setDoc(doc(db, FIRESTORE_COLLECTIONS.families, familyId), familyData);

  // Add creator as a family member
  await addFamilyMember(familyId, user.uid, getState().name);

  // Create user role
  await setDoc(
    doc(
      db,
      FIRESTORE_COLLECTIONS.families,
      familyId,
      FIRESTORE_COLLECTIONS.userRoles,
      user.uid
    ),
    {
      id: user.uid,
      user_id: user.uid,
      family_id: familyId,
      role: getState().role,
      assigned_at: serverTimestamp(),
    }
  );

  // Update user profile with family_id
  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.profiles, user.uid),
    { family_id: familyId, updated_at: serverTimestamp() },
    { merge: true }
  );

  setState({ familyId });
  return familyData;
}

// Join an existing family with invite code
export async function joinFamilyWithInviteCode(
  inviteCode: string
): Promise<Family> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const db = getFirestore(firebaseApp);
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.families),
    where("invite_code", "==", inviteCode.toUpperCase())
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Invalid invite code");
  }

  const familyDoc = snapshot.docs[0];
  const family = familyDoc.data() as Family;

  // Add user as family member
  await addFamilyMember(family.id, user.uid, getState().name);

  // Create user role
  await setDoc(
    doc(
      db,
      FIRESTORE_COLLECTIONS.families,
      family.id,
      FIRESTORE_COLLECTIONS.userRoles,
      user.uid
    ),
    {
      id: user.uid,
      user_id: user.uid,
      family_id: family.id,
      role: getState().role,
      assigned_at: serverTimestamp(),
    }
  );

  // Update user profile with family_id
  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.profiles, user.uid),
    { family_id: family.id, updated_at: serverTimestamp() },
    { merge: true }
  );

  // Increment family member count
  const familyDocRef = doc(db, FIRESTORE_COLLECTIONS.families, family.id);
  const familySnapshot = await getDoc(familyDocRef);
  const familyDataSnapshot = familySnapshot.data() as Family;
  await setDoc(
    familyDocRef,
    {
      member_count: (familyDataSnapshot.member_count || 1) + 1,
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );

  setState({ familyId: family.id });
  return family;
}

// Add a family member
async function addFamilyMember(
  familyId: string,
  userId: string,
  name: string
): Promise<void> {
  const db = getFirestore(firebaseApp);
  const memberData: FamilyMember = {
    id: userId,
    family_id: familyId,
    user_id: userId,
    name,
    role: getState().role as Role,
    joined_at: serverTimestamp(),
  };

  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.families, familyId, FIRESTORE_COLLECTIONS.familyMembers, userId),
    memberData
  );
}

// Get family details by invite code (for validation)
export async function getFamilyByInviteCode(
  inviteCode: string
): Promise<Family | null> {
  const db = getFirestore(firebaseApp);
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.families),
    where("invite_code", "==", inviteCode.toUpperCase())
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Family;
}

// Get current user's family
export async function getCurrentUserFamily(): Promise<Family | null> {
  const state = getState();
  if (!state.familyId) return null;

  const db = getFirestore(firebaseApp);
  const snapshot = await getDoc(
    doc(db, FIRESTORE_COLLECTIONS.families, state.familyId)
  );

  if (!snapshot.exists()) return null;
  return snapshot.data() as Family;
}

// Get family members
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const db = getFirestore(firebaseApp);
  const snapshot = await getDocs(
    collection(
      db,
      FIRESTORE_COLLECTIONS.families,
      familyId,
      FIRESTORE_COLLECTIONS.familyMembers
    )
  );

  return snapshot.docs.map((doc) => doc.data() as FamilyMember);
}

// Check if user has a complete profile
export async function hasCompleteProfile(): Promise<boolean> {
  const user = firebaseAuth.currentUser;
  if (!user) return false;

  const db = getFirestore(firebaseApp);
  const snapshot = await getDoc(
    doc(db, FIRESTORE_COLLECTIONS.profiles, user.uid)
  );

  if (!snapshot.exists()) return false;

  const profile = snapshot.data() as FamilyProfile;
  return !!(profile.full_name && profile.role);
}

// Check if user has joined a family
export async function hasJoinedFamily(): Promise<boolean> {
  const user = firebaseAuth.currentUser;
  if (!user) return false;

  const db = getFirestore(firebaseApp);
  const snapshot = await getDoc(
    doc(db, FIRESTORE_COLLECTIONS.profiles, user.uid)
  );

  if (!snapshot.exists()) return false;

  const profile = snapshot.data() as FamilyProfile;
  return !!profile.family_id;
}

// Load family info into state
export async function loadFamilyIntoState(): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) return;

  const db = getFirestore(firebaseApp);
  const profileSnapshot = await getDoc(
    doc(db, FIRESTORE_COLLECTIONS.profiles, user.uid)
  );

  if (!profileSnapshot.exists()) return;

  const profile = profileSnapshot.data() as FamilyProfile;
  if (profile.family_id) {
    setState({ familyId: profile.family_id });
  }
}
