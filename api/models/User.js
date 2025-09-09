const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User schema definition for the MongoDB collection.
 * Sin middleware pre('save') problemático - el hash se hace en el controlador
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [100, "Username cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    age: {
      type: Number,
      min: [13, "Age must be at least 13"],
      max: [120, "Age cannot exceed 120"],
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Instance method to validate a given password against the stored hashed password.
 */
userSchema.methods.validatePassword = async function (candidatePassword) {
  console.log("Validando contraseña...");
  console.log("Contraseña candidata:", candidatePassword.substring(0, 3) + "...");
  console.log("Contraseña almacenada:", this.password.substring(0, 15) + "...");

  const isValid = await bcrypt.compare(candidatePassword, this.password);
  console.log("Resultado validación:", isValid);
  return isValid;
};

/**
 * Virtual property to get the user's full name.
 */
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.username;
});

/**
 * Custom toJSON method to exclude sensitive information.
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

/**
 * Static method to find a user by email.
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Admin key middleware for sensitive operations.
 */
const adminKey = (req, res, next) => {
  const { adminKey } = req.headers;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid admin key" });
  }
  next();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.adminKey = adminKey;