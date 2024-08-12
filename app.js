const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// JWT Middleware to authenticate token
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
    const response = await result.response;
    const text = await response.text();
    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
});

// Image generation endpoint
app.post('/generate-image', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Hypothetical image generation method - adjust as per actual API documentation
    const result = await model.generate({
      prompt: prompt,
      output: 'image' // Specify you want an image
    });

    const image = result.response; // Adjusted to access the correct field

    res.json({ image });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
