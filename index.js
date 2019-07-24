const Sentry = require('@sentry/node')
const debug = require('debug')

if (!process.env.NODE_ENV) throw Error('Invalid Node ENV')
if (!process.env.SENTRY_URL) throw Error('Invalid Sentry DSN')

Sentry.init({ dsn: process.env.SENTRY_URL, environment: process.env.NODE_ENV });

const errorHandler = () => ({
  middleware(err, req, res, next) {
    const eventId = Sentry.captureException(err);
    debug(`service:error->${req.protocol + '://' + req.get('host') + req.originalUrl}-> enventId: ${eventId}`)('throws an error %o', err.message);
    next(err);
  },
  logError(origin, err) {
    if (!origin) throw Error('Origin is required (from where the error was trown)');
    if (!err) throw Error('An Error is necessary to log');
    const eventId = Sentry.captureException(err);
    debug(`service:error->${origin}-> enventId: ${eventId}`)('throws an error %o', err.message);
  },
});

module.exports = errorHandler;