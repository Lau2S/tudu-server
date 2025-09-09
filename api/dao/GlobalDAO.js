/**
 * Generic Data Access Object (DAO) class.
 *
 * Provides common database operations (CRUD) that can be extended
 * by specific DAO classes for different models.
 */
class GlobalDAO {
  /**
   * Create a new GlobalDAO instance.
   *
   * @param {mongoose.Model} model - The Mongoose model to operate on.
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document in the database.
   *
   * @async
   * @param {Object} data - The data to create the document with.
   * @returns {Promise<Object>} The created document.
   * @throws {Error} If creation fails.
   */
  async create(data) {
    try {
      console.log("=== GlobalDAO CREATE ===");
      console.log("Modelo:", this.model.modelName);
      console.log("Datos recibidos:", JSON.stringify(data, null, 2));

      // Crear nueva instancia del modelo
      const document = new this.model(data);
      console.log("Instancia creada, contraseña antes de save:", document.password ? "EXISTE" : "NO EXISTE");

      // Usar save() para que se ejecuten los middlewares pre('save')
      const savedDocument = await document.save();

      console.log("Documento guardado exitosamente");
      console.log("ID:", savedDocument._id);
      console.log("Contraseña después de save (primeros 10 chars):", savedDocument.password ? savedDocument.password.substring(0, 10) + "..." : "NO PASSWORD");

      return savedDocument;
    } catch (error) {
      console.error("Error en GlobalDAO.create:", error);
      throw error;
    }
  }

  /**
   * Find a document by its ID.
   *
   * @async
   * @param {string} id - The document ID.
   * @returns {Promise<Object|null>} The found document or null.
   * @throws {Error} If the query fails.
   */
  async read(id) {
    try {
      const document = await this.model.findById(id);
      if (!document) throw new Error("Document not found");
      return document;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update a document by its ID.
   *
   * @async
   * @param {string} id - The document ID.
   * @param {Object} updateData - The data to update the document with.
   * @returns {Promise<Object>} The updated document.
   * @throws {Error} If the update fails or document is not found.
   */
  async update(id, updateData) {
    try {
      const document = await this.model.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!document) throw new Error("Document not found");
      return document;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Delete a document by its ID.
   *
   * @async
   * @param {string} id - The document ID.
   * @returns {Promise<Object>} The deleted document.
   * @throws {Error} If the deletion fails or document is not found.
   */
  async delete(id) {
    try {
      const document = await this.model.findByIdAndDelete(id);
      if (!document) throw new Error("Document not found");
      return document;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Retrieve all documents from the collection.
   *
   * @async
   * @returns {Promise<Array>} An array of all documents.
   * @throws {Error} If the query fails.
   */
  async getAll() {
    try {
      return await this.model.find();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Find one document by query.
   *
   * @async
   * @param {Object} query - The query object.
   * @returns {Promise<Object|null>} The found document or null.
   */
  async findOne(query) {
    try {
      return await this.model.findOne(query);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Find and update one document.
   *
   * @async
   * @param {Object} query - The query object.
   * @param {Object} updateData - The data to update.
   * @param {Object} options - Query options.
   * @returns {Promise<Object|null>} The updated document or null.
   */
  async findOneAndUpdate(query, updateData, options = {}) {
    try {
      return await this.model.findOneAndUpdate(query, updateData, {
        new: true,
        runValidators: true,
        ...options,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = GlobalDAO;