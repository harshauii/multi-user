import { auth, db } from './firebaseConfig.js';

let initialCheckDone = false; // 👈 Prevent infinite refresh loops

document.addEventListener('DOMContentLoaded', () => {
  // Attach login form event listener only once DOM is ready
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

        // Optional: store selected role in Firestore on first login
        const userRef = db.collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (!doc.exists && role) {
          await userRef.set({ role: role, email: user.email });
        }

      } catch (error) {
        alert('Login failed: ' + error.message);
      }
    });
  }

  // Check current auth state and route once
  auth.onAuthStateChanged(async (user) => {
    if (!initialCheckDone) {
      initialCheckDone = true;

      if (user) {
        const tokenResult = await user.getIdTokenResult(true);
        const role = tokenResult.claims.role;

        if (role === 'admin') {
          window.location.href = 'admin.html';
        } else if (role === 'teacher') {
          window.location.href = 'teacher.html';
        } else if (role === 'student') {
          window.location.href = 'student.html';
        } else {
          document.body.innerHTML = '<h2>Waiting for admin approval...</h2>';
          // Don't sign out immediately, just block further navigation
        }
      }
    }
  });
});
