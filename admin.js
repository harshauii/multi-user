import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Create course
window.createCourse = async function () {
  const title = document.getElementById("courseTitle").value.trim();
  const description = document.getElementById("courseDescription").value.trim();

  if (!title || !description) {
    alert("Please fill in both title and description.");
    return;
  }

  try {
    await addDoc(collection(db, "courses"), {
      title,
      description,
      createdAt: new Date()
    });
    alert("Course created successfully!");
    document.getElementById("courseTitle").value = "";
    document.getElementById("courseDescription").value = "";
  } catch (error) {
    console.error("Error adding course: ", error);
    alert("Failed to create course.");
  }
};

// Show courses live
const courseList = document.getElementById("courseList");

onSnapshot(collection(db, "courses"), (snapshot) => {
  courseList.innerHTML = ""; // clear existing
  snapshot.forEach((doc) => {
    const course = doc.data();
    const li = document.createElement("li");
    li.textContent = `${course.title} - ${course.description}`;
    courseList.appendChild(li);
  });
});
