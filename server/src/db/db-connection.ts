// src/db/dbConnection.ts

import mongoose from "mongoose";

// URL de conexión a MongoDB
const mongoUri = 'mongodb://rootuser:rootpassword@localhost:27017/mydb?authSource=admin';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Salir si no puede conectar
  }
};
