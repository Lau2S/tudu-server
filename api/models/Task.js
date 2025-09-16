/**
 * @fileoverview Task model definition for MongoDB using Mongoose.
 * Defines the schema structure for task documents in the database.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * Task schema definition for MongoDB collection.
 * Represents application tasks with user association, content, and status tracking.
 *
 * @type {mongoose.Schema}
 * @description Defines the structure for task documents with validation rules
 * @example
 * // Example task document:
 * {
 *   user_email: "user@example.com",
 *   title: "Complete project documentation",
 *   detail: "Write comprehensive JSDoc for all modules",
 *   state: "Por Hacer",
 *   date: "2025-01-15T10:30:00.000Z",
 *   createdAt: "2025-01-10T08:00:00.000Z",
 *   updatedAt: "2025-01-12T14:30:00.000Z"
 * }
 */
const TaskSchema = new mongoose.Schema(
  {
    /**
     * Reference to the user who owns this task.
     * Uses email as foreign key reference to User model.
     * @type {String}
     * @required
     * @ref User
     * @example "user@example.com"
     */
    //user_email: { type: String, ref: "User", required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Task title or name.
     * Brief description of what needs to be done.
     * @type {String}
     * @required
     * @maxlength 50
     * @example "Review pull request"
     */
    title: { type: String, required: true, maxlength: 50 },

    /**
     * Detailed description of the task.
     * Optional field for additional context or instructions.
     * @type {String}
     * @optional
     * @maxlength 500
     * @example "Review the changes in PR #123, check for code quality and test coverage"
     */
    detail: { type: String, maxlength: 500 },

    /**
     * Current state/status of the task.
     * Represents the workflow stage of the task.
     * @type {String}
     * @enum {String} ["Por Hacer", "Haciendo", "Hecho"]
     * @default "Por Hacer"
     * @example "Haciendo"
     */
    state: {
      type: String,
      enum: ["Por Hacer", "Haciendo", "Hecho"],
      default: "Por Hacer",
    },

    /**
     * Due date for the task completion.
     * When the task should be completed.
     * @type {Date}
     * @required
     * @example "2025-01-15T10:30:00.000Z"
     */
    date: { type: Date, required: true },
  },
  {
    /**
     * Mongoose schema options.
     * Automatically adds `createdAt` and `updatedAt` timestamp fields.
     * @type {Object}
     * @property {boolean} timestamps - Enables automatic timestamp fields
     */
    timestamps: true,
  }
);

/**
 * Mongoose model for the Task collection.
 * Provides an interface to interact with task documents in MongoDB.
 * Inherits all Mongoose model methods for CRUD operations.
 *
 * @type {mongoose.Model<TaskSchema>}
 * @description Main model export for Task operations
 * @example
 * // Create a new task
 * const task = new Task({
 *   user_email: "user@example.com",
 *   title: "New task",
 *   detail: "Task description",
 *   date: new Date()
 * });
 * await task.save();
 *
 * @example
 * // Find tasks by user
 * const userTasks = await Task.find({ user_email: "user@example.com" });
 */
module.exports = mongoose.model("Task", TaskSchema);
