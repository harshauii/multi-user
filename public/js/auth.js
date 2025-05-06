// auth.js

import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore();

// Get the form and status elements
const form = document.getElementById('login-form');
const statusMessage = document.getElementById('status');

// Set up the Firebase Auth instance
const auth = getAuth();

// Listen for form submission
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get email, password, and selected role from the form
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  if (!role) {
    statusMessage.textContent = 'Please select a role';
    statusMessage.style.color = 'red';
    return;
  }

  // Attempt to sign in the user
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if the user has a role in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      
      // If role exists, check if it matches the selected role
      if (userData.role !== role) {
        statusMessage.textContent = `Your role is ${userData.role}. Please select the correct role.`;
        statusMessage.style.color = 'red';
        return;
      }

      // Redirect user based on their role
      redirectUserBasedOnRole(userData.role);
    } else {
      // If no role is found, set the role for the user in Firestore
      await setDoc(userDocRef, {
        role: role
      });

      // Redirect user after role assignment
      redirectUserBasedOnRole(role);
    }

  } catch (error) {
    statusMessage.textContent = `Error: ${error.message}`;
    statusMessage.style.color = 'red';
  }
});

// Function to handle redirection based on user role
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
