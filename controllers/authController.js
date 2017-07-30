const crypto = require("crypto");
const mongoose = require("mongoose");
const passport = require("passport");
const promisify = require("es6-promisify");
const { send } = require("../handlers/mail");
const User = mongoose.model("User");

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login",
  successRedirect: "/",
  successFlash: "You now are logged in "
});

exports.logout = (req, res, next) => {
  req.logout();
  req.flash("success", "you have logged out successfully");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash("error", "You must be logged in");
  res.redirect("/login");
};

exports.forgot = async (req, res, next) => {
  // see if there is a user with that email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash(
      "error",
      "This Email don't exist in our databases register to log in"
    );
    return res.redirect("/register");
  }
  // set token and expire date on their account
  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // one more hour
  await user.save(); // token has been set
  // send email with token
  // enable
  const resetURL = `http://${req.headers.host}/account/reset/${token}`;
  await send({
    user,
    subject: "Password Reset",
    filename: "password-reset",
    resetURL
  });
  req.flash("success", `you have been emailed the password reset link `);
  // redirect to login page
  res.redirect("/login");
};

exports.reset = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // check query still valid (wihin an hour)
  });
  if (!user) {
    req.flash("error", "invalid or expired url");
    return res.redirect("/login");
  }
  res.render("reset", {
    title: "reset your password"
  });
};

exports.updatePassword = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // check query still valid (wihin an hour)
  });
  if (!user) {
    req.flash("error", "invalid or expired url");
    return res.redirect("/login");
  }

  if (req.body.password != req.body["password-confirm"]) {
    req.flash("error", "Passwords don't watch");
    return res.redirect("back");
  }

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  req.login(await user.save());
  req.flash("success", "password was reset successfully ");
  return res.redirect("/stores");
};
