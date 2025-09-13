/**
 * @fileoverview Generic Data Access Object (DAO) base class for MongoDB operations.
 * Provides reusable CRUD operations that can be extended by specific model DAOs.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires mongoose
 */

/**
 * Generic Data Access Object (DAO) class for MongoDB operations.
 * Provides standardized CRUD operations for any Mongoose model.
 * Specific DAOs (e.g., UserDAO, TaskDAO) should extend this class
 * and inject their model via the constructor.
 * 
 * @class GlobalDAO
 * @description Base class providing common database operations for all models
 * 
 * @example
 * // Extend for specific model
 * class UserDAO extends GlobalDAO {
 *   constructor() {
 *     super(UserModel);
 *   }
 * }
 * 
 * @example
 * // Use inherited methods
 * const userDAO = new UserDAO();
 * const users = await userDAO.getAll();
 * const user = await userDAO.create({ name: "John" });
 */
class GlobalDAO {
  /**
   * Create a new GlobalDAO instance.
   * 
   * @constructor
   * @param {import("mongoose").Model} model - The Mongoose model to operate on
   * @description Initializes DAO with specific Mongoose model for database operations
   * @example
   * const dao = new GlobalDAO(UserModel);
   */
  constructor(model) {
    /**
     * The Mongoose model instance for database operations.
     * @type {import("mongoose").Model}
     * @private
     */
    this.model = model;
  }

  /**
   * Create and persist a new document in the database.
   * Validates the data according to the model schema before saving.
   * 
   * @async
   * @method create
   * @param {Object} data - The data used to create the document
   * @returns {Promise<Object>} The created document with generated _id and timestamps
   * @throws {Error} If validation fails or database errors occur
   * @description Creates new document with automatic validation and timestamps
   * 
   * @example
   * // Create a new user
   * const userData = {
   *   email: "user@example.com",
   *   firstName: "John",
   *   lastName: "Doe",
   *   password: "SecurePass123!"
   * };
   * const newUser = await userDAO.create(userData);
   * console.log(newUser._id); // Generated MongoDB ObjectId
   * 
   * @example
   * // Handle validation errors
   * try {
   *   await userDAO.create({ email: "invalid-email" });
   * } catch (error) {
   *   console.log(error.message); // "Error creating document: Invalid email"
   * }
   */
  async create(data) {
    try {
      /**
       * Create new document instance with provided data.
       * Mongoose will validate according to schema.
       */
      const document = new this.model(data);
      
      /**
       * Save document to database.
       * Triggers pre-save middleware and validation.
       */
      return await document.save();
    } catch (error) {
      /**
       * Wrap and re-throw errors with consistent format.
       * Includes original error details for debugging.
       */
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  /**
   * Find a document by its unique MongoDB ObjectId.
   * 
   * @async
   * @method read
   * @param {string} id - The document's unique identifier (MongoDB ObjectId)
   * @returns {Promise<Object>} The found document
   * @throws {Error} If document not found or database errors occur
   * @description Retrieves single document by primary key
   * 
   * @example
   * // Find user by ID
   * const userId = "507f1f77bcf86cd799439011";
   * const user = await userDAO.read(userId);
   * console.log(user.email);
   * 
   * @example
   * // Handle not found
   * try {
   *   await userDAO.read("nonexistent-id");
   * } catch (error) {
   *   console.log(error.message); // "Error getting document by ID: Document not found"
   * }
   */
  async read(id) {
    try {
      /**
       * Find document by MongoDB ObjectId.
       * Returns null if not found.
       */
      const document = await this.model.findById(id);
      
      /**
       * Throw error if document doesn't exist.
       * Provides consistent error handling.
       */
      if (!document) throw new Error("Document not found");
      
      return document;
    } catch (error) {
      /**
       * Wrap and re-throw errors with consistent format.
       */
      throw new Error(`Error getting document by ID: ${error.message}`);
    }
  }

  /**
   * Update a document by ID with new data.
   * Validates the update data and returns the updated document.
   * 
   * @async
   * @method update
   * @param {string} id - The document's unique identifier
   * @param {Object} updateData - The data to update the document with
   * @returns {Promise<Object>} The updated document
   * @throws {Error} If document not found or validation errors occur
   * @description Updates existing document with validation and returns new version
   * 
   * @example
   * // Update user information
   * const updatedUser = await userDAO.update(userId, {
   *   firstName: "Jane",
   *   age: 30
   * });
   * console.log(updatedUser.firstName); // "Jane"
   * 
   * @example
   * // Update with validation error
   * try {
   *   await userDAO.update(userId, { email: "invalid-email" });
   * } catch (error) {
   *   console.log(error.message); // Validation error details
   * }
   */
  async update(id, updateData) {
    try {
      /**
       * Find and update document atomically.
       * Returns updated document with new: true option.
       * Runs validation with runValidators: true.
       */
      const updatedDocument = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      /**
       * Throw error if document not found.
       */
      if (!updatedDocument) throw new Error("Document not found");
      
      return updatedDocument;
    } catch (error) {
      /**
       * Wrap and re-throw errors with consistent format.
       */
      throw new Error(`Error updating document by ID: ${error.message}`);
    }
  }

  /**
   * Delete a document by ID.
   * Permanently removes the document from the database.
   * 
   * @async
   * @method delete
   * @param {string} id - The document's unique identifier
   * @returns {Promise<Object>} The deleted document
   * @throws {Error} If document not found or database errors occur
   * @description Permanently removes document from database
   * 
   * @example
   * // Delete user
   * const deletedUser = await userDAO.delete(userId);
   * console.log(`Deleted user: ${deletedUser.email}`);
   * 
   * @example
   * // Handle not found during deletion
   * try {
   *   await userDAO.delete("nonexistent-id");
   * } catch (error) {
   *   console.log(error.message); // "Error deleting document by ID: Document not found"
   * }
   */
  async delete(id) {
    try {
      /**
       * Find and delete document atomically.
       * Returns the deleted document.
       */
      const deletedDocument = await this.model.findByIdAndDelete(id);
      
      /**
       * Throw error if document not found.
       */
      if (!deletedDocument) throw new Error("Document not found");
      
      return deletedDocument;
    } catch (error) {
      /**
       * Wrap and re-throw errors with consistent format.
       */
      throw new Error(`Error deleting document by ID: ${error.message}`);
    }
  }

  /**
   * Retrieve all documents matching the given filter.
   * If no filter provided, returns all documents in the collection.
   * 
   * @async
   * @method getAll
   * @param {Object} [filter={}] - Optional MongoDB filter object
   * @returns {Promise<Array>} An array of matching documents
   * @throws {Error} If database errors occur
   * @description Retrieves multiple documents with optional filtering
   * 
   * @example
   * // Get all users
   * const allUsers = await userDAO.getAll();
   * 
   * @example
   * // Get users with filter
   * const activeUsers = await userDAO.getAll({ isLocked: false });
   * 
   * @example
   * // Get users by age range
   * const youngUsers = await userDAO.getAll({
   *   age: { $gte: 18, $lte: 25 }
   * });
   * 
   * @example
   * // Get user tasks by email
   * const userTasks = await taskDAO.getAll({
   *   user_email: "user@example.com"
   * });
   */
  async getAll(filter = {}) {
    try {
      /**
       * Find all documents matching the filter.
       * Returns empty array if no matches found.
       */
      return await this.model.find(filter);
    } catch (error) {
      /**
       * Wrap and re-throw errors with consistent format.
       */
      throw new Error(`Error getting documents: ${error.message}`);
    }
  }
}

/**
 * Export the GlobalDAO class for extension by specific model DAOs.
 * @type {GlobalDAO}
 * @description Base DAO class for inheritance
 */
module.exports = GlobalDAO;
