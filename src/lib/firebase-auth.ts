import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { firebaseApp, firebaseAuth } from "@/integrations/firebase/client";
import { getState, resetState, setState, type Lang, type Role } from "@/lib/app-state";
import { loadFamilyIntoState } from "@/lib/family-operations";

let emulatorsConnected = false;
let authReady = false;
let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

function connectEmulators() {
  if (emulatorsConnected || !import.meta.env.DEV || import.meta.env.VITE_USE_FIREBASE_EMULATORS !== "true") {
    return;
  }

  connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(getFirestore(firebaseApp), "127.0.0.1", 8081);
  connectStorageEmulator(getStorage(firebaseApp), "127.0.0.1", 9199);
  emulatorsConnected = true;
}

async function getTestAccountRole(email: string): Promise<Role | null> {
  // Auto-assign roles for test accounts (mock data)
  const testRoles: Record<string, Role> = {
    "mom@family.local": "parent",
    "dad@family.local": "parent",
    "child@family.local": "family",
  };
  return testRoles[email] || null;
}

async function loadProfile(user: User) {
  const snapshot = await getDoc(doc(getFirestore(firebaseApp), "profiles", user.uid));
  const data = snapshot.exists() ? snapshot.data() : null;

  // Check if it's a test account and get auto-role
  const testRole = user.email ? await getTestAccountRole(user.email) : null;
  const role = (data?.role as Role | undefined) || testRole;

  // A parent views their OWN records, so their parentId is their uid. Family
  // members keep any explicitly-linked parent_id (parent screens are reached
  // via the route param instead).
  const resolvedParentId =
    (data?.parent_id as string | undefined) ??
    (role === "parent" ? user.uid : getState().parentId);

  setState({
    authed: true,
    name: (data?.full_name as string | undefined) ?? user.displayName ?? user.email?.split("@")[0] ?? "myFamily",
    email: user.email ?? "",
    role: role ?? getState().role,
    lang: (data?.language as Lang | undefined) ?? getState().lang,
    familyId: (data?.family_id as string | undefined) ?? "family_test_001",
    parentId: resolvedParentId,
  });

  // Load family info into state
  await loadFamilyIntoState();
}

export function initFirebaseAuthSync() {
  connectEmulators();
  if (authReady) return;
  authReady = true;

  onAuthStateChanged(firebaseAuth, async (user) => {
    if (!user) {
      resetState();
      return;
    }

    await loadProfile(user);
  });
}

export async function signInEmail(email: string, password: string) {
  connectEmulators();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  await loadProfile(credential.user);
}

export async function signUpEmail(input: {
  email: string;
  password: string;
  fullName: string;
  role?: Role | null;
  language?: Lang;
}) {
  connectEmulators();

  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    input.email,
    input.password
  );

  if (!credential.user.emailVerified) {
    await sendEmailVerification(credential.user);
  }

  await loadProfile(credential.user);

  return credential.user;
}

export async function signInGoogle() {
  connectEmulators();

  const provider = new GoogleAuthProvider();

  const credential = await signInWithPopup(
    firebaseAuth,
    provider
  );

  await loadProfile(credential.user);

  return credential.user;
}
export async function sendOtp(phone: string) {
  connectEmulators();

  // Always destroy the previous verifier
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {}

    recaptchaVerifier = null;
  }

  // Clear any previous widget
  const container = document.getElementById("recaptcha-container");
  if (container) {
    container.innerHTML = "";
  }

  recaptchaVerifier = new RecaptchaVerifier(
    firebaseAuth,
    "recaptcha-container",
    {
      size: "invisible",
    }
  );

  await recaptchaVerifier.render();

  confirmationResult = await signInWithPhoneNumber(
    firebaseAuth,
    phone.startsWith("+") ? phone : `+91${phone}`,
    recaptchaVerifier
  );
}

export async function verifyOtp(code: string) {
  if (!confirmationResult) {
    throw new Error("OTP has not been sent.");
  }

  const credential = await confirmationResult.confirm(code);

  const user = credential.user;

  await loadProfile(user);

  confirmationResult = null;

  // IMPORTANT: destroy the verifier after success
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {}

    recaptchaVerifier = null;
  }

  return user;
}
export async function saveRole(role: Role) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const db = getFirestore(firebaseApp);

  console.log("Saving role:", role, "for user:", user.uid);

  await setDoc(
    doc(db, "profiles", user.uid),
    {
      id: user.uid,
      role,
      full_name: getState().name,
      language: getState().lang,
      email: user.email ?? "",
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );

  const snapshot = await getDoc(doc(db, "profiles", user.uid));
  console.log("Profile after save:", snapshot.data());

  console.log("State before setState:", getState());
  setState({ role });
  console.log("State after setState:", getState());
}

export async function signOutApp() {
  if (firebaseAuth.currentUser) {
    await signOut(firebaseAuth);
  }
  resetState();
}
