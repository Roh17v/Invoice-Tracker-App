import express from "express"
import dotenv from "dotenv"
import connectDB from "./src/db/index.js";

const app = express();
dotenv.config();

const startServer = async () => {
    try {
      await connectDB();
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT}`);
      });
    } catch (err) {
      console.error("Error during server startup:", err);
      process.exit(1);
    }
  };
  
  startServer();
  
