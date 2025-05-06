// js/auth.js
import app from './firebaseConfig.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('login-form');
const statusMessage = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  if (!role) {
    statusMessage.textContent = "Please select a role.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.role !== role) {
        statusMessage.textContent = `You're registered as ${userData.role}. Please select the correct role.`;
        return;
      }
      redirectTo(role);
    } else {
      await setDoc(docRef, { role });
      redirectTo(role);
    }
  } catch (err) {
    statusMessage.textContent = err.message;
  }
});

function redirectTo(role) {
  if (role === "student") {
    window.location.href = "/student.html";
  } else if (role === "teacher") {
    window.location.href = "/teacher.html";
  }
}

// Optional: redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    const docRef = doc(db, 'users', user.uid);
    getDoc(docRef).then((snap) => {
      if (snap.exists()) {
        redirectTo(snap.data().role);
      }
    });
  }
});
