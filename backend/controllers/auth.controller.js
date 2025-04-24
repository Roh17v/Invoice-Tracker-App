import { User } from "../models/user.model.js";
import { createError } from "../utils/error.js";
import bcrypt from "bcrypt";


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
      name: userInfo.name,
      email: userInfo.email,
      role: userInfo.role,
    });
  } catch (error) {
    next(error);
  }
};
