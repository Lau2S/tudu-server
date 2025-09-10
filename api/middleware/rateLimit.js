/**
 * @fileoverview Rate limiting middleware configuration for login protection.
 * Implements request throttling to prevent brute force attacks on authentication endpoints.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires express-rate-limit
 */

const rateLimit = require("express-rate-limit");

/**
 * Rate limiter specifically configured for login endpoint protection.
 * Prevents brute force attacks by limiting failed login attempts.
 * 
 * @constant {Object} loginLimiter
 * @description Rate limiting configuration for authentication endpoints
 * 
 * @property {number} windowMs - Time window in milliseconds (10 minutes)
 * @property {number} max - Maximum requests allowed per window (5 attempts)
 * @property {Object} message - Response message when limit exceeded
 * @property {number} statusCode - HTTP status code when limit exceeded (429)
 * @property {boolean} standardHeaders - Include rate limit info in standard headers
 * @property {boolean} legacyHeaders - Exclude legacy rate limit headers
 * @property {boolean} skipSuccessfulRequests - Only count failed requests toward limit
 * 
 * @example
 * // Usage in routes:
 * router.post('/login', loginLimiter, loginController);
 * 
 * @example
 * // Response when limit exceeded:
 * {
 *   "message": "Demasiados intentos fallidos, intente de nuevo más tarde"
 * }
 * 
 * @example
 * // Rate limit headers in response:
 * {
 *   "X-RateLimit-Limit": "5",
 *   "X-RateLimit-Remaining": "0",
 *   "X-RateLimit-Reset": "1672531200"
 * }
 */
const loginLimiter = rateLimit({
  /**
   * Time window for counting requests.
   * 10 minutes in milliseconds.
   * @type {number}
   */
  windowMs: 10 * 60 * 1000,
  
  /**
   * Maximum number of requests allowed per window.
   * Only failed login attempts count toward this limit.
   * @type {number}
   */
  max: 5,
  
  /**
   * Response message when rate limit is exceeded.
   * Returned as JSON in response body.
   * @type {Object}
   */
  message: {
    message: "Demasiados intentos fallidos, intente de nuevo más tarde",
  },
  
  /**
   * HTTP status code to return when limit exceeded.
   * 429 Too Many Requests.
   * @type {number}
   */
  statusCode: 429,
  
  /**
   * Include standard rate limit headers in response.
   * Provides client with limit information.
   * @type {boolean}
   */
  standardHeaders: true,
  
  /**
   * Exclude legacy X-RateLimit headers.
   * Uses only standard headers for cleaner response.
   * @type {boolean}
   */
  legacyHeaders: false,
  
  /**
   * Only count failed requests toward the limit.
   * Successful logins don't increment counter.
   * @type {boolean}
   */
  skipSuccessfulRequests: true,
});

/**
 * Export the configured login rate limiter middleware.
 * @type {Function}
 * @see loginLimiter
 */
module.exports = loginLimiter;
