import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore();
const auth = getAuth();

// Get the form and status elements
const form = document.getElementById('login-form');
const statusMessage = document.getElementById('status');

// Listen to authentication state changes to manage session persistence
onAuthStateChanged(auth, (user) => {
  if (user) {
    // If user is already logged in, redirect based on their role
    redirectUserBasedOnRole(user.uid);
  } else {
    // If no user, continue to show login form
    form.style.display = 'block';
  }
});

// Handle form submission
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  if (!role) {
    statusMessage.textContent = 'Please select a role';
    statusMessage.style.color = 'red';
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the user's role exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      if (userData.role !== role) {
        statusMessage.textContent = `Your role is ${userData.role}. Please select the correct role.`;
        statusMessage.style.color = 'red';
        return;
      }

      // Redirect user based on their role
      redirectUserBasedOnRole(userData.role);
    } else {
      // Assign role in Firestore
      await setDoc(userDocRef, {
        role: role
      });

      // Redirect user after assigning role
      redirectUserBasedOnRole(role);
    }

  } catch (error) {
    statusMessage.textContent = `Error: ${error.message}`;
    statusMessage.style.color = 'red';
  }
});

// Redirect user based on role
function redirectUserBasedOnRole(role) {
  if (role === 'student') {
    window.location.href = '/student.html';
  } else if (role === 'teacher') {
    window.location.href = '/teacher.html';
  } else {
    statusMessage.textContent = 'Role not recognized!';
    statusMessage.style.color = 'red';
  }
}
