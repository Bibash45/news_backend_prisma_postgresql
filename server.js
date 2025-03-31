import prisma from "./prisma/middleware.js"
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./server/config/db.js";
import {
  notFound,
  errorHandler
} from "./server/middleware/errorMiddleware.js";
import newsRoutes from "./server/routes/newsRoutes.js";
import userRoute from "./server/routes/userRoute.js";
import categoryRoute from "./server/routes/categoryRoutes.js";

// port
const port = process.env.PORT;

const app = express();
// morgan
app.use(morgan("dev"));

// cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
// morgan
app.use(morgan("dev"));

// routes
app.use("/api/user", userRoute);
app.use("/api/news", newsRoutes);
app.use("/api/category", categoryRoute);

const __dirname = path.resolve(); // set __dirname to current directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// FOR PRODUCTION
if (process.env.NODE_ENV == "production") {
  //set static folder
  app.use(express.static(path.join(__dirname, "/client/build")));

  // any route that is not api will be redirected to index.html
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

// middleware for error handling
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("1. Database connected successfully!");

    app.listen(port, () => {
      console.log(`2. Server is running on PORT ${port}`);
    });
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

startServer();