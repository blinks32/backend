app.post('/generate', async (req, res) => {
  const { context, prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const combinedPrompt = `${context}\n\n${prompt}`;
    const result = await model.generateContent(combinedPrompt);
    
    // Log the entire result object
    console.log('Generate Content Result:', result); 

    // Check if the response structure is different and adapt accordingly
    const text = result?.text || result?.response?.text || 'No text generated';
    
    res.json({ text });
  } catch (error) {
    console.error('Error generating content:', error); 
    res.status(500).send(error.message);
  }
});

app.post('/generate-image', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generate({ prompt, output: 'image' });
    
    // Log the entire result object
    console.log('Generate Image Result:', result); 
    
    // Check if the response structure is different and adapt accordingly
    const image = result?.image || result?.response?.image || 'No image generated';
    
    res.json({ image });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send(error.message);
  }
});
