'use strict';

const express = require('express');

const router = express.Router();
const { verifyLogin } = require('../middleware');

// middleware
router.use(verifyLogin);

router.get('/', async (req, res) => {
    console.log('/ route is being called');
    res.send({ success: true, message: 'API Is being called successfully' });
});

module.exports = router;
