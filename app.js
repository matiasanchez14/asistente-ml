require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/get-custom-gpt-response', async (req, res) => {
    const { question, history } = req.body;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: process.env.GPT_MODEL,
            messages: [
                { role: 'system', content: 'Eres un asistente de MercadoLibre especializado en responder preguntas sobre productos.' },
                ...history.map(qa => [
                    { role: 'user', content: qa.question },
                    { role: 'assistant', content: qa.answer }
                ]).flat(),
                { role: 'user', content: question }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ answer: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener la respuesta' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
