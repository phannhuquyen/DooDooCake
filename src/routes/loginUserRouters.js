import express from "express"
import { loginUser } from "../controllers/loginUserControllers.js"

const router = express.Router();
router.post("/",loginUser);
export default router;  