const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Ensure the port is defined

const corsOptions = {
  origin: 'https://my-website-91lv.vercel.app',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/generate', async (req, res) => {
  const { context, prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const combinedPrompt = `${context}\n\n${prompt}`;
    const result = await model.generateContent(combinedPrompt);
    const text = await result.response.text();
    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
});

app.post('/generate-image', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generate({ prompt, output: 'image' });
    const image = result.response; // Adjust this according to the API's response structure

    res.json({ image });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
