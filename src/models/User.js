import mongoose from "mongoose";
import Product from "./Product.js";
import Order from "./Order.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "0",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      require: true,
      default: "123",
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    // Customer only
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product,
      },
    ],
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Product,
          require: true,
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
      },
    ],
    orderList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Order,
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.wishlist = undefined;
    this.cart = undefined;
    this.orderList = undefined;
  }
  userSchema.pre("save", async function () {
    if (this.role === "admin") {
      const adminExists = await mongoose.models.User.findOne({ role: "admin" });

      if (adminExists && this.isNew) {
        throw new Error("Admin đã tồn tại, không thể tạo thêm.");
      }
    }
  });
});

const User = mongoose.model("User", userSchema);

export default User;
