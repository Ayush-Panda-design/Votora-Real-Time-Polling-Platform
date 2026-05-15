const axios = require('axios');

const API = 'http://localhost:5013/api';
let token = '';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log("Starting Combinatorial Poll Tests...\n");

  // 1. Register/Login
  try {
    const email = `testuser_${Date.now()}@example.com`;
    const res = await axios.post(`${API}/auth/signup`, {
      name: 'Test User',
      email,
      password: 'password123'
    });
    token = res.data.token;
    console.log("✅ Authenticated as test user.");
  } catch (err) {
    console.error("❌ Auth failed:", err.response?.data || err.message);
    return;
  }

  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  const timeLimitSystems = ['none', 'expiry', 'timer'];
  const booleanSettings = [true, false];
  
  let passed = 0;
  let failed = 0;

 
  for (const sys of timeLimitSystems) {
    for (const isQuiz of booleanSettings) {
      for (const cheatProtection of booleanSettings) {
        for (const isAnonymous of booleanSettings) {
          for (const requiresAuth of booleanSettings) {
            const configName = `[${sys}] Quiz:${isQuiz} Cheat:${cheatProtection} Anon:${isAnonymous} AuthReq:${requiresAuth}`;
            
            try {
              const payload = {
                title: `Test ${configName}`,
                description: 'Testing',
                timeLimitSystem: sys,
                isQuiz,
                cheatProtection,
                isAnonymous,
                requiresAuth,
                questions: [
                  { question: 'Q1', options: ['A', 'B'], correctOption: isQuiz ? 0 : null, required: true }
                ]
              };

              if (sys === 'expiry') {
                payload.expiresAt = new Date(Date.now() + 100000).toISOString();
              } else if (sys === 'timer') {
                payload.timerDuration = 5;
              }

              // Create
              const createRes = await axiosInstance.post(`${API}/polls`, payload);
              const poll = createRes.data.poll;
              
              if (poll.timeLimitSystem !== sys) throw new Error(`Time system mismatch. Expected ${sys}, got ${poll.timeLimitSystem}`);

              // Public fetch
              let fetchHeaders = {};
              if (requiresAuth) {
                fetchHeaders = { Authorization: `Bearer ${token}` };
              }
              const fetchRes = await axios.get(`${API}/polls/public/${poll.pollCode}`, { headers: fetchHeaders });
              
              // If quiz is true, correctOption should NOT be exposed publicly
              if (isQuiz) {
                if (fetchRes.data.poll.questions[0].correctOption !== undefined) {
                   throw new Error("Security flaw: correctOption is exposed to public!");
                }
              }

              // Respond
              await axios.post(`${API}/responses/${poll._id}`, {
                answers: [{ questionIndex: 0, selectedOption: 'A' }]
              }, { headers: fetchHeaders });

              // Publish
              await axiosInstance.post(`${API}/polls/${poll._id}/publish`);

              passed++;
              // console.log(`✅ Passed: ${configName}`);
            } catch (err) {
              failed++;
              console.error(`❌ Failed: ${configName} -`, err.response?.data || err.message);
            }
          }
        }
      }
    }
  }

  console.log(`\nTests Completed. Passed: ${passed}, Failed: ${failed}`);
}

runTests();
