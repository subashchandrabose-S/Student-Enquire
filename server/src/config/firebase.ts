import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
}

try {
  // Defensive cleaning: Strip accidental prefixes like 'FIREBASE_SERVICE_ACCOUNT=' or quotes
  if (saJson.includes('{')) {
    saJson = saJson.substring(saJson.indexOf('{'), saJson.lastIndexOf('}') + 1);
  }

  const serviceAccount = JSON.parse(saJson);

  // Fix for private key newlines in Vercel environment variables
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT. Raw value starts with:', saJson.substring(0, 20));
  throw error;
}

export const db = admin.firestore();
export const firebase = admin;
