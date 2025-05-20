import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

window.signUp = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const role = email === 'harshavardhanjw@gmail.com' ? 'admin' : 'student';

    await setDoc(doc(db, "users", user.uid), {
      email,
      role
    });

    alert("Signed up as " + role);
  } catch (error) {
    alert(error.message);
  }
};

window.logIn = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      alert("Logged in as " + role);

      if (role === "admin") {
        window.location.href = "/admin.html";
      } else {
        window.location.href = "/student.html";
      }
    } else {
      alert("No user role found in Firestore.");
    }
  } catch (error) {
    alert(error.message);
  }
};
