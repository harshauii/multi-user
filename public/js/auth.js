import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebaseConfig.js';

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('login-form');
const statusMessage = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;

  if (!role) {
    statusMessage.textContent = "⚠️ Please select a role.";
    return;
  }

  try {
    statusMessage.textContent = "⏳ Logging in...";

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Check role from Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      statusMessage.textContent = "❌ No user data found. Please contact admin.";
      return;
    }

    const userData = userDoc.data();

    if (userData.role !== role) {
      statusMessage.textContent = `❌ Role mismatch. You are registered as '${userData.role}', not '${role}'.`;
      return;
    }

    // Redirect based on role
    if (role === "student") {
      window.location.href = "/student.html";
    } else if (role === "teacher") {
      window.location.href = "/teacher.html";
    } else if (role === "admin") {
      window.location.href = "/admin.html";
    } else {
      statusMessage.textContent = "❌ Unknown role.";
    }

  } catch (error) {
    console.error("Login failed:", error.message);
    statusMessage.textContent = `❌ ${error.message}`;
  }
});
