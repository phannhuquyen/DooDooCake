import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getWishlist,
  toggleWishlist,
  getCartByUser,
  createCartItem,
  deleteCartItem,
} from "../controllers/usersControllers.js";

const router = express.Router();

router.get("/", getAllUsers);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

router.get("/profile/:userId", getUserById);
//xong yeu thich
router.post("/wishlist/toggle", toggleWishlist);

router.post("/wishlist", getWishlist);
//giỏ hàng
router.get("/:userId/cart", getCartByUser);

router.post("/:userId/cart", createCartItem);

router.delete("/:userId/cart/:productId", deleteCartItem);

export default router;
