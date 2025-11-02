import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import apiRouter from "./routes/api.routes";
import { connectDB } from './db/db-connection';


// Load environment variables
dotenv.config()

connectDB();


const app = express()
const PORT = process.env.PORT || 3100

// Middleware
app.use(express.json())
app.use(cors())

app.use("/api", apiRouter);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
