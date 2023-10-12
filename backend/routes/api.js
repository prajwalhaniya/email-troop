'use strict';

const express = require('express');

const router = express.Router();
const cors = require('cors');
const { verifyLogin } = require('../middleware');
const exportServices = require('../services/exportServices');

// middleware
router.use(verifyLogin);

router.use(cors());

router.post('/import_emails', async (req, res) => {
    const params = req.body;
    const data = await exportServices.importEmails(params);
    res.json(data);
});

module.exports = router;
