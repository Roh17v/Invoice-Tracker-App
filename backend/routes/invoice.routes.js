import { Router } from "express";
import { createInvoice } from "../controllers/invoice.controller.js";
import { validateToken } from "../middlewares/checkuser.js";

const invoiceRouter = Router();

invoiceRouter.post("/", validateToken ,createInvoice);

export default invoiceRouter;