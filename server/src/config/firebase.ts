import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
}

try {
  // Extreme defensive parsing: Find the first '{' and the last '}'
  const jsonMatch = saJson.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in FIREBASE_SERVICE_ACCOUNT');
  }

  const cleanedJson = jsonMatch[0];
  const serviceAccount = JSON.parse(cleanedJson);

  // Fix for private key newlines
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error: any) {
  console.error('Firebase Init Error:', error.message);
  // Log a safe snippet of the variable to help debugging
  const snippet = saJson.substring(0, 50).replace(/\n/g, ' ');
  console.error(`Value starts with: "${snippet}..." (Length: ${saJson.length})`);
  throw error;
}

export const db = admin.firestore();
export const firebase = admin;
