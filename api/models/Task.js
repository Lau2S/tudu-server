const mongoose = require("mongoose");

/**
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