const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname)));

// Simple in-memory user store
const users = [
  { email: 'test@example.com', password: 'test123', name: 'Test User' }
];

const SMARTBILL_EMAIL = 'robert.serbban@gmail.com';
const SMARTBILL_TOKEN = '003|6870cb6acac4546909f49820e364948e';
const SMARTBILL_CIF = '40474038';

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.user = user;
    return res.redirect('/invoices.html');
  }
  return res.redirect('/login.html');
});

app.get('/api/invoices', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await axios.get('https://api.smartbill.ro/invoice', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${SMARTBILL_TOKEN}`,
        'SB-Account-Email': SMARTBILL_EMAIL,
        'SB-Account-Cif': SMARTBILL_CIF
      }
    });
    res.json(result.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
