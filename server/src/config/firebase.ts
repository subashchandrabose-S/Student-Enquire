import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
}

const serviceAccount = JSON.parse(saJson);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
export const firebase = admin;
