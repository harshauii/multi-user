import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyAKz4LhJcThTJ1ZowKYMV7rVlKwDhuXz3g",
  authDomain: "rolebased-test-1.firebaseapp.com",
  databaseURL: "https://rolebased-test-1-default-rtdb.firebaseio.com",
  projectId: "rolebased-test-1",
  storageBucket: "rolebased-test-1.firebasestorage.app",
  messagingSenderId: "951301430114",
  appId: "1:951301430114:web:17cae16a755c2cbc086a3b",
  measurementId: "G-CFC2EF9MQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🧾 Signup function (default role = student)
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Default role is student
    await setDoc(doc(db, "users", user.uid), {
      role: "student",
      email: email,
    });

    alert("Account created! Redirecting...");
    window.location.href = "student.html";
  } catch (error) {
    alert("Signup Error: " + error.message);
  }
};

// 🔐 Login function (redirect based on role)
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const role = docSnap.data().role;
      if (role === "admin") {
        window.location.href = "admin.html";
      } else if (role === "teacher") {
        window.location.href = "teacher.html";
      } else {
        window.location.href = "student.html";
      }
    } else {
      alert("No role assigned. Please contact admin.");
    }
  } catch (error) {
    alert("Login Error: " + error.message);
  }
};

// 🚪 Logout
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

