import mongoose from "mongoose";
import Category from "./Category.js";

const productSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: Category,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    images: {
      type: [String], // mảng link ảnh
      default: [],
    },
    price: {
      type: Number,
      default: 0,
    },
    stock: { type: Number, default: 0 }, //so luong ton kho
    sold: { type: Number, default: 0 },
    description: {
      type: String,
      default: "",
    },
    details: {
      thanhphan: { type: String, default: "" }, // Thành phần
      kichthuoc: { type: String, default: "" }, // Kích thước / trọng lượng
      baoquan: { type: String, default: "" }, // Cách bảo quản
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
