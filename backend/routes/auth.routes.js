import { Router } from "express";
import { loginUser, logout, sendUser } from "../controllers/auth.controller.js";
import { validateToken } from "../middlewares/checkuser.js";

const authRouter = Router();

authRouter.post("/login", loginUser);

authRouter.post("/logout", logout);

authRouter.get("/me", validateToken, sendUser);

export default authRouter;
