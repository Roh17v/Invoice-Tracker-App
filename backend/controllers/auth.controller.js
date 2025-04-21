import { User } from "../models/user.model.js";

export const signupUser = async (req, res, next) => {
  try {
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
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  };
