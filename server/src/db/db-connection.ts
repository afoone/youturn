// src/db/dbConnection.ts

import mongoose from "mongoose";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// URL de conexión a MongoDB usando variables de entorno
const mongoUser = process.env.MONGO_USER || 'app';
const mongoPassword = process.env.MONGO_PASSWORD || '07QLeXU25bgfrmRiqBrh';
const mongoHost = process.env.MONGO_HOST || 'iprocuratio.com';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDatabase = process.env.MONGO_DATABASE || 'yourturn';
const mongoAuthSource = process.env.MONGO_AUTH_SOURCE || 'yourturn';

const mongoUri = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}?authSource=${mongoAuthSource}`;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully", mongoUri);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Salir si no puede conectar
  }
};
