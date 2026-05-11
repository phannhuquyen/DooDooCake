import User from "../models/User.js";
import Product from "../models/Product.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); //desc >< asc

    res.status(200).json(users);
  } catch (error) {
    console.error("Loi kho call getAllUsers", error);
    res.status(500).json({ message: "Lỗi hệ thống !!!" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, name, email, phone, address, password, role } = req.body;

    // check username
    const hasUsername = await User.findOne({
      username,
    });

    if (hasUsername) {
      return res.status(409).json({
        message: "Tên đăng nhập đã tồn tại",
      });
    }

    // check admin
    if (role === "admin") {
      const hasAdmin = await User.findOne({
        role: "admin",
      });

      if (hasAdmin) {
        return res.status(409).json({
          message: "Đã có admin rồi",
        });
      }
    }

    const user = new User({
      username,
      name,
      email,
      phone,
      address,
      password,
      role,
    });

    const newUser = await user.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Lỗi khi call createUser", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      // password,
      role,
      address,
    } = req.body;

    const currentUser = await User.findById(req.params.id);

    if (!currentUser) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    // check password cũ
    // if (
    //   password &&
    //   password === currentUser.password
    // ) {
    //   return res.status(409).json({
    //     message:
    //       "Mật khẩu mới không được trùng mật khẩu cũ",
    //   });
    // }

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        // password,
        role,
        address,
      },
      { new: true },
    );

    res.status(200).json(updateUser);
  } catch (error) {
    console.error("Lỗi khi call updateUser", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const currentUser = await User.findById(req.params.id);

    if (!currentUser) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    // check mật khẩu cũ
    if (oldPassword !== currentUser.password) {
      return res.status(409).json({
        message: "Mật khẩu cũ không chính xác",
      });
    }

    // check trùng password cũ
    if (newPassword === currentUser.password) {
      return res.status(409).json({
        message: "Mật khẩu mới không được trùng mật khẩu cũ",
      });
    }

    currentUser.password = newPassword;

    await currentUser.save();

    res.status(200).json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi update password", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);

    if (!deleteUser) {
      return res.status(404).json({ message: "Khong ton tai User" });
    }

    res.status(200).json(deleteUser);
  } catch (error) {
    console.error("Loi kho call deleteUser", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ->>> update profile là update user:)))

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu ID người dùng (userId)." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin User theo ID:", error);
    // Kiểm tra lỗi ObjectId không hợp lệ (Mongoose cast error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "ID người dùng không hợp lệ." });
    }
    res
      .status(500)
      .json({ message: "Lỗi hệ thống khi lấy thông tin người dùng." });
  }
};

// them, xoa wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body; //su dung 2 bien
    if (!userId) {
      return res.status(401).json({ message: "Thiếu ID người dùng (userId)." });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const productIndex = user.wishlist.findIndex(
      (item) => item.equals(productId), // Sử dụng .equals() để so sánh ObjectId
    );

    let action;
    if (productIndex > -1) {
      user.wishlist.splice(productIndex, 1);
      action = "removed";
    } else {
      user.wishlist.push(productId);
      action = "added";
    }

    await user.save();
    res.status(200).json({
      message: `Sản phẩm đã được ${action} khỏi danh sách yêu thích.`,
      wishlist: user.wishlist,
      action: action, // Trả về hành động để frontend biết đã thêm hay xóa
    });
  } catch (error) {
    console.error("Lỗi xử lý toggle wishlist:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật wishlist." });
  }
};

/**
 * Lấy danh sách Wishlist của người dùng (Sử dụng POST để lấy userId từ body).
 */
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Thiếu ID người dùng (userId)." });
    }

    const user = await User.findById(userId)
      .select("wishlist") // Chỉ chọn trường wishlist
      .populate({
        path: "wishlist",
        select: "name price images description _id",
      });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    } // Trả về danh sách sản phẩm trong wishlist

    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error("Lỗi lấy wishlist:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi lấy wishlist." });
  }
};

//lấy giỏ hàng by userid
export const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
      path: "cart.productId",
      select: "name images",
    });

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Trả về danh sách phẳng theo yêu cầu của bạn
    const cartItems = user.cart
      .map((item) => {
        if (!item.productId) return null;
        return {
          _id: item._id, // ID của dòng trong giỏ hàng
          productId: item.productId._id,
          name: item.productId.name,
          image: item.productId.images?.[0] || "", // Lấy ảnh đầu tiên
          quantity: item.quantity,
          price: item.price, // Giá đơn lẻ
          totalPrice: item.price * item.quantity, // Tổng tiền món này
          selected: item.selected,
        };
      })
      .filter(Boolean);

    return res.status(200).json(cartItems);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//thêm bớt quantity vao giỏ hàng
export const createCartItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId),
    ]);

    if (!user || !product)
      return res.status(404).json({ message: "Dữ liệu không hợp lệ" });

    const existingIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (existingIndex > -1) {
      // Nếu đã có, cộng dồn số lượng và cập nhật giá mới nhất
      user.cart[existingIndex].quantity += Number(quantity) || 1;
      user.cart[existingIndex].price = product.price;
    } else {
      // Nếu chưa có, thêm mới
      user.cart.push({
        productId,
        quantity: Number(quantity) || 1,
        price: product.price,
        selected: false,
      });
    }

    await user.save();
    // Sau khi lưu, gọi lại hàm lấy giỏ hàng hoặc trả về thông báo thành công
    return res.status(200).json({ message: "Cập nhật giỏ hàng thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//xóa cartitem
export const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { productId: productId } } },
      { new: true },
    );

    return res
      .status(200)
      .json({ message: "Đã xóa sản phẩm", cart: updatedUser.cart });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
