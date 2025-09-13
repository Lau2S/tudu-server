/**
 * @fileoverview Generic base controller class for REST API operations.
 * Provides standardized CRUD operations that can be extended by specific controllers.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires express
 */

/**
 * Generic global controller class providing common CRUD operations.
 * Delegates actual database logic to a corresponding DAO (Data Access Object).
 * All specific controllers should extend this class for consistent API behavior.
 * 
 * @class GlobalController
 * @description Base controller class with standardized REST API operations
 * 
 * @example
 * // Extend for specific resource
 * class UserController extends GlobalController {
 *   constructor() {
 *     super(UserDAO);
 *   }
 * }
 * 
 * @example
 * // Use inherited methods in routes
 * router.get('/users', userController.getAll.bind(userController));
 * router.post('/users', userController.create.bind(userController));
 */
class GlobalController {
  /**
   * Create a new GlobalController instance.
   * 
   * @constructor
   * @param {Object} dao - The DAO instance used to interact with the database
   * @description Initializes controller with specific DAO for database operations
   * @example
   * const controller = new GlobalController(UserDAO);
   */
  constructor(dao) {
    /**
     * Data Access Object instance for database operations.
     * @type {Object}
     * @private
     */
    this.dao = dao;
  }

  /**
   * Create a new document in the database.
   * Handles validation errors and duplicate key constraints.
   * 
   * @async
   * @method create
   * @param {import('express').Request} req - Express request object containing the data in `req.body`
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends status 201 with the created document, or 400/409 on error
   * @description Creates new resource with automatic error handling
   * 
   * @example
   * // POST /api/users
   * // Request body: { "email": "user@example.com", "name": "John" }
   * // Response: 201 { "_id": "...", "email": "user@example.com", "name": "John", "createdAt": "..." }
   * 
   * @example
   * // Duplicate email error
   * // Response: 409 { "message": "Duplicate key error: A record with this unique field already exists." }
   * 
   * @example
   * // Validation error
   * // Response: 400 { "message": "Validation failed: email is required" }
   */
  async create(req, res) {
    console.log("Creating item with data:", req.body);
    try {
      /**
       * Create new document using DAO.
       * Validation happens at DAO/model level.
       */
      const item = await this.dao.create(req.body);
      
      /**
       * Return created document with 201 status.
       */
      res.status(201).json(item);
    } catch (error) {
      /**
       * Handle specific database errors.
       */
      if (error.message.includes("duplicate key error")) {
        res.status(409).json({
          message:
            "Duplicate key error: A record with this unique field already exists.",
        });
      } else {
        /**
         * Handle validation and other errors.
         */
        res.status(400).json({ message: error.message });
      }
    }
  }

  /**
   * Retrieve a document by its unique identifier.
   * 
   * @async
   * @method read
   * @param {import('express').Request} req - Express request object with `req.params.id`
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends status 200 with the document, or 404 if not found
   * @description Retrieves single resource by ID
   * 
   * @example
   * // GET /api/users/507f1f77bcf86cd799439011
   * // Response: 200 { "_id": "507f1f77bcf86cd799439011", "email": "user@example.com", ... }
   * 
   * @example
   * // Not found
   * // Response: 404 { "message": "Document not found" }
   * 
   * @example
   * // Invalid ObjectId
   * // Response: 404 { "message": "Error getting document by ID: Cast error..." }
   */
  async read(req, res) {
    try {
      /**
       * Retrieve document by ID using DAO.
       */
      const item = await this.dao.read(req.params.id);
      
      /**
       * Return found document.
       */
      res.status(200).json(item);
    } catch (error) {
      /**
       * Handle not found and other errors.
       */
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Update an existing document by ID with new data.
   * Validates the update data before applying changes.
   * 
   * @async
   * @method update
   * @param {import('express').Request} req - Express request object with `req.params.id` and update data in `req.body`
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends status 200 with the updated document, or 400 on validation error
   * @description Updates existing resource with validation
   * 
   * @example
   * // PUT /api/users/507f1f77bcf86cd799439011
   * // Request body: { "name": "Jane Doe", "age": 30 }
   * // Response: 200 { "_id": "507f1f77bcf86cd799439011", "name": "Jane Doe", "age": 30, "updatedAt": "..." }
   * 
   * @example
   * // Validation error
   * // Response: 400 { "message": "Validation failed: email format is invalid" }
   * 
   * @example
   * // Not found
   * // Response: 400 { "message": "Document not found" }
   */
  async update(req, res) {
    try {
      /**
       * Update document using DAO with validation.
       */
      const item = await this.dao.update(req.params.id, req.body);
      
      /**
       * Return updated document.
       */
      res.status(200).json(item);
    } catch (error) {
      /**
       * Handle validation and not found errors.
       */
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete a document by its unique identifier.
   * Permanently removes the resource from the database.
   * 
   * @async
   * @method delete
   * @param {import('express').Request} req - Express request object with `req.params.id`
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends status 200 with the deleted document, or 404 if not found
   * @description Permanently removes resource from database
   * 
   * @example
   * // DELETE /api/users/507f1f77bcf86cd799439011
   * // Response: 200 { "_id": "507f1f77bcf86cd799439011", "email": "deleted@example.com", ... }
   * 
   * @example
   * // Not found
   * // Response: 404 { "message": "Document not found" }
   * 
   * @example
   * // Database error
   * // Response: 404 { "message": "Error deleting document by ID: ..." }
   */
  async delete(req, res) {
    try {
      /**
       * Delete document using DAO.
       */
      const item = await this.dao.delete(req.params.id);
      
      /**
       * Return deleted document for confirmation.
       */
      res.status(200).json(item);
    } catch (error) {
      /**
       * Handle not found and database errors.
       */
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Retrieve all documents, optionally filtered by query parameters.
   * Supports MongoDB query syntax for flexible filtering.
   * 
   * @async
   * @method getAll
   * @param {import('express').Request} req - Express request object (filters in `req.query`)
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends status 200 with the array of documents, or 400 on error
   * @description Retrieves multiple resources with optional filtering
   * 
   * @example
   * // GET /api/users
   * // Response: 200 [{ "_id": "...", "email": "user1@example.com" }, { "_id": "...", "email": "user2@example.com" }]
   * 
   * @example
   * // GET /api/users?isLocked=false&age[gte]=18
   * // Response: 200 [{ ... filtered users ... }]
   * 
   * @example
   * // GET /api/tasks?user_email=user@example.com
   * // Response: 200 [{ ... user's tasks ... }]
   * 
   * @example
   * // Database error
   * // Response: 400 { "message": "Error getting documents: ..." }
   */
  async getAll(req, res) {
    try {
      /**
       * Retrieve all documents with optional filtering.
       * Query parameters are passed directly to DAO.
       */
      const items = await this.dao.getAll(req.query);
      
      /**
       * Return array of documents.
       */
      res.status(200).json(items);
    } catch (error) {
      /**
       * Handle database and query errors.
       */
      res.status(400).json({ message: error.message });
    }
  }
}

/**
 * Export the GlobalController class for extension by specific controllers.
 * @type {GlobalController}
 * @description Base controller class for inheritance
 */
module.exports = GlobalController;
