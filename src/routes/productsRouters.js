import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getFeaturedProducts,
} from "../controllers/productsControllers.js";

const router = express.Router();

router.get("/", getAllProducts);

router.get("/featured", getFeaturedProducts);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

router.get("/:id", getProductById);

export default router;
