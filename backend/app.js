const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const env = process.env.NODE_ENV || 'development';
const helmet = require('helmet');
const config = require('./config/config.json')[env];

const app = express();
app.use(helmet.xssFilter());
app.use(helmet.frameguard());

// setting view engine as ejs with file extension .html

app.set('views', `${__dirname}/views`);
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

process.setMaxListeners(0);

app.use(bodyParser.json({
    limit: '8mb'
})); // support json encoded bodies

app.use(bodyParser.urlencoded({
    limit: '8mb',
    extended: true
})); // support encoded bodies

app.use(cookieParser());

// app.use(config.baseUrl, express.static(path.join(__dirname, 'public')));

// logging POST Requests and parameters, sanitizing request payload
app.use((req, res, next) => {
    console.log('\x1b[33m%s\x1b[0m', '-------------------------------------------------------------------------');
    const ip = req.headers['x-real-ip'] || req.socket.remoteAddress || null;
    console.log('\x1b[36m%s\x1b[0m', `URL: ${req.originalUrl}`);
    console.log('\x1b[35m%s\x1b[0m', `Method: ${req.method}`);
    console.log('\x1b[36m%s\x1b[0m', `Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    console.log('\x1b[36m%s\x1b[0m', `IP-Address: ${ip}`);
    if (req.originalUrl != '/api/signin') {
        console.log('\x1b[36m%s\x1b[0m', 'Payload:');
        console.log(req.body);
    }
    console.log('\x1b[33m%s\x1b[0m', '--------------------------------------------------------------------------');

    res.header('X-powered-by', 'Blood, Sweat, and Tears');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header('Access-Control-Allow-Credentials', true);

    next();
});

/**
* Get all routes here
*/
const apiRoutes = require('./routes/api');

/**
* Set all routes here, orders are important
*/
app.use('/api/v1', apiRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res) => {
    // console.log(err);
    console.log(`Error, URL NOT FOUND. Requested URL: ${req.originalUrl}`);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = env === 'development' ? err : {};
    // render the error page
    // res.status(err.status || 500);
    res.json({ success: false, message: '404 - Not Found' });
    // res.render('error');
});

module.exports = app;
