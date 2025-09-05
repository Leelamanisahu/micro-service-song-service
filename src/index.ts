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
    // Add connection timeout and keep alive
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      if (retries >= 10) {
        console.log("Redis reconnection attempts exceeded, giving up");
        return new Error("Redis reconnection failed");
      }
      console.log(`Redis reconnection attempt ${retries + 1}`);
      return Math.min(retries * 100, 3000);
    },
  },
});

// Add comprehensive error handling
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
  // Don't exit the process, just log the error
});

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("ready", () => {
  console.log("Redis client ready to use");
});

redisClient.on("end", () => {
  console.log("Redis client disconnected");
});

redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting...");
});

// Connect to Redis with better error handling
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    console.log("Application will continue without Redis caching");
  }
}

// Initialize Redis connection
connectRedis();

app.use("/api/v1", songRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
