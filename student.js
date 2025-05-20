import { auth, db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) window.location.href = 'index.html';
    
    // Load available courses
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const courseList = document.getElementById('courseList');
    
    coursesSnapshot.forEach(doc => {
        const course = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button onclick="enrollCourse('${doc.id}')">Enroll</button>
        `;
        courseList.appendChild(li);
    });

    // Load enrollments
    const enrollmentsQuery = query(
        collection(db, "enrollments"), 
        where("userId", "==", user.uid)
    );
    
    onSnapshot(enrollmentsQuery, (snapshot) => {
        const enrollmentsList = document.getElementById('enrollments');
        enrollmentsList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const enrollment = doc.data();
            const li = document.createElement('li');
            li.textContent = enrollment.courseTitle;
            enrollmentsList.appendChild(li);
        });
    });
});

window.enrollCourse = async function(courseId) {
    try {
        const courseDoc = await getDocs(doc(db, "courses", courseId));
        const courseTitle = courseDoc.data().title;
        
        await addDoc(collection(db, "enrollments"), {
            userId: auth.currentUser.uid,
            courseId: courseId,
            courseTitle: courseTitle,
            enrolledAt: new Date()
        });
    } catch (error) {
        alert(error.message);
    }
};
