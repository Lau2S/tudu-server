const mongoose = require("mongoose");

/**
 * User schema definition.
 * 
 * Represents application users stored in MongoDB.
 * Includes authentication fields and automatic timestamps.
 */
const UserSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        // Debe ser hasheado la contraseña
        age: { type: Number, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
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
module.exports = mongoose.model("User", UserSchema);
