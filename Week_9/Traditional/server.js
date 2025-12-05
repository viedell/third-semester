const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/submit', (req, res) => {
  const { name, email } = req.body;

  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  stmt.run(name, email, function () {
    res.send("Data saved using sqlite3 traditional method");
  });
  stmt.finalize();
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));
