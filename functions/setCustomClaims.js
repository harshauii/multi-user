// functions/setCustomClaims.js
// Firebase Cloud Function to assign custom claims based on Firestore user document changes

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

/**
 * Triggered when a user document is created or updated in Firestore
 * Expects fields: status ('pending' | 'active' | 'rejected'), role ('student' | 'teacher' | 'admin')
 */
exports.setCustomClaims = functions.firestore
  .document('users/{uid}')
  .onWrite(async (change, context) => {
    const uid = context.params.uid;
    const before = change.before.exists ? change.before.data() : {};     
    const after = change.after.exists ? change.after.data() : {};

    // Only proceed if status changed to 'active' and a role is set
    if (after.status === 'active' && after.role && before.role !== after.role) {
      const customClaims = { role: after.role };
      try {
        // Set custom user claims on the Auth user
        await admin.auth().setCustomUserClaims(uid, customClaims);
        console.log(`Custom claims set for user ${uid}:`, customClaims);
      } catch (err) {
        console.error(`Error setting custom claims for ${uid}:`, err);
      }
    }

    // Optionally handle revoking claims on rejection
    if (after.status === 'rejected') {
      try {
        await admin.auth().setCustomUserClaims(uid, {});
        console.log(`Custom claims cleared for rejected user ${uid}`);
      } catch (err) {
        console.error(`Error clearing claims for ${uid}:`, err);
      }
    }

    return null;
  });
