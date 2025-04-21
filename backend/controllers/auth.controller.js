

export const signup = async (req, res, next) => {
    try {
      const { error } = validateUser(req.body);
      if (error) return next(createError(400, error.details[0].message));
  
      const { email, password } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(createError(409, "Email already registered."));
      }
  
      const newUser = new User({ email, password });
      const result = await newUser.save();
  
      //token generation
      const token = newUser.generateAuthToken();
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 3600000,
      });
  
      return res.status(201).json({
        id: result._id,
        email: result.email,
        profileSetup: result.profileSetup,
      });
    } catch (error) {
      next(error);
    }
  };