import prisma from "../../prisma/middleware.js";
import asyncHandler from "../middleware/asyncHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export const loginUser = asyncHandler(async (req, res) => {
  const {
    email,
    password
  } = req.body;

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  // Check if user exists and password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "20d",
      }
    );
    res.cookie("jwt", token, {
      expire: Date.now() + 99999
    });

    // Respond with user details
    res.status(200).json({
      token: token,
      userInfo: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findMany();
  res.status(200).json(user);
});

export const logOut = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");
  res.json({
    message: "signout success",
  });
});