import { Router } from "express";
import {
  createInvoice,
  getInvoiceById,
  updateInvoiceStatus,
} from "../controllers/invoice.controller.js";
import { validateToken } from "../middlewares/checkuser.js";
import upload from "../utils/multerconfig.js";

const invoiceRouter = Router();

//create invoice
invoiceRouter.post("/", validateToken, upload.single("file"), createInvoice);

//update invoice status
invoiceRouter.put("/:id", validateToken, updateInvoiceStatus);

//get invoice by id
invoiceRouter.get("/:id", validateToken, getInvoiceById);

export default invoiceRouter;
