/**
 * errors.js
 * Custom error classes với exit codes
 */

class BaseError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = this.constructor.name;
    this.exitCode = exitCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends BaseError {
  constructor(message) {
    super(message, 2);
  }
}

class NetworkError extends BaseError {
  constructor(message) {
    super(message, 10);
  }
}

class ProcessError extends BaseError {
  constructor(message) {
    super(message, 20);
  }
}

class SyncError extends BaseError {
  constructor(message) {
    super(message, 20);
  }
}

module.exports = {
  BaseError,
  ValidationError,
  NetworkError,
  ProcessError,
  SyncError,
};
