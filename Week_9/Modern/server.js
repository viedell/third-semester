const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/submit', async (req, res) => {
  const { name, email } = req.body;

  await prisma.user.create({
    data: { name, email }
  });

  res.send("Data saved using Prisma ORM");
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));
