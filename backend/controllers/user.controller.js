import { User } from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const users = await User.find({ _id: { $ne: userId } }).select(
      "_id name email"
    );

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
