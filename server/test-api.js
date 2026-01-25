const axios = require('axios');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

console.log('🧪 Testing API endpoints...');
console.log('📡 API URL:', API_URL);
console.log('');

// Test data
const testStudent = {
    student: {
        register_number: `TEST${Date.now()}`,
        name: 'Test Student',
        email: 'test@example.com',
        phone: '1234567890',
        course: 'Computer Science'
    }
};

async function runTests() {
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing health check (GET /)...');
        const healthCheck = await axios.get(API_URL.replace('/api', ''));
        console.log('✅ Health check passed:', healthCheck.data);
        console.log('');

        // Test 2: GET all students
        console.log('2️⃣ Testing GET /api/students...');
        const getStudents = await axios.get(`${API_URL}/students`);
        console.log('✅ GET students passed. Count:', getStudents.data.data?.length || 0);
        console.log('');

        // Test 3: POST new student
        console.log('3️⃣ Testing POST /api/students...');
        const postStudent = await axios.post(`${API_URL}/students`, testStudent);
        console.log('✅ POST student passed. ID:', postStudent.data.data?.id);
        const studentId = postStudent.data.data?.id;
        console.log('');

        // Test 4: GET single student
        if (studentId) {
            console.log('4️⃣ Testing GET /api/students/:id...');
            const getStudent = await axios.get(`${API_URL}/students/${studentId}`);
            console.log('✅ GET single student passed');
            console.log('');

            // Test 5: PUT update student
            console.log('5️⃣ Testing PUT /api/students/:id...');
            const updateData = {
                name: 'Updated Test Student',
                email: 'updated@example.com'
            };
            const putStudent = await axios.put(`${API_URL}/students/${studentId}`, updateData);
            console.log('✅ PUT student passed');
            console.log('');

            // Test 6: DELETE student
            console.log('6️⃣ Testing DELETE /api/students/:id...');
            const deleteStudent = await axios.delete(`${API_URL}/students/${studentId}`);
            console.log('✅ DELETE student passed');
            console.log('');
        }

        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ No 405 errors detected');
        console.log('✅ All HTTP methods working correctly');

    } catch (error) {
        console.error('');
        console.error('❌ TEST FAILED!');
        console.error('Error:', error.message);

        if (error.response) {
            console.error('Status Code:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Response Data:', error.response.data);

            if (error.response.status === 405) {
                console.error('');
                console.error('🚨 405 METHOD NOT ALLOWED ERROR DETECTED!');
                console.error('📖 Read TROUBLESHOOTING_405.md for detailed solutions');
            }
        } else if (error.request) {
            console.error('');
            console.error('🚨 NO RESPONSE FROM SERVER');
            console.error('Possible causes:');
            console.error('  - Server is not running');
            console.error('  - Incorrect API URL');
            console.error('  - Network/firewall blocking request');
        }

        process.exit(1);
    }
}

runTests();
