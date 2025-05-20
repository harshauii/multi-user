import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const availableCoursesList = document.getElementById("availableCourses");
const enrolledCoursesList = document.getElementById("enrolledCourses");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userId = user.uid;

    try {
      // Clear lists before populating
      availableCoursesList.innerHTML = "";
      enrolledCoursesList.innerHTML = "";

      // 1. Fetch all courses
      const courseSnap = await getDocs(collection(db, "courses"));
      console.log("Courses fetched:", courseSnap.size);
      if (courseSnap.empty) {
        availableCoursesList.innerHTML = "<li>No courses available.</li>";
      } else {
        courseSnap.forEach((docData) => {
          const course = docData.data();
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${course.title}</strong> - ${course.description}
            <button onclick="enrollCourse('${docData.id}', '${course.title}')">Enroll</button>
          `;
          availableCoursesList.appendChild(li);
          console.log("Course added:", course.title);
        });
      }

      // 2. Fetch user's enrolled courses
      const q = query(collection(db, "enrollments"), where("userId", "==", userId));
      const enrollmentSnap = await getDocs(q);

      if (enrollmentSnap.empty) {
        enrolledCoursesList.innerHTML = "<li>No enrolled courses yet.</li>";
      } else {
        enrollmentSnap.forEach((docData) => {
          const enrolled = docData.data();
          const li = document.createElement("li");
          li.textContent = `${enrolled.courseTitle}`;
          enrolledCoursesList.appendChild(li);
        });
      }

      // 3. Define enrollCourse globally
      window.enrollCourse = async (courseId, courseTitle) => {
        try {
          // Prevent duplicate enrollments
          const checkQuery = query(
            collection(db, "enrollments"),
            where("userId", "==", userId),
            where("courseId", "==", courseId)
          );
          const checkSnap = await getDocs(checkQuery);
          if (!checkSnap.empty) {
            alert("You are already enrolled in this course!");
            return;
          }

          await addDoc(collection(db, "enrollments"), {
            userId,
            courseId,
            courseTitle
          });

          alert(`Enrolled in "${courseTitle}" successfully! Reload to see updates.`);
          // Optional: reload page or dynamically update enrolledCoursesList
        } catch (err) {
          console.error("Enrollment error:", err);
          alert("Failed to enroll. Please try again.");
        }
      };

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load courses. Please try again later.");
    }

  } else {
    alert("You are not logged in.");
    window.location.href = "/index.html"; // redirect to login
  }
});
