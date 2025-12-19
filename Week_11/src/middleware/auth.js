const jwt = require('jsonwebtoken');
const Article = require('../models/Article');

// 1. Authenticate: Verify the JWT Token
exports.authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized. Please login." });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid session." });
    }
};

// 2. Authorize: The "Master Key" vs "Owner Key" Logic
exports.authorizeManagement = (req, res, next) => {
    const article = Article.findById(req.params.id);
    
    if (!article) return res.status(404).json({ error: "Article not found." });

    const isAdmin = req.user.role === 'admin';
    const isOwner = article.authorId === req.user.id;

    // RULE: Admin manages ALL; Member manages ONLY their own.
    // Member CANNOT edit Admin articles because they are not owners and not admins.
    if (isAdmin || isOwner) {
        return next(); 
    }

    res.status(403).json({ error: "Forbidden: You cannot modify articles created by an Admin or other members." });
};