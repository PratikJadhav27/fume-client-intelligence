const https = require('https');

// We test using the stable gemini-3.5-flash model
const MODEL = 'gemini-3.5-flash';
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY environment variable is missing.");
  console.log("To run this script in PowerShell, use:");
  console.log("$env:GEMINI_API_KEY='your_api_key_here' ; node test_gemini.js");
  process.exit(1);
}

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hello! Reply with exactly 'API Key is working'." }] }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log(`Testing Gemini API key against model: ${MODEL}...`);

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(body);
        const text = response.candidates[0].content.parts[0].text;
        console.log(`✅ Success! (Status ${res.statusCode})`);
        console.log(`🤖 Gemini says: "${text.trim()}"`);
      } catch (e) {
        console.log("✅ Success, but failed to parse response text.");
      }
    } else {
      console.error(`❌ Failed! (Status ${res.statusCode})`);
      console.error(`Error details: ${body}`);
      
      if (res.statusCode === 400) console.log("Hint: 400 usually means an invalid API key.");
      if (res.statusCode === 404) console.log("Hint: 404 means the model name is incorrect or deprecated.");
    }
  });
});

req.on('error', e => {
  console.error("Network error:", e.message);
});

req.write(data);
req.end();
