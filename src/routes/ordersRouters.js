import express from "express";
import {
  getAllOrders,
  createOrder,
  getOrdersByUser,
  updateOrder,
  getOrderById,
} from "../controllers/ordersControllers.js";

const router = express.Router();

// Tạo đơn hàng
router.post("/", createOrder);

// Lấy đơn hàng theo user
router.get("/users/:userId", getOrdersByUser);

// Admin lấy tất cả đơn hàng
router.get("/", getAllOrders);

//cap nhat don hang
router.put("/:id", updateOrder);

//lấy đơn hàng bởi id
router.get("/:id",getOrderById)

export default router;
