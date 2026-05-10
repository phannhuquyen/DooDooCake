import express from "express";

import userRoute from "./routes/usersRouters.js";
import categoryRoute from "./routes/categoriesRouters.js";
import productRoute from "./routes/productsRouters.js";
import loginUserRoute from "./routes/loginUserRouters.js";
import orderRoute from "./routes/ordersRouters.js";
//
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
//
dotenv.config();
const PORT = process.env.PORT || 5001 || 3000;
const app = express();
//

app.use(express.json());
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(
  cors({
    credentials: true,
    origin: true,
  }),
);

// app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/login", loginUserRoute);
app.use("/api/orders", orderRoute);

//
connectDB().then(() => {
  // ket noi thi moi hien
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`server batws dau tren ${PORT}`);
  });
});

// còn 1 vài API nữa:
// __thêm đơn hàng
