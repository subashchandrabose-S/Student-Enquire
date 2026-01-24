import { Router } from 'express';
import { db } from '../config/firebase';

const router = Router();
const STUDENTS_COLLECTION = 'students';

// POST /api/students - Save new student
router.post('/', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        const { student, health } = req.body;

        if (!student.register_number) {
            return res.status(400).json({ success: false, error: 'Register number is required' });
        }

        // Check for existing student with same register number
        const existingSnapshot = await db.collection(STUDENTS_COLLECTION)
            .where('register_number', '==', student.register_number)
            .get();

        if (!existingSnapshot.empty) {
            return res.status(400).json({ success: false, error: 'Student with this Register Number already exists' });
        }

        const studentRef = db.collection(STUDENTS_COLLECTION).doc();
        const studentData = {
            ...student,
            id: studentRef.id,
            created_at: new Date().toISOString(),
            health: health || null
        };

        console.log('Saving to Firestore with ID:', studentRef.id);
        await studentRef.set(studentData);
        console.log('Successfully saved to Firestore');
        res.status(201).json({ success: true, data: studentData });
    } catch (error: any) {
        console.error('Error saving to Firestore:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /api/students - List all students
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection(STUDENTS_COLLECTION).get();

        const students = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ success: true, data: students });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /api/students/:id - View single student
router.get('/:id', async (req, res) => {
    try {
        const studentRef = db.collection(STUDENTS_COLLECTION).doc(req.params.id);
        const doc = await studentRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const currentData = doc.data();
        const newVisitCount = (currentData?.visit_count || 0) + 1;

        // Update visit count in background
        await studentRef.update({ visit_count: newVisitCount });

        res.json({ success: true, data: { id: doc.id, ...currentData, visit_count: newVisitCount } });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
    try {
        await db.collection(STUDENTS_COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: 'Student deleted' });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
    try {
        const studentRef = db.collection(STUDENTS_COLLECTION).doc(req.params.id);
        const doc = await studentRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        const currentData = doc.data();
        const updateData = {
            ...req.body,
            update_count: (currentData?.update_count || 1) + 1,
            updated_at: new Date().toISOString()
        };

        await studentRef.update(updateData);
        res.json({ success: true, data: { id: req.params.id, ...updateData } });
    } catch (error: any) {
        console.error('Error updating student:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
