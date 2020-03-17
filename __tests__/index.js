jest.mock('@sentry/node');
const { captureException, init } = require('@sentry/node');

const errorHandler = require('../index');

describe('Error handler', () => {
  test('should not call Sentry init if NODE_ENV is not production', () => {
    expect(init).toBeCalledTimes(0);
  });
});

describe('Error handler middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const err = {
    message: 'test error',
    status: 404,
  }

  const req = {
    protocol: '',
    get: jest.fn(),
  }
  const res = {};
  const next = jest.fn();

  test('should call captureException', () => {
    const eventId = captureException.mockReturnValue('123');
    errorHandler().middleware(new Error(), req, res, next);
    expect(captureException).toBeCalled();
    expect(eventId).toBeTruthy();
  });

  test('should not send to sentry according to block list', () => {
    errorHandler([401, 403, 404]).middleware(err, req, res, next);
    expect(captureException).not.toBeCalled();
  })
});

describe('Error handler logError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const err = {
    message: 'test error',
    status: 404,
  }

  test('should call captureException', () => {
    const origin = 'test';
    const error = new Error();
    const eventId = captureException.mockReturnValue('123');
    errorHandler().logError(origin, error);
    expect(captureException).toBeCalled();
    expect(eventId).toBeTruthy();
  });

  test('should return an error if Origin and Error is not provided', () => {
    const origin = null;
    const error = null;
    expect(() => errorHandler().logError(origin, error)).toThrowError(new Error('Origin is required (from where the error was thrown)'))
    expect(captureException).toBeCalledTimes(0);
  });

  test('should not send to sentry according to block list', () => {
    errorHandler([401, 403, 404]).logError('teste', err);
    expect(captureException).not.toBeCalled();
  })
});