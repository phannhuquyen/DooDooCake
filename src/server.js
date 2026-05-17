import express from "express";
import http from "http";
import { Server } from "socket.io";

import userRoute from "./routes/usersRouters.js";
import categoryRoute from "./routes/categoriesRouters.js";
import productRoute from "./routes/productsRouters.js";
import loginUserRoute from "./routes/loginUserRouters.js";
import orderRoute from "./routes/ordersRouters.js";
import statisticsRouter from "./routes/statisticsRouters.js";

import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// ======================
// middleware
// ======================

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: true,
  }),
);

// ======================
// routes
// ======================

app.use("/api/users", userRoute);

app.use("/api/categories", categoryRoute);

app.use("/api/products", productRoute);

app.use("/api/login", loginUserRoute);

app.use("/api/orders", orderRoute);

app.use("/api/statistics", statisticsRouter);

// ======================
// socket
// ======================

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ======================
// start server
// ======================

connectDB().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server bắt đầu trên ${PORT}`);
  });
});