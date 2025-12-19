const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { authenticate, authorizeManagement } = require('../middleware/auth');

// PUBLIC: Guest Access
router.get('/', (req, res) => res.json(Article.findAll()));

// MEMBER & ADMIN: Both can create their own articles
router.post('/', authenticate, (req, res) => {
    const newArt = Article.create({ 
        title: req.body.title, 
        authorId: req.user.id // Token ID ensures correct ownership
    });
    res.status(201).json(newArt);
});

// DELETE: Requires Login AND (Owner or Admin)
router.delete('/:id', authenticate, authorizeManagement, (req, res) => {
    const Article = require('../models/Article');
    Article.delete(req.params.id);
    res.json({ message: "Article liquidated successfully" });
});

// GATED: Update requires either being the Owner or an Admin
router.put('/:id', authenticate, authorizeManagement, (req, res) => {
    const updated = Article.update(req.params.id, req.body);
    res.json(updated);
});

module.exports = router;