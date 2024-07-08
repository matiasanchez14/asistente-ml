const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/get-custom-gpt-response', async (req, res) => {
    const { question, history } = req.body;

    console.log('Pregunta recibida:', question);
    console.log('Historial recibido:', history);

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: process.env.GPT_MODEL || "gpt-3.5-turbo",
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

        console.log('Respuesta de OpenAI:', response.data);

        const answer = response.data.choices[0].message.content;
        res.json({ answer });
    } catch (error) {
        console.error('Error al obtener respuesta de OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al obtener la respuesta de GPT' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
