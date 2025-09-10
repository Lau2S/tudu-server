const mongoose = require("mongoose");

/**
<<<<<<< HEAD
 * User schema definition.
 * 
 * Represents application users stored in MongoDB.
 * Includes authentication fields and automatic timestamps.
 */
    const TaskSchema = new mongoose.Schema(
        {
            user_email : { type: String, ref: 'User', required: true },
            title: { type: String, required: true },
            detail: { type: String },
            state: { type: String, default: "Pendiente..." },
        },
        {
            /**
             * Adds `createdAt` and `updatedAt` timestamp fields automatically.
             */
            timestamps: true
        }
    );

    /**
     * Mongoose model for the User collection.
     * Provides an interface to interact with user documents.
     */
    module.exports = mongoose.model("Task", TaskSchema);
=======
 * Task schema definition.
 *
 * Represents application tasks stored in MongoDB.
 */
const TaskSchema = new mongoose.Schema(
  {
    user_email: { type: String, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 50 },
    detail: { type: String, maxlength: 500 },
    state: {
      type: String,
      enum: ["Por Hacer", "Haciendo", "Hecho"],
      default: "Por Hacer",
    },
    date: { type: Date, required: true },
  },
  {
    /**
     * Adds `createdAt` and `updatedAt` timestamp fields automatically.
     */
    timestamps: true,
  }
);

/**
 * Mongoose model for the Task collection.
 * Provides an interface to interact with task documents.
 */
module.exports = mongoose.model("Task", TaskSchema);
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
