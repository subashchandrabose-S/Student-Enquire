# 🚀 Vercel Production Setup Guide

It looks like your **Database Connection** is failing on the deployed server. This is almost always because the **Environment Variables** (secrets) are missing in Vercel.

## 🛑 Vital Step: Add Environment Variables

You must add your Firebase credentials to Vercel for the backend to work.

1.  Open **b:\Student_Register\server\.env** on your computer.
2.  Copy the **entire value** of `FIREBASE_SERVICE_ACCOUNT`.
    *   (It starts with `{"type": "service_account", ...` and ends with `}`)
    *   *Make sure you copy the whole long line!*

3.  Go to your **Vercel Dashboard**:
    *   Select your **Backend Project** (e.g., `student-enquireportal`).
    *   Go to **Settings** -> **Environment Variables**.

4.  Add a new variable:
    *   **Key:** `FIREBASE_SERVICE_ACCOUNT`
    *   **Value:** Paste the massive JSON string you copied.
    *   Click **Save**.

5.  **REDEPLOY**:
    *   Go to **Deployments** tab.
    *   Click the **three dots** on the latest deployment -> **Redeploy**.
    *   (Or just push a small change to git to trigger it).

---

## 🔍 How to Verify

After redeploying, visit your Backend URL directly in the browser:
`https://student-enquireportal.vercel.app/api/students`

*   **Success:** You see `{"success": true, "data": [...]}` (even if empty list).
*   **Failure:** You see `Internal Server Error` or a crash message.

## 🛡️ Firestore Rules (Check this too!)

1.  Go to **Firebase Console** -> **Firestore Database** -> **Rules**.
2.  Ensure your rules allow reading/writing:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true; 
        }
      }
    }
    ```
    *(Note: `allow read, write: if true;` is for testing/development. For production, you should restrict this, but get it working first!)*

---

**Once you do this, the "Post method not working" error will vanish!**
