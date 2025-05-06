// admin.js: Admin panel logic

import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { signOutUser } from './auth.js';

// DOM elements
const logoutBtn = document.getElementById('logoutBtn');
const pendingTableBody = document.getElementById('pendingUsersTable').querySelector('tbody');
const allTableBody = document.getElementById('allUsersTable').querySelector('tbody');

// Sign out
logoutBtn.addEventListener('click', () => signOutUser());

/**
 * Render users awaiting approval
 */
function renderPendingUsers(docs) {
  pendingTableBody.innerHTML = '';
  docs.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.displayName}</td>
      <td>${data.email}</td>
      <td>${data.requestedRole}</td>
      <td>
        <button data-uid="${docSnap.id}" data-action="approve">Approve</button>
        <button data-uid="${docSnap.id}" data-action="reject">Reject</button>
      </td>
    `;
    pendingTableBody.appendChild(tr);
  });
  // Attach button handlers
  pendingTableBody.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const uid = e.target.dataset.uid;
      const action = e.target.dataset.action;
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status: action === 'approve' ? 'active' : 'rejected',
        role: action === 'approve' ? e.target.closest('tr').querySelector('td:nth-child(3)').textContent : null
      });
      loadAllUsers();
      loadPendingUsers();
    });
  });
}

/**
 * Render all users
 */
function renderAllUsers(docs) {
  allTableBody.innerHTML = '';
  docs.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.displayName}</td>
      <td>${data.email}</td>
      <td>${data.role || '-'}</td>
      <td>${data.status || '-'}</td>
    `;
    allTableBody.appendChild(tr);
  });
}

/**
 * Load users with pending status
 */
async function loadPendingUsers() {
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  renderPendingUsers(snapshot.docs);
}

/**
 * Load all users
 */
async function loadAllUsers() {
  const q = query(
    collection(db, 'users')
  );
  const snapshot = await getDocs(q);
  renderAllUsers(snapshot.docs);
}

// Initialize admin panel after auth
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Optionally, verify user has admin claim before proceeding
    await loadPendingUsers();
    await loadAllUsers();
  } else {
    window.location.href = '/index.html';
  }
});
