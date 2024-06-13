//Importing express to access Router
import express from "express";

//Importing all necessary controller methods
import {
  forgotPassword,
  getUserHome,
  loginUser,
  registerUser,
  resetPassword,
  serverConnect,
} from "../Controllers/user_controller.js";
//Authentication for reset password
import { resetAuthMiddleware } from "../Middlewares/reset_password_auth_middleware.js";
//Authentication for user routings
import { userAuthMiddleware } from "../Middlewares/user_auth_middleware.js";

//creating router
const router = express.Router();

//basic endpoint for server connection
router.get("/", serverConnect);

//all login and logout endpoints
router.post("/register-user", registerUser);
router.post("/login-user", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetAuthMiddleware, resetPassword);
router.get("/user-data", userAuthMiddleware, getUserHome);

//exporting the router
export default router;
