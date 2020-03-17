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

});

describe('Error handler logError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(() => errorHandler().logError(origin, error)).toThrowError(new Error('Origin is required (from where the error was trown)'))
    expect(captureException).toBeCalledTimes(0);
  });
});