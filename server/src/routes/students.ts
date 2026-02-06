import { Router } from 'express';
import { db } from '../config/firebase';

const router = Router();
const STUDENTS_COLLECTION = 'students';

// POST /api/students - Save new student
router.post('/', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        const { student, health } = req.body;

        if (!student) {
            return res.status(400).json({ success: false, error: 'Student data is missing in request body' });
        }

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

        // Calculate Age from DOB if present
        let age: number | null = null;
        if (student.dob) {
            const today = new Date();
            const birthDate = new Date(student.dob);
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        // Generate Daily Token (Transaction)
        const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const counterRef = db.collection('daily_counters').doc(todayStr);

        let newToken = 101; // Default start

        try {
            newToken = await db.runTransaction(async (t) => {
                const doc = await t.get(counterRef);
                let nextToken = 101;

                if (doc.exists) {
                    const data = doc.data();
                    if (data && data.last_token) {
                        nextToken = data.last_token + 1;
                    }
                }

                t.set(counterRef, { last_token: nextToken, date: todayStr });
                return nextToken;
            });
        } catch (txError) {
            console.error('Transaction failure for token generation:', txError);
            // Fallback: just use random or handle error? 
            // For now, let's allow it to fail but log it, or maybe just proceed with a fallback if critical?
            // But duplicate tokens are bad. Let's propagate error.
            throw new Error('Failed to generate token. Please try again.');
        }

        const studentRef = db.collection(STUDENTS_COLLECTION).doc();
        const studentData = {
            ...student,
            id: studentRef.id,
            created_at: new Date().toISOString(),
            health: health || null,
            age: age,
            token_number: newToken,
            token_date: todayStr
        };

        console.log(`Saving student ${student.name} with Token: ${newToken}`);
        await studentRef.set(studentData);
        console.log('Successfully saved to Firestore');
        res.status(201).json({ success: true, data: studentData });
    } catch (error: any) {
        console.error('SERVER ERROR (POST /api/students):', error);
        res.status(400).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
        console.error('SERVER ERROR (GET /api/students):', error);
        res.status(400).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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

// GET /api/students/:id/print - Generate JSON for Bluetooth Print App
router.get('/:id/print', async (req, res) => {
    try {
        const studentRef = db.collection(STUDENTS_COLLECTION).doc(req.params.id);
        const doc = await studentRef.get();

        if (!doc.exists) {
            return res.status(404).send('Student not found');
        }

        const s = doc.data();
        const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        // Construct formatting based on Bluetooth Print App documentation
        const printData: any[] = [];

        // Helper to add text
        const addText = (content: string, bold = 0, align = 0, format = 0) => {
            printData.push({
                type: 0, // text
                content: content,
                bold: bold, // 0 or 1
                align: align, // 0:left, 1:center, 2:right
                format: format // 0:normal, 1:double height, 2:double h+w, 3:double w, 4:small
            });
        };

        // Helper to add details
        const addDetail = (label: string, value: any) => {
            if (value) {
                addText(`${label}: ${value}`, 0, 0, 0);
            }
        };

        // Header
        addText('SONA COLLEGE OF TECHNOLOGY', 1, 1, 0);
        addText('(AUTONOMOUS)', 0, 1, 4);
        if (s?.token_number) {
            addText(`${s.token_number}`, 1, 1, 1); // Double Height instead of Height+Width
        }
        addText('--------------------------------', 0, 1, 0);

        // Name and Age
        addText(`NAME: ${s?.name?.toUpperCase()}`, 0, 0, 0);
        addText(`AGE: ${s?.age || '-'}`, 0, 0, 0);

        // Academic details
        if (s?.course_type === 'UG') {
            addText(`${(s?.board || s?.qualification || '').toUpperCase()}`, 0, 0, 0);
            if (s?.cutoff) addText(`CUTOFF: ${s?.cutoff.toFixed(2)}`, 0, 0, 0);
            if (s?.percentage) addText(`PERC: ${s?.percentage}%`, 0, 0, 0);
        } else {
            addText(`${(s?.ug_degree || '').toUpperCase()}`, 0, 0, 0);
            if (s?.cgpa) addText(`CGPA: ${s?.cgpa}`, 0, 0, 0);
            if (s?.percentage) addText(`PERC: ${s?.percentage}%`, 0, 0, 0);
        }

        addText('--------------------------------', 0, 1, 0);
        addText(`CONTACT: ${s?.contact_no}`, 0, 0, 0);
        addText(`DATE: ${new Date().toLocaleDateString()}`, 0, 0, 0);

        // Footer (Centered)
        addText('--------------------------------', 0, 1, 0);
        addText(`REG NO: ${s?.register_number}`, 1, 1, 0);
        addText(`VISIT NO: ${s?.visit_count || 0}`, 1, 1, 0);

        addText(' ', 0, 0, 0);
        addText(' ', 0, 0, 0); // Extra space for tear-off

        // The app expects an object with numeric keys "0", "1", ... if array_push was used in PHP with JSON_FORCE_OBJECT
        // However, standard JSON array usually works. The example used `json_encode($a, JSON_FORCE_OBJECT)`.
        // If the app strictly requires object with index keys:
        const responseObj: any = {};
        printData.forEach((item, index) => {
            responseObj[index] = item;
        });

        res.json(responseObj);

    } catch (error: any) {
        console.error('Print generation error:', error);
        res.status(500).json({ error: error.message });
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
