import { expressjwt } from "express-jwt";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.JWT_SECRET);
export const requireUser = (req, res, next) => {
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  })(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .send({ message: "You are not authorized to access" });
    }
    // Check the role
    if (req.user.role === "user") {
      next()
    } else {
      return res.status(400).json({
        error: "Forbidden",
      });
    }
  });
};

export const requireAdmin = [
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    requestProperty: "auth",
  }),
  (req, res, next) => {
    try {
      if (req.auth && req.auth.role === "admin") {
        req.user = req.auth;
        next();
      } else {
        return res.status(403).json({ error: "Access denied. Admins only." });
      }
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Token verification failed." });
    }
  },
];
