import { auth, db } from './firebaseConfig.js';

let authChecked = false;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role')?.value;

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // First-time user: store selected role
        const userRef = db.collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (!doc.exists && role) {
          await userRef.set({ role, email });
        }
      } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
      }
    });
  }

  // 🔁 Auth check
  auth.onAuthStateChanged(async (user) => {
    if (authChecked) return;
    authChecked = true;

    if (user) {
      try {
        const token = await user.getIdTokenResult(true);
        const role = token.claims.role;

        console.log("User role:", role);

        // Redirect only if not already on the destination page
        const currentPage = window.location.pathname;

        if (role === 'admin' && !currentPage.includes('admin.html')) {
          window.location.href = 'admin.html';
        } else if (role === 'teacher' && !currentPage.includes('teacher.html')) {
          window.location.href = 'teacher.html';
        } else if (role === 'student' && !currentPage.includes('student.html')) {
          window.location.href = 'student.html';
        } else if (!role) {
          document.body.innerHTML = "<h2>Waiting for admin approval...</h2>";
        }

      } catch (err) {
        console.error("Error getting token result:", err);
      }
    } else {
      console.log("No user signed in.");
    }
  });
});
