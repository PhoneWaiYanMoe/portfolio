const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

// ✅ Allow CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// ✅ Fix: Don't restrict CSP to localhost only
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com;");
    next();
});

const API_KEY = "AIzaSyABCmiB8TTFtfI80yLqxLHnqMWGKBpuXJU"; // Be careful exposing API keys in public repos!

const trainingData = `
  My name is Phone Wai Yan Moe. I am a software engineering student at Ton Duc Thang University in Vietnam.
  My skills include HTML, CSS, JavaScript, PHP, Kotlin, Java, Flutter, Node.js, ASP.NET, Django, MySQL, MongoDB, and Git.
  I have worked on projects like traffic prediction, restaurant website, flight ticket app, and e-commerce websites.
  My hobbies include coding, learning new technologies, and watching YouTube.
  I am from Myanmar. Now, living in Vietnam. I am interested in software development, machine learning, and artificial intelligence.
  I am looking for an internship or job opportunity in software development or related fields.
`;

app.post('/chat', async (req, res) => {
    console.log("Incoming request from:", req.headers.origin);  
    console.log("Received message:", req.body.message);        

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                contents: [
                    { parts: [{ text: trainingData + "\nUser: " + req.body.message }] }
                ]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("Gemini API Response:", JSON.stringify(response.data, null, 2)); 

        const candidates = response.data?.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
            const botReply = candidates[0].content.parts.map(part => part.text).join(" ");
            res.json({ reply: botReply });
        } else {
            res.json({ reply: "Sorry, I couldn't generate a response." });
        }

    } catch (error) {
        console.error("Error processing request:", error.response?.data || error.message);
        res.status(500).json({ error: "Error processing request: " + (error.response?.data?.error?.message || error.message) });
    }
});

// ✅ Fix: Use Render's dynamic port assignment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
