# Student Educational & Personal Information Entry System

A full-stack application for collecting student data, including health details and digital consent.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Hook Form, Zod, Lucide React.
- **Backend:** Node.js, Express.js, Supabase JS SDK.
- **Database:** Supabase (PostgreSQL).

## Setup Instructions

### 1. Supabase Configuration
Create a new Supabase project and run the following SQL to set up the tables:

```sql
-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  age INTEGER,
  registration_no TEXT UNIQUE NOT NULL,
  dob DATE NOT NULL,
  grade TEXT NOT NULL,
  contact_no TEXT NOT NULL,
  school TEXT NOT NULL,
  is_sick BOOLEAN DEFAULT FALSE,
  parents_consent BOOLEAN DEFAULT FALSE,
  parent_name TEXT,
  parent_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Details Table
CREATE TABLE health_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  symptoms TEXT[],
  duration TEXT,
  doctor_note_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Backend Setup
1. Navigate to the `server` directory.
2. Create a `.env` file:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. Run `npm install`.
4. Run `npm run dev` (after adding script to package.json) or `npx ts-node-dev src/index.ts`.

### 3. Frontend Setup
1. Navigate to the `client` directory.
2. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Run `npm install`.
4. Run `npm run dev`.

## Performance & UX
- Modern glassmorphism UI.
- Responsive design for mobile and desktop.
- Conditional field rendering for health information.
- Smooth animations and state transitions.
