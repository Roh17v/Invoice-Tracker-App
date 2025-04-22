import { Router } from "express";
import { isAdmin } from "../middlewares/checkadmin";

const adminRouter = Router();

// Create an invoice (Admin can create invoices as well)
adminRouter.post(
  "/invoices",
  validateToken,
  upload.single("file"),
  createInvoice
);

// Get all invoices (Admin only)
adminRouter.get("/invoices", isAdmin, getAllInvoices);

// Get invoice by ID (Admin only)
adminRouter.get("/invoices/:id", isAdmin, getInvoiceById);

// Update invoice status (Approve/Reject/Reassign) (Admin only)
adminRouter.put("/invoices/:id/status", isAdmin, updateInvoiceStatus);

// Get invoices created or assigned to a specific user (Admin only)
adminRouter.get("/invoices/user/:userId", isAdmin, getInvoicesByUser);

export default adminRouter;
