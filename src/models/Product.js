import mongoose from "mongoose";
import Category from "./Category.js";
// import Product from "./Product";

const productSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.ObjectId,
      ref: Category,
      require: true,
    },
    name: {
      type: String,
      trim: true,
      unique: true,
      require: true,
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
      thanhPhan: { type: String, default: "" }, // Thành phần
      kichThuoc: { type: String, default: "" }, // Kích thước / trọng lượng
      baoQuan: { type: String, default: "" }, // Cách bảo quản
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
