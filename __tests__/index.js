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
  };

  const blockEvents = [401, 403, 404];

  const req = {
    protocol: '',
    get: jest.fn(),
  };
  const res = {};
  const next = jest.fn();

  test('should send error to sentry and move on to next middleware', () => {
    errorHandler().middleware(err, req, res, next);
    expect(captureException).toBeCalled();
    expect(next).toBeCalled();
  });

  test('should filter errors sent to sentry', () => {
    errorHandler({ blockEvents }).middleware(err, req, res, next);
    expect(captureException).not.toBeCalled();
    expect(next).toBeCalled();

    // Error code 500 doesn't throw object with code
    next.mockClear();
    const err500 = { message: 'test error 500' };
    errorHandler({ blockEvents }).middleware(err500, req, res, next);
    expect(captureException).toBeCalled();
    expect(next).toBeCalled();

    // Errors created by express's res object
    next.mockClear();
    const resErr = { ...err, status: () => {}, statusCode: 403 };
    errorHandler({ blockEvents }).middleware(resErr, req, res, next);
    expect(captureException).toBeCalled();
    expect(next).toBeCalled();
  });
});

describe('Error handler logError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const origin = 'test origin';

  const err = {
    message: 'test error',
    status: 404,
  };

  const blockEvents = [401, 403, 404];

  test('should call captureException', () => {
    errorHandler().logError(origin, err);
    expect(captureException).toBeCalled();
  });

  test('should return an error if Origin and Error is not provided', () => {
    expect(() => errorHandler().logError(null, null)).toThrowError(
      new Error('Origin is required (from where the error was thrown)')
    );
    expect(captureException).not.toBeCalled();
  });

  test('should filter errors sent to sentry', () => {
    errorHandler({ blockEvents }).logError(origin, err);
    expect(captureException).not.toBeCalled();

    // Error code 500 doesn't throw object with code
    const err500 = { message: 'test error 500' };
    errorHandler({ blockEvents }).logError(origin, err500);
    expect(captureException).toBeCalled();

    // Errors created by express's res object
    const resErr = { ...err, status: () => {}, statusCode: 403 };
    errorHandler({ blockEvents }).logError(origin, resErr);
    expect(captureException).toBeCalled();
  });
});
