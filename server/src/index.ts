import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import studentRoutes from './routes/students';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for Vercel deployment
app.use(cors({
  origin: '*', // Allow all origins (restrict in production if needed)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

// Request logger for debugging deployment routing
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});

// Health check & Debug
app.get('/', (req, res) => {
  const firebaseConfigured = !!process.env.FIREBASE_SERVICE_ACCOUNT;
  res.json({
    status: 'online',
    message: 'Student Enquiry Portal API is running',
    firebase_configured: true,
    timestamp: new Date().toISOString()
  });
});

// Routes
// Routes
// Mount on both paths to handle Vercel's inconsistent rewriting behavior
app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes); // Fallback if /api is stripped by Vercel

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
