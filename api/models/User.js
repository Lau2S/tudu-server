/**
 * @fileoverview User model definition for MongoDB using Mongoose.
 * Includes authentication, validation, and password hashing functionality.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires mongoose
 * @requires validator
 * @requires bcryptjs
 */

const mongoose = require("mongoose");
const { isEmail, isStrongPassword } = require("validator");
const bcrypt = require("bcryptjs");

/**
 * Salt rounds for bcrypt password hashing.
 * Higher values increase security but also processing time.
 * @type {number}
 * @constant
 * @default 10
 */
const SALT_WORK_FACTOR = 10;

/**
 * User schema definition for MongoDB collection.
 * Represents application users with authentication and profile information.
 * Includes automatic password hashing and validation.
 * 
 * @type {mongoose.Schema}
 * @description Defines the structure for user documents with security features
 * @example
 * // Example user document:
 * {
 *   username: "john_doe",
 *   email: "john@example.com",
 *   firstName: "John",
 *   lastName: "Doe",
 *   age: 25,
 *   password: "$2a$10$hashedPasswordString",
 *   isLocked: false,
 *   createdAt: "2025-01-10T08:00:00.000Z",
 *   updatedAt: "2025-01-12T14:30:00.000Z"
 * }
 */

/**
 * Custom password validation function.
 * Validates password strength using regex pattern.
 * 
 * @function isValidPassword
 * @param {string} password - The password to validate
 * @returns {boolean} True if password meets requirements, false otherwise
 * @description Requires: 8+ chars, 1 lowercase, 1 uppercase, 1 number, 1 special char
 * @example
 * isValidPassword("Password123!"); // returns true
 * isValidPassword("weak"); // returns false
 */
isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
};

const UserSchema = new mongoose.Schema(
  {
    /**
     * Unique username for the user account.
     * Optional field for display purposes.
     * @type {String}
     * @optional
     * @example "john_doe"
     */
    username: { type: String },
    
    /**
     * User's password for authentication.
     * Automatically hashed before saving using bcrypt.
     * Must meet strong password requirements.
     * @type {String}
     * @required
     * @validation Custom validator for password strength
     * @example "MySecurePass123!"
     */
    password: {
      type: String,
      required: true,
      hash: true,
      validate: [isValidPassword, "Password not strong enough"],
    },

    /**
     * User's first name.
     * Required for user identification and personalization.
     * @type {String}
     * @required
     * @example "John"
     */
    firstName: { type: String, required: true },

    /**
     * User's last name.
     * Required for user identification and personalization.
     * @type {String}
     * @required
     * @example "Doe"
     */
    lastName: { type: String, required: true },

    /**
     * User's email address.
     * Must be unique across all users and valid email format.
     * Used as primary identifier for authentication.
     * @type {String}
     * @required
     * @unique
     * @validation Email format validation
     * @example "john@example.com"
     */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [isEmail, "Invalid email"],
    },

    /**
     * User's age in years.
     * Optional field with minimum age requirement.
     * @type {Number}
     * @optional
     * @min 13
     * @example 25
     */
    age: { type: Number, min: 13 },

    /**
     * Token for password reset functionality.
     * Temporary token generated when user requests password reset.
     * @type {String}
     * @optional
     * @example "randomTokenString123"
     */
    resetPasswordToken: { type: String },
    
    /**
     * Expiration date for password reset token.
     * Token becomes invalid after this date.
     * @type {Date}
     * @optional
     * @example "2025-01-15T10:30:00.000Z"
     */
    resetPasswordExpires: { type: Date },

    /**
     * Account lock status for security purposes.
     * When true, user cannot login until unlocked by admin.
     * @type {Boolean}
     * @default false
     * @example false
     */
    isLocked: { type: Boolean, default: false },
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
 * Pre-save middleware for password hashing.
 * Automatically hashes the password before saving to database.
 * Only runs when password field is modified.
 * 
 * @memberof UserSchema
 * @function pre
 * @param {string} event - The mongoose event ('save')
 * @param {Function} next - Callback to continue middleware chain
 * @description Uses bcrypt with salt factor of 10 for secure hashing
 * @example
 * // Automatically called when saving user:
 * const user = new User({ email: "test@test.com", password: "plaintext" });
 * await user.save(); // password is now hashed
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

/**
 * Instance method to validate password against stored hash.
 * Compares plain text password with hashed password in database.
 * 
 * @memberof UserSchema
 * @method validatePassword
 * @param {string} data - Plain text password to validate
 * @returns {Promise<boolean>} True if password matches, false otherwise
 * @async
 * @example
 * const user = await User.findOne({ email: "test@test.com" });
 * const isValid = await user.validatePassword("plainTextPassword");
 * if (isValid) {
 *   // Login successful
 * }
 */
UserSchema.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password);
};

/**
 * Middleware function to verify admin access key.
 * Checks if request contains valid admin key in headers.
 * Used to protect admin-only routes.
 * 
 * @function adminKey
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 * @returns {Object} 403 response if unauthorized, calls next() if authorized
 * @description Validates x-admin-key header against environment variable
 * @example
 * // Usage in routes:
 * router.get('/admin/users', adminKey, getUsersController);
 */
function adminKey(req, res, next) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

/**
 * Mongoose model for the User collection.
 * Provides an interface to interact with user documents in MongoDB.
 * Includes all Mongoose model methods plus custom instance methods.
 * 
 * @type {mongoose.Model<UserSchema>}
 * @description Main model export for User operations with authentication
 * @example
 * // Create a new user
 * const user = new User({
 *   email: "user@example.com",
 *   password: "SecurePass123!",
 *   firstName: "John",
 *   lastName: "Doe"
 * });
 * await user.save(); // password automatically hashed
 * 
 * @example
 * // Find user and validate password
 * const user = await User.findOne({ email: "user@example.com" });
 * const isValidPassword = await user.validatePassword("inputPassword");
 */
module.exports = mongoose.model("User", UserSchema);

/**
 * Admin middleware function export.
 * Used to protect admin-only routes with access key validation.
 * @type {Function}
 * @see adminKey
 */
module.exports.adminKey = adminKey;
