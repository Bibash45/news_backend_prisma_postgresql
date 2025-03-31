import express from "express";
import { loginUser, getUser, logOut } from "./../controllers/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logOut);
router.get("/", getUser);

export default router;
