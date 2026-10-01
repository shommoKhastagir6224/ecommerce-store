// server/config/firebase.js
const admin = require('firebase-admin');

let db;

const connectDB = () => {
  if (db) return db;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  db = admin.firestore();
  console.log('✅ Firebase Firestore connected');
  return db;
};

const getDB = () => {
  if (!db) connectDB();
  return db;
};

module.exports = { connectDB, getDB };
