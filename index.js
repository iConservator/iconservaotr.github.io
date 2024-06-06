const { request } = require('undici');
const express = require('express');
const { clientId, clientSecret, port } = require('./config.json');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', async (req, res) => {
    const { code } = req.query;

    if (code) {
        try {
            console.log('Authorization code received:', code);
            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${port}`,
                    scope: 'identify',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData = await tokenResponseData.body.json();
            console.log('OAuth data:', oauthData);

            const userResult = await request('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            });

            const userData = await userResult.body.json();
            console.log('User data:', userData);
        } catch (error) {
            console.error(error);
        }
    }

    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
