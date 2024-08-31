import { Router } from "express";
import { register, verifyEmail } from "../controllers/user.controllers";

const router = Router();

router.route("/register").post(register);
router.route("/verify-email").post(verifyEmail);

export default router;
