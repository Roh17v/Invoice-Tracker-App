import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import invoiceRouter from "./routes/invoice.routes.js";
import adminRouter from "./routes/admin.routes.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/users", userRouter);
app.get("/api/check-health", (req, res) => res.send("ok"));

//middleware to server static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Error Handler
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something Went Wrong!";
  if (err)
    return res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      message: errorMessage,
      stack: err.stack,
    });
  next();
});

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
