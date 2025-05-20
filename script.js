import { auth, db } from './firebase-config.js';

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

window.signUp = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set role: if email is yours, role is 'admin'; otherwise, 'student'
    const role = (email === "harshavardhanjw@gmail.com") ? "admin" : "student";

    // Save role and email in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: role
    });

    alert("Signed up successfully as " + role);

    // Redirect after signup
    if (role === "admin") {
      window.location.href = "/admin.html";
    } else {
      window.location.href = "/student.html";
    }

  } catch (error) {
    console.error("Signup error:", error);
    alert("Signup failed: " + error.message);
  }
};
