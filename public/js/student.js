// student.js: Student dashboard logic

import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { signOutUser } from './auth.js';

// DOM elements
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName').querySelector('span');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const assignmentsList = document.getElementById('assignmentsList');
const announcementsList = document.getElementById('announcementsList');

// Handle sign-out
logoutBtn.addEventListener('click', () => signOutUser());

// Render assignments into the list
function renderAssignments(docs) {
  assignmentsList.innerHTML = '';
  docs.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = `${doc.data().title} — due ${doc.data().dueDate}`;
    assignmentsList.appendChild(li);
  });
}

// Render announcements into the list
function renderAnnouncements(docs) {
  announcementsList.innerHTML = '';
  docs.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = doc.data().message;
    announcementsList.appendChild(li);
  });
}

// Fetch upcoming assignments for the current user
async function loadAssignments(uid) {
  const q = query(
    collection(db, 'assignments'),
    where('assignedTo', 'array-contains', uid)
  );
  const snapshot = await getDocs(q);
  renderAssignments(snapshot.docs);
}

// Fetch recent announcements
async function loadAnnouncements() {
  const q = query(
    collection(db, 'announcements'),
    // Optionally, add filters like recent dates
  );
  const snapshot = await getDocs(q);
  renderAnnouncements(snapshot.docs);
}

// Listen for auth state changes and initialize dashboard
onAuthStateChanged(auth, user => {
  if (user) {
    profilePic.src = user.photoURL;
    userName.textContent = user.displayName;
    userEmail.textContent = user.email;

    // Load data
    loadAssignments(user.uid);
    loadAnnouncements();
  } else {
    // Redirect to login if not authenticated
    window.location.href = '/index.html';
  }
});
