import { Invoice } from "../models/invoice.model";
import { createError } from "../utils/error";

export const getAllInvoices = async (req, res, next) => {
    try {
      const invoices = await Invoice.find(); 
      return res.status(200).json(invoices);
    } catch (err) {
      next(err);
    }
  };
  

export const getInvoiceById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findById(id); 
  
      if (!invoice) {
        return next(createError(404, "Invoice not found"));
      }
  
      return res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  };
  


export const updateInvoiceStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, assignedTo, note } = req.body;
  
      // Ensure the status is valid
      const validStatuses = ["pending", "approved", "rejected", "reassigned"];
      if (!validStatuses.includes(status)) {
        return next(createError(400, "Invalid status"));
      }

      const invoice = await Invoice.findById(id);
  
      if (!invoice) {
        return next(createError(404, "Invoice not found"));
      }
  
      // Update the invoice status
      invoice.status = status;
      invoice.assignedTo = assignedTo || invoice.assignedTo;
      invoice.logs.push({
        action: status, 
        user: req.user._id, 
        note: note || "Status updated",
      });
  
    
      const updatedInvoice = await invoice.save();
  
      return res.status(200).json({
        message: "Invoice status updated successfully",
        invoice: updatedInvoice,
      });
    } catch (err) {
      next(err);
    }
  };
  

export const getInvoicesByUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
  
      const invoices = await Invoice.find({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      });
  
      if (!invoices || invoices.length === 0) {
        return next(createError(404, "No invoices found for this user"));
      }
  
      return res.status(200).json(invoices);
    } catch (err) {
      next(err);
    }
  };
  