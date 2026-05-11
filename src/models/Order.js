import mongoose from "mongoose";
import Product from "./Product.js";
import User from "./User.js";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    // required: true,
  },
  images: {
    type: [String], // mảng link ảnh
    default: [],
  },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, default: 0 }, // lưu giá tại thời điểm đặt
});

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String }, // Khai báo _id là String thay vì ObjectId
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    name: {
      // name người dùng đặt hàng -> ở dưới tương tự
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    items: [orderItemSchema], // danh sách sản phẩm trong đơn hàng

    totalPrice: { type: Number, required: true, default: 0 },

    fee: { type: Number, default: 0 },

    promotion: { type: Number, default: 0 }, // khuyến mại

    paymentMethod: {
      type: String,
      enum: ["COD", "BankTransfer", "MoMo"], // Ví dụ các phương thức
      default: "COD", // MẶC ĐỊNH LÀ THANH TOÁN KHI NHẬN HÀNG (COD)
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

// {-------> thay userId và productId để nhận biết
//   userId,
//   items:[
//     {
//       productId,
//       quantity,
//       price
//     },
//   ],
//   totalPrice,
//   status: 1 trong ["Đang chờ xử lý","Đã xác nhận","Đang giao","Đã hoàn thành","Đã hủy"]
// }

// cần trường address, phone, email-->> vội lấy giá trị mặc định
