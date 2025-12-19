let articles = [
    { id: 1, title: "Market Analysis", content: "High volatility expected.", authorId: 101 },
    { id: 2, title: "Admin Notes", content: "System stable.", authorId: 999 }
];

class Article {
    static findAll() { return articles; }
    static findById(id) { return articles.find(a => a.id === parseInt(id)); }
    static create(data) {
        const newArt = { id: articles.length + 1, ...data };
        articles.push(newArt);
        return newArt;
    }
    static update(id, data) {
        const index = articles.findIndex(a => a.id === parseInt(id));
        if (index === -1) return null;
        articles[index] = { ...articles[index], ...data };
        return articles[index];
    }
    static delete(id) {
        // We filter the array to keep everything EXCEPT the matching ID
        articles = articles.filter(a => a.id !== parseInt(id));
        return true;
    }
}
    
module.exports = Article;