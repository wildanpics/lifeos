import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '@/types/user';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Try popup first, fallback to redirect if popup is blocked
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    try {
      await ensureUserProfile(result.user);
    } catch (firestoreErr) {
      // Firestore write failed (e.g. rules not set yet) — auth still succeeded
      console.warn('Profile creation skipped:', firestoreErr);
    }
    return result.user;
  } catch (error: any) {
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
};

// Call this on page load to handle redirect result
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      try {
        await ensureUserProfile(result.user);
      } catch (firestoreErr) {
        console.warn('Profile creation skipped after redirect:', firestoreErr);
      }
      return result.user;
    }
    return null;
  } catch {
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  try {
    await ensureUserProfile(result.user);
  } catch (firestoreErr) {
    console.warn('Profile creation skipped after email signup:', firestoreErr);
  }
  return result.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const ensureUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const profile: Omit<UserProfile, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Life OS User',
      photoURL: user.photoURL || undefined,
      cityId: 29,
      city: 'Jakarta',
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      preferences: {
        theme: 'dark',
        notificationsEnabled: true,
        language: 'id',
      },
    };
    await setDoc(userRef, profile);
  }
};

export { onAuthStateChanged, auth };
