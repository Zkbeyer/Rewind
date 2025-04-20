
const { OpenAI } = require('openai');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.get('/', (req, res) => {
    res.send('Rewind API is running ✅');
  });

app.use(cors({
    origin: 'https://your-rewind.vercel.app',
    credentials: true
}));
app.use(express.json( {limit: '1mb'}));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;


app.post('/api/summary', async (req, res) => {
    const { userData } = req.body;
    
    const prompt = `Here is a spotify user's listening data in JSON format. Please analyze it and write a fun freindly summary of their music taste. Feel free to use the user's name as well. ${JSON.stringify(userData)}`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a music analyst summarizing Spotify user data. Write in a fun, concise, and casual tone. Keep it short and avoid using * or -. Do not mention top tracks, genres, or artist by name, just make a fun summary to describe the user. Use basic HTML (like <b> and <i>) for emphasis instead of markdown.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.8,
            }),
        });
        const data = await response.json();
        const summary = data.choices[0].message.content;
        res.json({ summary });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



app.get('/login', (req, res) => {
    
    const scope = ['user-top-read',
        'user-read-recently-played',
        'user-read-playback-state',
        'user-read-currently-playing',
        'user-modify-playback-state',
    ].join(' ');
    const redirectUrl = `https://accounts.spotify.com/authorize?redirect_uri=https://spotify-rewind-backend.onrender.com/callback&client_id=${CLIENT_ID}&scope=${scope}&response_type=code`
    res.redirect(redirectUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);

    const headers = {
        headers: {
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', params, headers);
        const { access_token, refresh_token, expires_in } = response.data;
        const redirectUrl = `https://your-rewind.vercel.app/?access_token=${access_token}&refresh_token=${refresh_token}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error(error + 'Error during token exchange');
        res.status(400).send('Failed to retrieve access token' );
    }
});

app.post('/refresh', async (req, res) => {
    try {
        const storedRefreshToken = req.body.refresh_token;

        if (!storedRefreshToken) {
            return res.status(400).send('Refresh token not found');
        }
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', storedRefreshToken);

        const response = await axios.post('https://accounts.spotify.com/api/token', params, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const newAccessToken = response.data.access_token;

        

        res.json({ "Success": true, "access_token": newAccessToken });
    } catch (error) {
        console.error("Error refreshing access token:", error);
        res.json({"Success": false});
    }
});

app.get('/logout', (req, res) => {
    localStorage.clear();
    
    res.status(200).json({ success: true });
    res.redirect('https://your-rewind.vercel.app/');
  });


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});