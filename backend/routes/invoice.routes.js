import { Router } from "express";

const invoiceRouter = Router();

invoiceRouter.post("/", createInvoice);

export default invoiceRouter;