require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/tournaments', require('./routes/tournaments'));
app.use('/registrations', require('./routes/registrations'));
app.use('/payments', require('./routes/payments'));
app.use('/matches', require('./routes/matches'));
app.use('/notifications', require('./routes/notifications'));
app.use('/cms', require('./routes/cms'));
app.use('/stats', require('./routes/stats'));
app.use('/uploads-api', require('./routes/uploads')); // generic image upload (avatars, team logos, banners, etc.)

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Arena Esports API listening on :${port}`));
