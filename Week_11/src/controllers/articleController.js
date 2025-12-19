const Article = require('../models/Article');

exports.getAll = (req, res) => res.json(Article.findAll());

exports.create = (req, res) => {
    const { title, content } = req.body;
    const newArticle = Article.create({ title, content, authorId: req.user.id });
    res.status(201).json(newArticle);
};

exports.update = (req, res) => {
    const updated = Article.update(req.params.id, req.body);
    res.json(updated);
};

exports.remove = (req, res) => {
    Article.delete(req.params.id);
    res.json({ message: "Article deleted successfully" });
};