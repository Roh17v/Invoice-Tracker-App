import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import invoiceRouter from "./routes/invoice.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();
dotenv.config();

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/invoices", invoiceRouter);
app.get("/api/check-health", (req, res) => res.send("ok"));

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
