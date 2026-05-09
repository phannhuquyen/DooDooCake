import express from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} from "../controllers/categoriesControllers.js"; ///api/categories

const router = express.Router();

router.get("/", getAllCategories);

router.post("/", createCategory);

router.put("/:id", updateCategory);

router.delete("/:id", deleteCategory);

router.get("/:categoryId/products", getProductsByCategory);

export default router;
