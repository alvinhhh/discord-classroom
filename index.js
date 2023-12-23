const express = require('express');
const app = express();
const port = 3000; // You can use any port you prefer

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

const querystring = require('querystring');
const { clientId, clientSecret, redirectUri } = require('./config'); // Create a config.js file to store your credentials

app.get('/auth/google', (req, res) => {
  const queryParams = querystring.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/classroom.courses.readonly', // Adjust scope as needed
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams}`;
  res.redirect(authUrl);
});

const axios = require('axios');

app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;

  const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
    params: {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    },
  });

  const accessToken = tokenResponse.data.access_token;
  // Store accessToken for future requests

  res.send('Authentication successful');
});

app.get('/classroom', async (req, res) => {
  const accessToken = 'your-access-token'; // Retrieve the access token from your storage

  try {
    const classroomResponse = await axios.get('https://classroom.googleapis.com/v1/courses', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const courses = classroomResponse.data.courses;
    // Process and send the courses data as a response
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving classroom data');
  }
});
