import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔒 Check if admin
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDocs(collection(db, "users"));
    const currentUser = [...userDoc.docs].find(u => u.id === user.uid);
    const role = currentUser?.data()?.role;

    if (role !== "admin") {
      alert("Access denied. Redirecting...");
      window.location.href = "index.html";
      return;
    }

    loadUsers();
  } else {
    window.location.href = "index.html";
  }
});

// 🚪 Logout
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// 📋 Load all users
async function loadUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  const tableBody = document.getElementById("user-table");

  tableBody.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.email}</td>
      <td>${data.role}</td>
      <td>
        <select id="role-${docSnap.id}">
          <option value="student" ${data.role === "student" ? "selected" : ""}>Student</option>
          <option value="teacher" ${data.role === "teacher" ? "selected" : ""}>Teacher</option>
          <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </td>
      <td><button onclick="updateRole('${docSnap.id}')">Update</button></td>
    `;

    tableBody.appendChild(row);
  });
}

// 🔄 Update Role
window.updateRole = async function (userId) {
  const select = document.getElementById(`role-${userId}`);
  const newRole = select.value;

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { role: newRole });

  alert("Role updated!");
  loadUsers();
};
