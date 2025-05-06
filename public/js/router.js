// router.js: role-based client-side routing

import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

/**
 * Redirects authenticated users to the appropriate dashboard based on their role.
 */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not signed in: go to login
    window.location.href = '/index.html';
    return;
  }

  try {
    // Get custom claims from token
    const tokenResult = await user.getIdTokenResult();
    const role = tokenResult.claims.role;

    switch (role) {
      case 'student':
        window.location.href = '/student.html';
        break;
      case 'teacher':
        window.location.href = '/teacher.html';
        break;
      case 'admin':
        window.location.href = '/admin.html';
        break;
      default:
        // No role or pending: show generic dashboard or pending notice
        window.location.href = '/dashboard.html';
    }
  } catch (error) {
    console.error('Error retrieving user claims:', error);
    // Fallback to generic dashboard
    window.location.href = '/dashboard.html';
  }
});
