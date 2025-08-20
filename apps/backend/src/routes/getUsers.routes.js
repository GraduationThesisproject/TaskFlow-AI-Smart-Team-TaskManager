const express = require('express');
const router = express.Router();

const {getUsers, getUserByEmail} = require('../controllers/getUsers.controller');

router.get('/', getUsers);
router.get('/:email', getUserByEmail);

module.exports = router;