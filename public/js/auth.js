// auth.js: encapsulates Firebase Auth logic

import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

const provider = new GoogleAuthProvider();

/**
 * Initiates Google sign-in popup.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

/**
 * Registers an auth state listener.
 * @param {(user: import('firebase/auth').User|null) => void} callback 
 */
export function onAuthChange(callback) {
  onAuthStateChanged(auth, callback);
}

/**
 * Signs the current user out.
 * @returns {Promise<void>}
 */
export function signOutUser() {
  return signOut(auth);
}
