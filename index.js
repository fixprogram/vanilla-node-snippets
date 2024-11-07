import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import router from "./router/index.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import authMiddleware from "./middlewares/authMiddleware.js";

dotenv.config();

const PORT = process.env.PORT ?? 8080;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/api", router);
app.use(errorMiddleware);
app.use(authMiddleware);

async function start() {
  try {
    await mongoose.connect(process.env.DB_URL);
    app.listen(PORT, () => console.log(`Server is listening http://localhost:${PORT}`));
  } catch (err) {
    console.error(err);
  }
}

start();

const start = Date.now();
