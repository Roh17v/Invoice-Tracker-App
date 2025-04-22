import { Router } from "express";
import {
  createInvoice,
  getAllInvoicesForUser,
  getInvoiceById,
  getInvoicesByUser,
  getRecentActivity,
  updateInvoiceStatus,
} from "../controllers/invoice.controller.js";
import { validateToken } from "../middlewares/checkuser.js";
import upload from "../utils/multerconfig.js";

const invoiceRouter = Router();

//create invoice
invoiceRouter.post("/", validateToken, upload.single("file"), createInvoice);

//get user recent-activity
invoiceRouter.get("/recent-activity", validateToken, getRecentActivity);

// get invoices by user
invoiceRouter.get("/", validateToken, getInvoicesByUser);

//update invoice status
invoiceRouter.put("/:id", validateToken, updateInvoiceStatus);

//get invoice by id
invoiceRouter.get("/:id", validateToken, getInvoiceById);

// Get all invoices with optional filters
invoiceRouter.get("/", validateToken, getAllInvoicesForUser);


export default invoiceRouter;
