import express from "express";
import {
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";
// import { requireAdmin } from "../middleware/authMiddleware.js";
// import { requireUser } from "./../middleware/authMiddleware.js";

const router = express.Router();

router
    .route("/")
    .post(createCategory).get(getCategory)

router.route("/:id").put(updateCategory).delete(deleteCategory)



export default router;