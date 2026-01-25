const axios = require('axios');

const API_URL = 'https://student-enquireportal.vercel.app/api';

async function verifyDeployment() {
    console.log(`🔍 Checking Production Backend: ${API_URL}`);

    try {
        console.log('1. Testing GET /students (should be 200 OK after cold start)...');
        // Set timeout to 10s for Vercel cold boot
        const getRes = await axios.get(`${API_URL}/students`, { timeout: 10000 });
        console.log(`✅ GET Success: ${getRes.status}`);
    } catch (err) {
        console.log(`❌ GET Failed: ${err.message}`);
        if (err.response) console.log(`   Status: ${err.response.status}`);
    }

    try {
        console.log('\n2. Testing OPTIONS /students (CORS Preflight)...');
        const optRes = await axios.options(`${API_URL}/students`);
        console.log(`✅ OPTIONS Success: ${optRes.status}`);
        console.log('   Access-Control-Allow-Methods:', optRes.headers['access-control-allow-methods']);
        console.log('   Access-Control-Allow-Origin:', optRes.headers['access-control-allow-origin']);
    } catch (err) {
        console.log(`❌ OPTIONS Failed: ${err.message}`);
        if (err.response) console.log(`   Status: ${err.response.status}`);
    }

    try {
        console.log('\n3. Testing POST /students (The 405 culprit)...');
        const postRes = await axios.post(`${API_URL}/students`, {
            student: {
                register_number: "DEBUG_" + Date.now(),
                name: "Debug User",
                email: "debug@test.com",
                phone: "0000000000",
                course: "Debug"
            }
        });
        console.log(`✅ POST Success: ${postRes.status}`);
    } catch (err) {
        console.log(`❌ POST Failed: ${err.message}`);
        if (err.response) {
            console.log(`   Status: ${err.response.status}`);
            console.log(`   Data:`, err.response.data);
            console.log(`   Allow Header:`, err.response.headers['allow']);
        }
    }
}

verifyDeployment();
