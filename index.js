const Sentry = require('@sentry/node');
const debug = require('debug');

if (process.env.NODE_ENV !== 'test') {
  if (!process.env.NODE_ENV) throw Error('Invalid Node ENV');
  if (!process.env.SENTRY_URL) throw Error('Invalid Sentry DSN');
}

const production = process.env.NODE_ENV === 'production';

if (production)
  Sentry.init({
    dsn: process.env.SENTRY_URL,
    environment: process.env.NODE_ENV,
  });

const errorHandler = ({ blockEvents = [] } = {}) => ({
  middleware(err, req, res, next) {
    if (blockEvents.includes(err.status)) return next(err);
    const eventId = Sentry.captureException(err);
    const origin = `service:error->${req.protocol}://${req.get('host')}${
      req.originalUrl
    }->eventId: ${eventId}`;
    debug(origin)('throws an error %o', err.message);
    return next(err);
  },
  logError(origin, err) {
    if (!origin)
      throw Error('Origin is required (from where the error was thrown)');
    if (!err) throw Error('An Error is necessary to log');
    if (blockEvents.includes(err.status)) return false;
    const eventId = Sentry.captureException(err);
    debug(`service:error->${origin}-> eventId: ${eventId}`)(
      'throws an error %o',
      err.message
    );
    return true;
  },
});

module.exports = errorHandler;
