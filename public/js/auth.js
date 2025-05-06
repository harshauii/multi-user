import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore();
const auth = getAuth();

// Get the form and status elements
const form = document.getElementById('login-form');
const statusMessage = document.getElementById('status');

// Check if the user is already authenticated when the page loads
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is already logged in, redirect based on their role
    handleRedirect(user.uid);
  } else {
    // User is not logged in, show login form
    form.style.display = 'block';
  }
});

// Handle form submission
form.addEventListener('submit', async (event) => {
  event.preventDefault();  // Prevent default form submission (refresh)

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  // Validate the form fields
  if (!role) {
    statusMessage.textContent = 'Please select a role.';
    statusMessage.style.color = 'red';
    return;
  }

  try {
    // Sign in the user using email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the user's role exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      // If user data exists but role is different, show error
      if (userData.role !== role) {
        statusMessage.textContent = `You are registered as a ${userData.role}, but you selected ${role}. Please select the correct role.`;
        statusMessage.style.color = 'red';
        return;
      }

      // Role is valid, redirect the user
      handleRedirect(userData.role);
    } else {
      // Assign role in Firestore for new users
      await setDoc(userDocRef, { role: role });

      // After assigning the role, redirect the user based on the role
      handleRedirect(role);
    }

  } catch (error) {
    statusMessage.textContent = `Error: ${error.message}`;
    statusMessage.style.color = 'red';
  }
});

// Function to handle redirection based on user role
function handleRedirect(role) {
  if (role === 'student') {
    window.location.href = '/student.html';  // Redirect to student page
  } else if (role === 'teacher') {
    window.location.href = '/teacher.html';  // Redirect to teacher page
  } else {
    statusMessage.textContent = 'Invalid role detected!';
    statusMessage.style.color = 'red';
  }
}
