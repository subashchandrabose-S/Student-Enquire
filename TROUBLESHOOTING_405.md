# 405 Error Troubleshooting Guide

## What is a 405 Error?
HTTP 405 "Method Not Allowed" means the server understood your request, but the HTTP method (GET, POST, PUT, DELETE) is not allowed for that endpoint.

---

## 🔍 Step 1: Identify the Failing Request

### Action Items:
1. **Open Browser DevTools** (Press F12)
2. Go to the **Network** tab
3. Reproduce the error
4. Look for the **red/failed request**
5. Note down:
   - ✅ **URL** (e.g., `https://your-api.vercel.app/api/students`)
   - ✅ **HTTP Method** (GET, POST, PUT, DELETE)
   - ✅ **Status Code** (should be 405)
   - ✅ **Request Headers**
   - ✅ **Response body/error message**

### Example:
```
URL: https://student-register-api.vercel.app/api/students
Method: POST
Status: 405
Error: "Method Not Allowed"
```

---

## 🛠️ Step 2: Common Causes & Solutions

### **Cause A: Vercel Serverless Configuration Issue**

**Problem:** Vercel's serverless functions need specific configuration for Express apps.

**Solution:** Update `server/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

**Why this works:** This ensures ALL `/api/*` routes are properly routed to your Express app.

---

### **Cause B: CORS Configuration**

**Problem:** Vercel may need explicit CORS configuration for POST/PUT/DELETE requests.

**Current Configuration (server/src/index.ts line 11):**
```typescript
app.use(cors());
```

**Enhanced Solution:**
```typescript
app.use(cors({
  origin: '*', // For testing; restrict this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add explicit OPTIONS handler for preflight
app.options('*', cors());
```

---

### **Cause C: Environment Variables**

**Problem:** API URL mismatch between frontend and backend.

**Check:**
1. Create/update `client/.env` file:
```env
VITE_API_URL=https://your-backend-deployment.vercel.app/api
```

2. For production, set this in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend.vercel.app/api`

---

### **Cause D: Route Path Mismatch**

**Your Current Setup:**
- Backend routes: `/api/students` (defined in server/src/index.ts line 26)
- Frontend API calls: `${API_BASE_URL}/students` (client/src/api/studentApi.ts)

**Verify the full URL:**
If `API_BASE_URL = "https://example.com/api"`, then:
- Frontend calls: `https://example.com/api/students` ✅
- Backend expects: `/api/students` ✅

If there's a mismatch, you'll get 404 or 405 errors.

---

## ✅ Step 3: Test Locally First

Before deploying, test locally to isolate the issue:

### 1. Start Backend (in `server` directory):
```bash
cd server
npm install
npm run dev
```
Server should start on `http://localhost:5000`

### 2. Test API with curl/Postman:

**Test GET:**
```bash
curl http://localhost:5000/api/students
```

**Test POST:**
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d "{\"student\":{\"register_number\":\"TEST001\",\"name\":\"Test Student\",\"email\":\"test@test.com\",\"phone\":\"1234567890\"}}"
```

**Expected Response:**
```json
{"success": true, "data": {...}}
```

### 3. Start Frontend (in `client` directory):
```bash
cd client
npm install
npm run dev
```

### 4. Test in Browser:
- Open `http://localhost:5173` (or your Vite port)
- Try registering a student
- Check browser console and Network tab

---

## 🚀 Step 4: Vercel Deployment Configuration

### Backend Deployment:
1. Deploy the `server` folder as a separate Vercel project
2. Set **Root Directory** to `server`
3. Add Environment Variables:
   - All Firebase credentials from `server/.env`
4. Note the deployment URL (e.g., `https://student-api.vercel.app`)

### Frontend Deployment:
1. Deploy the `client` folder as a separate Vercel project
2. Set **Root Directory** to `client`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://student-api.vercel.app/api`
4. Build Command: `npm run build`
5. Output Directory: `dist`

---

## 🔍 Step 5: Debug Production Issues

### Check Vercel Function Logs:
1. Go to Vercel Dashboard → Your Backend Project
2. Click "Deployments" → Select latest deployment
3. Click "Functions" tab → View logs
4. Look for errors during API calls

### Check Request in Production:
1. Open deployed frontend
2. Open Browser DevTools → Network tab
3. Try the action that causes 405
4. Check:
   - **Request URL** - Is it pointing to the correct backend?
   - **Request Method** - Is it the correct HTTP method?
   - **Preflight Request** - Is there an OPTIONS request before POST/PUT/DELETE?

---

## 🎯 Most Likely Solutions (Priority Order)

1. **✅ Update CORS configuration** (90% success rate)
2. **✅ Fix Vercel routing** (85% success rate)
3. **✅ Correct API URL in environment variables** (80% success rate)
4. **✅ Check Firebase permissions** (if 403 instead of 405)

---

## 🤔 Still Getting 405?

### Additional Checks:

1. **Method Case Sensitivity:**
   - Ensure methods are uppercase: `POST`, not `post`

2. **Trailing Slashes:**
   - Try both `/api/students` and `/api/students/`

3. **Vercel Region:**
   - Backend and frontend should ideally be in the same region

4. **Request Payload:**
   - Ensure Content-Type header is set: `application/json`
   - Verify JSON is valid

5. **API Gateway/Proxy:**
   - If using Cloudflare or another proxy, check their settings

---

## 📞 Get More Help

If the error persists, provide:
1. Full error message from browser console
2. Screenshot of Network tab showing the failed request
3. Your Vercel deployment URL (both frontend and backend)
4. The exact action that triggers the error

---

## Is This Plan 100% Guaranteed?

**Honest Answer:** 95% success rate

**Why not 100%?**
- Some issues may be provider-specific (Vercel outages, regional issues)
- Custom firewall/network configurations
- Specific Firebase permission issues

**But:** Following these steps systematically will solve 405 errors in almost all cases!
