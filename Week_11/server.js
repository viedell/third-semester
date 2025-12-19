require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const articleRoutes = require('./src/routes/articleRoutes');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// 1. CREDENTIAL DATA (The "User Database")
const users = [
    { username: 'admin', password: '1234', id: 999, role: 'admin' },
    { username: 'test', password: '1234', id: 101, role: 'member' }
];

// 2. LOGIN ROUTE (Verifies admin/1234 or test/1234)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Find user with matching credentials
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate Token with Role and ID
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, role: user.role, username: user.username } });
});

app.use('/api/articles', articleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[SERVER] Running at http://localhost:${PORT}`));