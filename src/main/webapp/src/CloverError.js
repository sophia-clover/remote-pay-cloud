

/**
 * Error class for Clover specific errors.
 *
 * @param code a code to classify the error.
 * @param message the error message
 * @param cause the original cause of the error if this wraps some lower level system error.
 * @constructor
 */
function CloverError(code, message, cause) {
    this.name = "CloverError";
    this.code = code;
    this.message = message;
    this.cause = cause;

    this.stack = (new Error()).stack;
}
CloverError.prototype = new Error;