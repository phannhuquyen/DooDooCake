import User from "../models/User.js";
// import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User khong ton tai!" });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    if (password !== user.password) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "SECRET_KEY_123", // đổi thành ENV
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("Loi login ", e);
    res.status(500).json({ message: "Lỗi he thong!!!" });
  }
};
