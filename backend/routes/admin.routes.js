import { Router } from "express";
import { isAdmin } from "../middlewares/checkadmin.js";
import {
  createInvoiceAdmin,
  createUser,
  deleteUser,
  getAllInvoicesAdmin,
  getAllUsers,
  getInvoiceByIdAdmin,
  getInvoicesByUserAdmin,
  getInvoiceStatsAdmin,
  getRecentActivityAdmin,
  updateInvoiceStatusAdmin,
} from "../controllers/admin.controller.js";
import upload from "../utils/multerconfig.js";

const adminRouter = Router();

adminRouter.get("/users", isAdmin, getAllUsers); // Get all users
adminRouter.post("/users", isAdmin, createUser); // Create a new user
adminRouter.delete("/users/:id", isAdmin, deleteUser); // Delete user by ID

// Invoice Management Routes
adminRouter.post("/invoices", isAdmin, upload.single("file"), createInvoiceAdmin); // Create invoice with file upload
adminRouter.get("/invoices", isAdmin, getAllInvoicesAdmin); // Get all invoices
adminRouter.get("/invoices/:id", isAdmin, getInvoiceByIdAdmin); // Get invoice by ID
adminRouter.put("/invoices/:id/status", isAdmin, updateInvoiceStatusAdmin); // Update invoice status by ID
adminRouter.get("/invoices/user/:userId", isAdmin, getInvoicesByUserAdmin); // Get invoices by user ID

// Analytics and Activity Routes
adminRouter.get("/analytics/invoices/stats", isAdmin, getInvoiceStatsAdmin); // Get invoice statistics
adminRouter.get("/analytics/invoices/activity", isAdmin, getRecentActivityAdmin);


export default adminRouter;
