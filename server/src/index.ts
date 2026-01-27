import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import studentRoutes from './routes/students';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for Vercel deployment
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://student-enquireportal.vercel.app', // Correct production domain
  'https://studentenquiresct.vercel.app'      // Keep old domain just in case
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      // Ideally should be callback(new Error('Not allowed by CORS')) but for debugging we can be lenient or strict
      return callback(null, true); // TEMPORARILY ALLOW ALL FOR DEBUGGING
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

app.use(express.json());

// Request logger for debugging deployment routing
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

// Health check & Debug
app.get('/', (req, res) => {
  const firebaseConfigured = !!process.env.FIREBASE_SERVICE_ACCOUNT;
  res.json({
    status: 'online',
    message: 'Student Enquiry Portal API is running',
    firebase_configured: firebaseConfigured, // Fixed boolean value
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Routes
// Mount on both paths to handle Vercel's inconsistent rewriting behavior
// If Vercel rewrites /api/students -> /server/src/index.ts, req.url might be /api/students or /students
app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes); // Fallback if /api is stripped by Vercel

// Catch-all for unhandled routes to debug 404/405
app.use('*', (req, res) => {
  console.log(`❌ Unhandled Route: [${req.method}] ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
