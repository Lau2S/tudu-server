const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Script temporal para limpiar todos los datos de la base de datos
 * ⚠️ USAR SOLO EN DESARROLLO - BORRA TODOS LOS DATOS
 */
const clearDatabase = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Conectado a MongoDB para limpieza...");

    // Obtener todas las colecciones
    const collections = await mongoose.connection.db.collections();

    // Borrar cada colección
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`Colección ${collection.collectionName} limpiada`);
    }

    console.log("✅ Base de datos completamente limpiada");

    // Desconectar
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  } catch (error) {
    console.error("Error limpiando la base de datos:", error);
    process.exit(1);
  }
};

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  clearDatabase();
}
