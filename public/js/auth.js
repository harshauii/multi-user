import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebaseConfig.js';

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('login-form');
const statusDiv = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;

  if (!email || !password || !role) {
    statusDiv.textContent = 'Please fill all fields and select a role.';
    return;
  }

  statusDiv.textContent = 'Logging in...';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      statusDiv.textContent = 'User role not found. Please contact admin.';
      return;
    }

    const userData = userSnap.data();

    if (userData.role !== role) {
      statusDiv.textContent = `You are not registered as a ${role}. Please select the correct role.`;
      return;
    }

    // Redirect to appropriate dashboard
    if (role === 'student') {
      window.location.href = '/student.html';
    } else if (role === 'teacher') {
      window.location.href = '/teacher.html';
    } else if (role === 'admin') {
      window.location.href = '/admin.html';
    }

  } catch (error) {
    console.error(error);
    statusDiv.textContent = 'Login failed. Please check your credentials.';
  }
});
