// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAKz4LhJcThTJ1ZowKYMV7rVlKwDhuXz3g",
  authDomain: "rolebased-test-1.firebaseapp.com",
  databaseURL: "https://rolebased-test-1-default-rtdb.firebaseio.com",
  projectId: "rolebased-test-1",
  storageBucket: "rolebased-test-1.firebasestorage.app",
  messagingSenderId: "951301430114",
  appId: "1:951301430114:web:17cae16a755c2cbc086a3b",
  measurementId: "G-CFC2EF9MQF"
};


// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Sign Up function
window.signUp = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const role = email === "harshavardhanjw@gmail.com" ? "admin" : "student";

    // ✅ Set role in Firestore
    await setDoc(doc(db, "roles", user.uid), { role });

    alert("✅ Sign-up successful!");

    // ✅ Redirect based on role
    window.location.href = role === "admin" ? "admin.html" : "student.html";
  } catch (error) {
    console.error("Sign-up Error:", error.message);
    alert("❌ Error: " + error.message);
  }
};

// ✅ Log In function
window.logIn = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Fetch role from Firestore
    const roleDoc = await getDoc(doc(db, "roles", user.uid));
    const roleData = roleDoc.exists() ? roleDoc.data() : null;

    if (!roleData || !roleData.role) {
      alert("❌ No user role found in Firestore.");
      return;
    }

    alert("✅ Logged in!");

    // ✅ Redirect to respective dashboard
    window.location.href = roleData.role === "admin" ? "admin.html" : "student.html";
  } catch (error) {
    console.error("Login Error:", error.message);
    alert("❌ Error: " + error.message);
  }
};
