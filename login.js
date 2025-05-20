import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

window.signUp = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const role = email === 'harshavardhanjw@gmail.com' ? 'admin' : 'student';
        
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: role
        });
        
        alert(`Signed up as ${role}! Redirecting...`);
        window.location.href = role === 'admin' ? 'admin.html' : 'student.html';
    } catch (error) {
        alert(error.message);
    }
};

window.logIn = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.data().role;
        
        window.location.href = role === 'admin' ? 'admin.html' : 'student.html';
    } catch (error) {
        alert(error.message);
    }
};
