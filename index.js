global.env = require('./env.json')['development'];
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;
const UserRouter = require('./Sources/userData/userRouter');
const db = require('./Sources/db');
/**
 * Logs Server Errors
 * @param {Error} err The error object.
 * @param {IncomingMessage} req The HTTP Request.
 * @param {ServerResponse} res The HTTP Response.
 * @param {ServerResponse} next A callback that returns an error.
 */

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
  }
  
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
  
/**
 * Handles Failed Requests that returns HTML.
 * @param {Error} err The error object.
 * @param {IncomingMessage} req The HTTP Request.
 * @param {ServerResponse} res The HTTP Response.
 * @param {ServerResponse} next A callback that returns an error.
 */
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: { 'code': 500, 'message': 'Something failed!' } });
    } else {
        next(err);
    }
}
  
/**
 * Handles invalid parameters error
 * @param {Error} err The error object.
 * @param {IncomingMessage} req The HTTP Request.
 * @param {ServerResponse} res The HTTP Response.
 * @param {ServerResponse} next A callback that returns an error.
 */
function errorHandler(err, req, res, next) {
    res.status(500);
    res.json({ status: { 'code': 500, 'title': 'Invalid Operation', 'message': 'Invalid Parameters' } });
}
  
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(bodyParser.json());
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.use('/user', UserRouter);
const server = http.createServer(app);
server.listen(PORT, () => {
    db.connect();
    console.log('Server is running on PORT:', PORT);
});