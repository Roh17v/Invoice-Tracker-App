import { User } from "../models/user.model.js";
import { createError } from "../utils/error.js";
import bcrypt from "bcrypt";
import { userValidationSchema } from "../models/user.model.js";

export const signupUser = async (req, res, next) => {
  try {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { email, password, role = "reviewer", name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, "Email already registered."));
    }

    const newUser = new User({ name, email, password, role });
    const result = await newUser.save();

    //token generation
    const token = newUser.generateAuthToken();
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(201).json({
      id: result._id,
      name: result.name,
      email: result.email,
      role: result.role,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "User Not Found!"));

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
      return next(createError(400, "Invalid Email or Password."));

    //token generation
    const token = user.generateAuthToken();
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24,
    });
    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("authToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1,
    });

    return res.status(200).send("Logout Successfull.");
  } catch (error) {
    next(error);
  }
};

export const sendUser = async (req, res, next) => {
  try {
    const userInfo = await User.findById(req.user._id);
    return res.status(200).json({
      id: userInfo._id,
      email: userInfo.email,
      role: userInfo.role,
    });
  } catch (error) {
    next(error);
  }
};
