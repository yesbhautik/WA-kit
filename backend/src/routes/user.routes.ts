import { Router } from "express";
import { register } from "../controllers/user.controllers";

const router = Router();

router.route("/register").post(register);

export default router;
