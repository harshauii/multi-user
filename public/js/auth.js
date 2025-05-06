// Firebase App and Auth should be initialized in firebaseConfig.js and imported before this
import { auth, db } from './firebaseConfig.js'; // Assuming you're using Firestore to store roles

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Optional: Save the selected role to Firestore if needed (only on first login)
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      await userRef.set({ role: role, email: user.email });
    }

    console.log('Login successful. Waiting for role confirmation...');

  } catch (error) {
    alert('Login error: ' + error.message);
  }
});

// Check user state and route based on role
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const idTokenResult = await user.getIdTokenResult(true); // Force refresh to get latest claims
    const role = idTokenResult.claims.role;

    if (role === 'admin') {
      window.location.href = 'admin.html';
    } else if (role === 'student') {
      window.location.href = 'student.html';
    } else if (role === 'teacher') {
      window.location.href = 'teacher.html';
    } else {
      // No role yet - show waiting screen or block access
      document.body.innerHTML = '<h2>Waiting for admin approval...</h2>';
      auth.signOut(); // Optional: Sign out to prevent access
    }
  }
});
