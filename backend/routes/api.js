'use strict';

const express = require('express');

const router = express.Router();
const cors = require('cors');
const { verifyLogin } = require('../middleware');
const emailServices = require('../services/emailServices');

// middleware
router.use(verifyLogin);

router.use(cors());

router.post('/import_emails', async (req, res) => {
    const params = req.body;
    const data = await emailServices.importEmails(params);
    res.json(data);
});

router.post('/get-unique-emails', async (req, res) => {
    const params = req.body;
    const data = await emailServices.getAllUniqueEmails(params);
    res.json(data);
});

/** Pending API: Needs improvement, able to download csv */
router.get('/download_emails', async (req, res) => {
    const data = await emailServices.exportData(req, res);
    console.log({ data });
});

module.exports = router;
