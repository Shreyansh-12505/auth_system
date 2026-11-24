import {register,login,logout,refresh,dashboard} from "../controller/auth.controller.js"
import verifyToken from "../middleware/auth.middleware.js";
import {Router} from "express";
const router = Router();

router.post("/register",register);
router.post("/login",login);
router.post("/logout",logout);
router.post("/refresh",refresh);
router.get("/dashboard",verifyToken,dashboard);

export default router



















