import { Router } from "express";
import { validateToken } from "../middlewares/checkuser.js";
import { getAllUsers } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/", validateToken, getAllUsers);

export default userRouter;
