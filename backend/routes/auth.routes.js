import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", signup);

export default authRouter;