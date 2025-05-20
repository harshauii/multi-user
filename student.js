import { auth, db } from './firebase-config.js';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

import {
  onAuthStateChanged as onAuthChange
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const availableCoursesList = document.getElementById("availableCourses");
const enrolledCoursesList = document.getElementById("enrolledCourses");

onAuthChange(auth, async (user) => {
  if (user) {
    const userId = user.uid;

    // 🔹 1. Show all available courses
    const courseSnap = await getDocs(collection(db, "courses"));
    courseSnap.forEach((docData) => {
      const course = docData.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${course.title}</strong> - ${course.description}
        <button onclick="enrollCourse('${docData.id}', '${course.title}')">Enroll</button>
      `;
      availableCoursesList.appendChild(li);
    });

    // 🔹 2. Show enrolled courses
    const q = query(collection(db, "enrollments"), where("userId", "==", userId));
    const enrollmentSnap = await getDocs(q);
    enrollmentSnap.forEach((docData) => {
      const enrolled = docData.data();
      const li = document.createElement("li");
      li.textContent = `${enrolled.courseTitle}`;
      enrolledCoursesList.appendChild(li);
    });

    // 🔹 3. Make enrollCourse globally accessible
    window.enrollCourse = async (courseId, courseTitle) => {
      try {
        // Prevent duplicate enrollments
        const check = query(
          collection(db, "enrollments"),
          where("userId", "==", userId),
          where("courseId", "==", courseId)
        );
        const checkSnap = await getDocs(check);
        if (!checkSnap.empty) {
          alert("Already enrolled in this course!");
          return;
        }

        await addDoc(collection(db, "enrollments"), {
          userId,
          courseId,
          courseTitle
        });
        alert("Enrolled in " + courseTitle + "! Reload to see updated list.");
      } catch (err) {
        console.error("Enrollment error:", err);
        alert("Failed to enroll.");
      }
    };
  } else {
    alert("User not logged in.");
    window.location.href = "/index.html";
  }
});
