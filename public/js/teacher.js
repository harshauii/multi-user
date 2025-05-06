// teacher.js: Teacher dashboard logic

import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { signOutUser } from './auth.js';

// DOM elements
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName').querySelector('span');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const createAssignmentBtn = document.getElementById('createAssignmentBtn');
const assignmentsList = document.getElementById('assignmentsList');
const submissionsList = document.getElementById('submissionsList');

// Handle sign-out
logoutBtn.addEventListener('click', () => signOutUser());

// Render assignments with edit/delete actions
function renderAssignments(docs) {
  assignmentsList.innerHTML = '';
  docs.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement('li');
    li.textContent = data.title;
    // TODO: add edit & delete buttons and attach handlers
    assignmentsList.appendChild(li);
  });
}

// Render student submissions
function renderSubmissions(docs) {
  submissionsList.innerHTML = '';
  docs.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement('li');
    li.textContent = `${data.studentName} — ${data.assignmentTitle}`;
    // TODO: add grading UI
    submissionsList.appendChild(li);
  });
}

// Load assignments created by this teacher
async function loadAssignments(uid) {
  const q = query(
    collection(db, 'assignments'),
    where('createdBy', '==', uid)
  );
  const snapshot = await getDocs(q);
  renderAssignments(snapshot.docs);
}

// Load all student submissions
async function loadSubmissions() {
  const q = query(
    collection(db, 'submissions')
    // Optionally filter by assignments created by this teacher
  );
  const snapshot = await getDocs(q);
  renderSubmissions(snapshot.docs);
}

// Handle creating a new assignment
createAssignmentBtn.addEventListener('click', async () => {
  // TODO: prompt for title, dueDate, and save to Firestore
  const title = prompt('Enter assignment title');
  if (!title) return;
  await addDoc(collection(db, 'assignments'), {
    title,
    createdBy: auth.currentUser.uid,
    createdAt: new Date(),
    // dueDate: ...
  });
  loadAssignments(auth.currentUser.uid);
});

// Initialize dashboard
onAuthStateChanged(auth, user => {
  if (user) {
    profilePic.src = user.photoURL;
    userName.textContent = user.displayName;
    userEmail.textContent = user.email;
    loadAssignments(user.uid);
    loadSubmissions();
  } else {
    window.location.href = '/index.html';
  }
});
