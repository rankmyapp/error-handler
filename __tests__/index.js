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

  test('should send error to sentry and move on to next middleware', () => {
    errorHandler().middleware(err, req, res, next);
    expect(captureException).toBeCalled();
    expect(next).toBeCalled();
  });

  test('should filter errors sent to sentry', () => {
    errorHandler([401, 403, 404]).middleware(err, req, res, next);
    expect(captureException).not.toBeCalled();

    const err500 = {message: 'test error 500'}
    errorHandler([401, 403, 404]).logError('test', err500);
    expect(captureException).toBeCalled();
  })
});

describe('Error handler logError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const origin = 'test origin'

  const err = {
    message: 'test error',
    status: 404,
  }

  test('should call captureException', () => {
    errorHandler().logError(origin, err);
    expect(captureException).toBeCalled();
  });

  test('should return an error if Origin and Error is not provided', () => {
    expect(() => errorHandler().logError(null, null)).toThrowError(new Error('Origin is required (from where the error was thrown)'))
    expect(captureException).not.toBeCalled();
  });

  test('should filter errors sent to sentry', () => {
    errorHandler([401, 403, 404]).logError(origin, err);
    expect(captureException).not.toBeCalled();
    
    const err500 = {message: 'test error 500'} // Doesn't throw error with code
    errorHandler([401, 403, 404]).logError(origin, err500);
    expect(captureException).toBeCalled();
  })
});