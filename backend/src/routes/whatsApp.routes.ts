import { Router } from "express";
import { pairingRoute } from "../controllers/whatsApp.controllers";

const router = Router();

router.route("/pairing-code").post(pairingRoute);

export default router;
