import express from "express";
import dotenv from "dotenv";
import songRouter from "./routers/songRoute.js";
import redis from "redis";
import cors from "cors";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

export const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD as string,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 10003,
  },
});

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

app.use("/api/v1", songRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
