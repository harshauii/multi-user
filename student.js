// student.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// === Your Firebase Config ===
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const coursesContainer = document.getElementById("courses");
const enrolledCoursesContainer = document.getElementById("enrolled-courses");

let currentUser = null;

// Wait for auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first!");
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  await loadCourses();
  await loadEnrolledCourses();
});

// Load all available courses from Firestore
async function loadCourses() {
  coursesContainer.innerHTML = "<p>Loading courses...</p>";
  try {
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    if (coursesSnapshot.empty) {
      coursesContainer.innerHTML = "<p>No courses available.</p>";
      return;
    }
    let html = "";
    coursesSnapshot.forEach((docSnap) => {
      const course = docSnap.data();
      html += `
        <div style="border:1px solid #ccc; margin-bottom:10px; padding:10px;">
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <button onclick="enrollCourse('${docSnap.id}')">Enroll</button>
        </div>
      `;
    });
    coursesContainer.innerHTML = html;
  } catch (err) {
    coursesContainer.innerHTML = "<p>Error loading courses.</p>";
    console.error(err);
  }
}

// Enroll current user in a course
window.enrollCourse = async function (courseId) {
  try {
    // Check if already enrolled (optional but recommended)
    const enrollmentQuery = query(
      collection(db, "enrollments"),
      where("userId", "==", currentUser.uid),
      where("courseId", "==", courseId)
    );
    const enrolledSnapshot = await getDocs(enrollmentQuery);
    if (!enrolledSnapshot.empty) {
      alert("You are already enrolled in this course.");
      return;
    }

    await addDoc(collection(db, "enrollments"), {
      userId: currentUser.uid,
      courseId: courseId,
      enrolledAt: new Date()
    });
    alert("Successfully enrolled!");
    await loadEnrolledCourses(); // refresh enrolled list
  } catch (error) {
    console.error("Failed to enroll course:", error);
    alert("Failed to enroll course.");
  }
};

// Load courses the user has enrolled in
async function loadEnrolledCourses() {
  enrolledCoursesContainer.innerHTML = "<p>Loading your enrolled courses...</p>";

  try {
    // Get all enrollments of the user
    const enrollmentsQuery = query(
      collection(db, "enrollments"),
      where("userId", "==", currentUser.uid)
    );
    const enrollmentSnapshot = await getDocs(enrollmentsQuery);

    if (enrollmentSnapshot.empty) {
      enrolledCoursesContainer.innerHTML = "<p>You have not enrolled in any courses yet.</p>";
      return;
    }

    // Fetch course details for each enrolled course
    let html = "";
    for (const enrollDoc of enrollmentSnapshot.docs) {
      const enrollmentData = enrollDoc.data();
      const courseDoc = await getDocs(doc(db, "courses", enrollmentData.courseId));
      const courseRef = doc(db, "courses", enrollmentData.courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) {
        continue;
      }

      const courseData = courseSnap.data();

      html += `
        <div style="border:1px solid #0a0; margin-bottom:10px; padding:10px; background:#e6ffe6;">
          <h3>${courseData.title}</h3>
          <p>${courseData.description}</p>
          <small>Enrolled on: ${enrollmentData.enrolledAt.toDate().toLocaleString()}</small>
        </div>
      `;
    }
    enrolledCoursesContainer.innerHTML = html;

  } catch (error) {
    console.error(error);
    enrolledCoursesContainer.innerHTML = "<p>Error loading enrolled courses.</p>";
  }
}
