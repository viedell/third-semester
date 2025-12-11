// routes/index.js
var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');

/* GET home page (List Users) */
router.get('/', userController.getAllUsers);

/* GET Register Page */
router.get('/register', userController.formUser);

/* POST Submit User */
router.post('/submit', userController.submitUser);

module.exports = router;
