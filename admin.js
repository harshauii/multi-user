import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

window.createCourse = async function() {
    const title = document.getElementById('courseTitle').value;
    const description = document.getElementById('courseDesc').value;

    try {
        await addDoc(collection(db, "courses"), {
            title: title,
            description: description,
            createdAt: new Date()
        });
        alert('Course created successfully!');
    } catch (error) {
        alert(error.message);
    }
};

// Real-time course list update
onSnapshot(collection(db, "courses"), (snapshot) => {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';
    
    snapshot.forEach(doc => {
        const course = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `<strong>${course.title}</strong><p>${course.description}</p>`;
        coursesList.appendChild(li);
    });
});
