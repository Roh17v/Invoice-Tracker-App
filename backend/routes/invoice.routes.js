import { Router } from "express";
import { createInvoice } from "../controllers/invoice.controller.js";
import { validateToken } from "../middlewares/checkuser.js";
import upload from "../utils/multerconfig.js";

const invoiceRouter = Router();

invoiceRouter.post("/", validateToken, upload.single("file"), createInvoice);

export default invoiceRouter;
