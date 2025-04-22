import { Router } from "express";
import { isAdmin } from "../middlewares/checkadmin.js";
import { createInvoiceAdmin, getAllInvoicesAdmin, getInvoiceByIdAdmin, getInvoicesByUserAdmin, updateInvoiceStatusAdmin } from "../controllers/admin.controller.js";
import upload from "../utils/multerconfig.js";


const adminRouter = Router();

// Create an invoice (Admin)
adminRouter.post(
  "/invoices",
  isAdmin,
  upload.single("file"),
  createInvoiceAdmin
);


// Get all invoices (Admin only)
adminRouter.get("/invoices", isAdmin, getAllInvoicesAdmin);

// Get invoice by ID (Admin only)
adminRouter.get("/invoices/:id", isAdmin, getInvoiceByIdAdmin);

// Update invoice status (Approve/Reject/Reassign) (Admin only)
adminRouter.put("/invoices/:id/status", isAdmin, updateInvoiceStatusAdmin);

// Get invoices created or assigned to a specific user (Admin only)
adminRouter.get("/invoices/user/:userId", isAdmin, getInvoicesByUserAdmin);

export default adminRouter;
