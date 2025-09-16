/**
 * @fileoverview User Data Access Object implementation.
 * Provides specialized database operations for User model extending base GlobalDAO.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires ../models/User
 * @requires ./GlobalDAO
 */

const User = require("../models/User");
const GlobalDAO = require("./GlobalDAO");

/**
 * Data Access Object (DAO) for the User model.
 * Extends the generic {@link GlobalDAO} class to provide
 * database operations (create, read, update, delete, getAll)
 * specifically for User documents with additional user-specific methods.
 *
 * @class UserDAO
 * @extends GlobalDAO
 * @description Specialized DAO for user-related database operations
 *
 * @example
 * // Create a new user
 * const newUser = await userDAO.create({
 *   email: "user@example.com",
 *   password: "SecurePass123!",
 *   firstName: "John",
 *   lastName: "Doe"
 * });
 *
 * @example
 * // Find user by email
 * const user = await userDAO.findByEmail("user@example.com");
 */
class UserDAO extends GlobalDAO {
  /**
   * Create a new UserDAO instance.
   * Passes the User Mongoose model to the parent class so that
   * all inherited CRUD methods operate on the User collection.
   *
   * @constructor
   * @description Initializes UserDAO with User model for database operations
   */
  constructor() {
    super(User);
  }

  /**
   * Find a user document by email address.
   * Specialized method for user authentication and identification.
   *
   * @async
   * @method findByEmail
   * @param {string} email - The email address to search for
   * @returns {Promise<Object>} The user document if found
   * @throws {Error} If user not found or database error occurs
   * @description Searches for user by unique email field
   *
   * @example
   * // Find user for login
   * try {
   *   const user = await userDAO.findByEmail("user@example.com");
   *   const isValidPassword = await user.validatePassword("inputPassword");
   *   if (isValidPassword) {
   *     // Login successful
   *   }
   * } catch (error) {
   *   // Handle "Correo o contraseña inválidos" error
   * }
   *
   * @example
   * // Check if email already exists
   * try {
   *   await userDAO.findByEmail("new@example.com");
   *   // Email already exists
   * } catch (error) {
   *   // Email is available for registration
   * }
   */
  async findByEmail(email) {
    try {
      /**
       * Search for user document by email field.
       * Email is unique index in User schema.
       */
      const document = await this.model.findOne({ email: email });

      /**
       * Throw error if no user found with given email.
       * Provides generic error message for security.
       */
      if (!document) throw new Error("Correo o contraseña inválidos");

      return document;
    } catch (error) {
      /**
       * Re-throw error with original message.
       * Maintains error handling consistency.
       */
      throw new Error(error.message);
    }
  }

  async existsByEmail(email) {
    try {
      return await this.model.findOne({ email: email });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

/**
 * Export a singleton instance of UserDAO.
 * This ensures the same DAO instance is reused across the application,
 * avoiding redundant instantiations and maintaining consistency.
 *
 * @type {UserDAO}
 * @description Singleton instance for user database operations
 * @example
 * // Import and use in controllers
 * const userDAO = require('../dao/UserDAO');
 * const users = await userDAO.getAll();
 */
module.exports = new UserDAO();
