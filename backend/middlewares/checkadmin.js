import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export async function isAdmin(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) {
    return next(createError(401, "Access Denied. You are not authenticated."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return next(createError(403, "Access Denied. You are not an Admin."));
    }

    next();
  } catch (error) {
    next(createError(400, "Invalid Token."));
  }
}
