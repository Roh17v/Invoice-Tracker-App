import { Router } from "express";
import {
  loginUser,
  logout,
  signupUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signupUser);

authRouter.post("/login", loginUser);

authRouter.post("/logout", logout);

export default authRouter;
