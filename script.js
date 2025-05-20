import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

window.logIn = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      alert("Logged in as " + role);

      // Redirect based on role
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
