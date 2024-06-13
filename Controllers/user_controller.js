//importing user collection
import User from "../Models/user_schema.js";
//importing validator for email check
import validator from "validator";
//importing bcrypt for hash password
import bcrypt from "bcryptjs";
//importing JWT for to create token
import jwt from "jsonwebtoken";
//Importing dotenv to access environmental variables
import dotenv from "dotenv";
//Importing mail funtion to send mail
import { mail } from "../Services/nodemail.js";

//configuring .env file
dotenv.config();

//server connection method
export const serverConnect = async (req, res) => {
  try {
    //sending success response
    res
      .status(200)
      .json({ message: `Password Reset Server connected successfully!` });
  } catch (error) {
    //sending error response, if any error happened
    console.log(`Error in connecting server : ${error}`);
    res
      .status(500)
      .json({ error: `Failed to connect the server, Internal Server Error` });
  }
};

//user register method
export const registerUser = async (req, res) => {
  try {
    //getting user details from request body
    const { firstName, lastName, dateOfBirth, email, password } = req.body;

    //checking every value is given or not. if not returning error
    if (!firstName || !lastName || !dateOfBirth || !email || !password) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    //validating the email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address." });
    }

    //checking the email that already used
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          error:
            "An account with this email already exists. Please use a different email.",
        });
    }

    //hashing password
    const hashPassword = await bcrypt.hash(password, 10);
    // console.log(`Hash Password : ${hashPassword}`);

    //saving the new user to User collection
    const newUser = new User({
      firstName,
      lastName,
      email,
      dateOfBirth,
      password: hashPassword,
    });
    await newUser.save();

    //sending success response
    res
      .status(201)
      .json({ message: "You Registered Successfully!", userData: newUser });
  } catch (error) {
    //sending error response, if any error happened
    console.log(`Error while registering : ${error}`);
    res
      .status(500)
      .json({ error: `Registeration Failed, Internal Server Error` });
  }
};

//login user method
export const loginUser = async (req, res) => {
  try {
    //getting email & password from request body
    const { email, password } = req.body;

    //validating the email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address." });
    }

    //checking the user is a registered user
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "User Not Found!" });
    }

    //checking the password
    const checkPassword = await bcrypt.compare(password, user.password);

    //invalid password means, give error response
    if (!checkPassword) {
      return res.status(400).json({ error: "Invalid Password!" });
    }

    //creating token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    //sending success response
    res
      .status(200)
      .json({ message: "Login Successful!", token: token, expiresIn: 86400 });
  } catch (error) {
    //sending error response, if any error happened
    console.log(`Error while login : ${error}`);
    res.status(500).json({ error: `Login Failed, Internal Server Error` });
  }
};

//forgotpassword method
export const forgotPassword = async (req, res) => {
  try {
    //getting email from request body
    const { email } = req.body;

    //validating the email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Please provide a valid email address.",
        });
    }

    //checking the user is a registered user
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    //creating token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetPasswordUrl = `${process.env.FRONT_END_BASE_URL}/reset-password?token=${token}`;

    //sending the reset password link to user
    const mailSent = await mail(user.email, "Reset-Password", resetPasswordUrl);

    //mail sent success/error, send response
    if (mailSent) {
      return res
        .status(200)
        .json({
          success: true,
          message:
            "The password reset link has been sent to the provided email address.",
          token: token,
        });
    } else {
      throw new Error("Failed to send email.");
    }
  } catch (error) {
    //sending error response, if any error happened
    console.error(`Error in forgotPassword: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

//resetting password method
export const resetPassword = async (req, res) => {
  try {
    //getting necessary info from request body
    const { password, confirmPassword } = req.body;

    //checking both passwords are same
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords does not match" });
    }

    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    //getting the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //updating the password to the user
    user.password = hashedPassword;
    await user.save();

    //sending success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    //sending error response, if any error happened
    console.error(`Error in resetPassword: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//getting user data method
export const getUserHome = async (req, res) => {
  try {
    //getting the user from middleware
    const user = await User.findById(req.user._id);

    //checking the user
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //sending success response
    return res
      .status(200)
      .json({ message: "User data fetched successfully!", userData: user });
  } catch (error) {
    //sending error response, if any error happened
    console.error(`Error: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
