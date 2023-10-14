const Imap = require('imap');
const { inspect } = require('util');
const dayjs = require('dayjs');
const models = require('../models');

const self = module.exports = {
    /**
     * @description imports all emails to emails table & unique email contact to unique_emails table
     * @requires getAllEmails To get all emails in the inbox
     * @param {object} params Includes values that are passed by the user like email & password
     * @returns {object}
     */
    importEmails: async (params) => {
        try {
            const contacts = await self.getAllEmails(params);
            if (contacts && contacts.length) {
                const allEmails = [];

                for (let i = 0; i < contacts.length; i++) {
                    const {
                        from, to, date, cc
                    } = contacts[i];

                    if (from) {
                        allEmails.push({
                            email: from,
                            email_date: date,
                        });
                    }

                    if (to) {
                        allEmails.push({
                            email: to,
                            email_date: date,
                        });
                    }

                    if (cc) {
                        const ccEmails = await self.extractEmails(cc);

                        for (let i = 0; i < ccEmails.length; i++) {
                            allEmails.push({
                                email: ccEmails[i],
                                email_date: date,
                            });
                        }
                    }
                }

                const uniqueEmails = [...new Set(allEmails.map((item) => item.email.toLowerCase()))];

                const result = [];

                for (let i = 0; i < uniqueEmails.length; i++) {
                    const email = uniqueEmails[i];

                    const foundEmails = allEmails.filter((val) => val.email.toLowerCase() === email);
                    foundEmails.sort((a, b) => new Date(b.email_date) - new Date(a.email_date));
                    result.push(foundEmails[0]);
                }

                await models.unique_email.bulkCreate(result, { updateOnDuplicate: ['email', 'email_date'] });
                contacts.map(async (contact) => {
                    await models.email.create(contact);
                });

                return { success: true, message: `Imported ${contacts.length} emails & found ${uniqueEmails.length} unique emails` };
            }
            return { success: true, message: 'Imported 0 Contactas' };
        } catch (error) {
            console.log('Error while importing the emails', error);
            return { success: false, message: 'Error while importing the emails' };
        }
    },

    getAllEmails: async (params) => new Promise((resolve, reject) => {
        const mailServer = new Imap({
            user: params.email,
            password: params.password,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false,
            },
            authTimeout: 3000,
        }).once('error', (err) => {
            console.log('Source Server Error:- ', err);
            if (err && err.textCode && err.textCode == 'AUTHENTICATIONFAILED') {
                reject('Error: Invalid Login credentials');
            } else if (err && err.textCode && err.textCode == 'ALERT') {
                reject('Error: Login to your gmail account failed please check your gmail settings');
            } else {
                reject('Error occured while authenticating');
            }
        });

        mailServer.connect();
        mailServer.once('ready', () => {
            mailServer.openBox('INBOX', true, (err, box) => {
                if (err) {
                    console.log(`[${new Date()}]: `, 'Error while getting emails getGmailContacts', err);
                    reject('Error while fetching emails from the server, please try again or contact developer for more help.');
                } else {
                    console.log('message', 'server ready');
                    models.email.findOne({
                        id: 1,
                        order: [['mailId', 'DESC']],
                        attributes: ['mailId']
                    }).then((Contact) => {
                        if (Contact?.dataValues.mailId === box.messages.total) {
                            resolve([]);
                        } else {
                            params.from = Contact?.dataValues?.mailId ? Contact.dataValues.mailId + 1 : 1;
                            params.to = Contact?.dataValues?.mailId ? Contact.dataValues.mailId + 20000 : 20000;

                            mailServer.search([`${params.from}:${params.to}`], (err, results) => {
                                if (!results || !results.length) {
                                    mailServer.end();
                                    reject('No emails found');
                                } else {
                                    const updatedResults = results;
                                    console.log('-----------------------------------------------');
                                    console.log(`processing ${updatedResults.length} emails.`);
                                    console.log('-----------------------------------------------');
                                    if (updatedResults && updatedResults.length) {
                                        const emails = [];
                                        const f = mailServer.fetch(updatedResults, { bodies: ['HEADER.FIELDS (FROM)', 'HEADER.FIELDS (TO)', 'HEADER.FIELDS (SUBJECT)', 'HEADER.FIELDS (DATE)', 'HEADER.FIELDS (CC)'], struct: true });
                                        f.on('message', (msg, seqno) => {
                                            const email = {
                                                mailId: seqno,
                                            };
                                            msg.on('body', (stream, info) => {
                                                let buffer = '';
                                                stream.on('data', async (chunk) => {
                                                    buffer += chunk.toString('utf8');
                                                    if (info.which == 'HEADER.FIELDS (FROM)') {
                                                        buffer = buffer.replace(/\r/gi, '');
                                                        buffer = buffer.replace(/\n/gi, '');
                                                        email.from = await self.getEmailFromString(buffer);
                                                    }
                                                    if (info.which == 'HEADER.FIELDS (TO)') {
                                                        buffer = buffer.replace(/\r/gi, '');
                                                        buffer = buffer.replace(/\n/gi, '');
                                                        email.to = await self.getEmailFromString(buffer);
                                                    }
                                                    if (info.which == 'HEADER.FIELDS (SUBJECT)') {
                                                        email.subject = buffer;
                                                    }
                                                    if (info.which == 'HEADER.FIELDS (DATE)') {
                                                        buffer = buffer.replace(/\r/gi, '');
                                                        buffer = buffer.replace(/\n/gi, '');
                                                        buffer = buffer.replace(/^Date: /, '');
                                                        buffer = dayjs(buffer, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('YYYY-MM-DD HH:mm:ss');
                                                        email.date = buffer;
                                                    }
                                                    if (info.which == 'HEADER.FIELDS (CC)') {
                                                        buffer = buffer.replace(/\r/gi, '');
                                                        buffer = buffer.replace(/\n/gi, '');
                                                        email.cc = buffer;
                                                    }
                                                });
                                                stream.once('end', () => {
                                                });
                                            });
                                            msg.once('attributes', (attrs) => {
                                                const attributes = inspect(attrs, false, 8);
                                                if (attributes.date) {
                                                    email.date = attributes.date;
                                                }
                                            });
                                            msg.once('end', () => {
                                                emails.push(email);
                                            });
                                        });

                                        f.once('error', (err) => {
                                            console.log(`Fetch error: ${err}`);
                                            mailServer.end();
                                            reject('Error while fetching emails from the server, please try again or contact developer for more help.');
                                        });

                                        f.once('end', () => {
                                            console.log('Done fetching all messages!');
                                            mailServer.end();
                                            resolve(emails);
                                        });
                                    } else {
                                        mailServer.end();
                                        resolve([]);
                                    }
                                }
                            });
                        }
                    }).catch((err) => {
                        console.log(`[${new Date()}]: `, 'Error while getting contacts from getGmailContacts importGmailContacts', err);
                        reject('Error while importing contacts from gmail');
                    });
                }
            });
        });
    }),

    getEmailFromString: async (buffer) => {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/;
        if (buffer) {
            const match = buffer.match(emailRegex);
            const emailId = match ? match[1] : null;
            return emailId;
        }
        return null;
    },

    extractEmails: async (text) => {
        try {
            const emailRegex = /[\w.-]+@[\w-]+\.[\w.-]+/g;
            return text.match(emailRegex) || [];
        } catch (error) {
            console.log('Error while extracting emails', error);
            return false;
        }
    },

    getAllUniqueEmails: async (params) => {
        try {
            let { limit } = params;
            if (limit) {
                limit = limit > 12 ? limit - 12 : 0;
            } else {
                limit = 0;
            }
            const data = await models.unique_email.findAndCountAll({
                limit: [limit, 12],
                attributes: ['id', 'email', 'email_date'],
                order: [['email_date', 'ASC']],
                raw: true,
                nest: true
            });
            if (data && data.rows.length > 0) {
                return { success: true, message: data };
            }
            return { success: true, message: [] };
        } catch (error) {
            console.log('Error while getting all unique emails', error);
            return { success: false, message: 'Error while getting all unique emails' };
        }
    }
};
