const jwt = require("jsonwebtoken");

const signToken = (id) => {
  const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

exports.createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const expiresIn = 7 * 24 * 60 * 60;
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + expiresIn * 1000), // Convert expiresIn to milliseconds
    httpOnly: true,
  });

  user.password = user.password;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};
