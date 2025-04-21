import { Router } from "express";
import { loginUser, signupUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signupUser);

authRouter.post("/login", loginUser);

export default authRouter;
