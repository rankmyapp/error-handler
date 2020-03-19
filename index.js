const Sentry = require('@sentry/node');
const debug = require('debug');

if (process.env.NODE_ENV !== 'test') {
  if (!process.env.NODE_ENV) throw Error('Invalid Node ENV');
  if (!process.env.SENTRY_URL) throw Error('Invalid Sentry DSN');
}

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction)
  Sentry.init({
    dsn: process.env.SENTRY_URL,
    environment: process.env.NODE_ENV,
  });

function filterLog({status, statusCode}, blockEvents) {
  const errorCode = typeof status === 'number' ? status : statusCode;
  return blockEvents.includes(errorCode);
}

const errorHandler = ({ blockEvents = [] } = {}) => ({
  middleware(err, req, res, next) {
    if (filterLog(err, blockEvents)) return next(err);
    const eventId = Sentry.captureException(err);
    const origin = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const title = `service:error->${origin}->eventId: ${eventId}`;
    debug(title)('throws an error %s', err.message);
    return next(err);
  },
  logError(origin, err) {
    if (!origin)
      throw Error('Origin is required (from where the error was thrown)');
    if (!err) throw Error('An Error is necessary to log');
    if (filterLog(err, blockEvents)) return false;
    const eventId = Sentry.captureException(err);
    const title = `service:error->${origin}-> eventId: ${eventId}`;
    debug(title)('throws an error %s', err.message);
    return true;
  },
});

module.exports = errorHandler;
