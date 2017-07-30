const mongoose = require("mongoose");
const promisify = require("es6-promisify");
const User = mongoose.model("User");

exports.loginForm = async (req, res, next) => {
  // res.send("login form")
  res.render("login", {
    title: "Login"
  });
};

exports.registerForm = async (req, res, next) => {
  res.render("register", { title: "Register" });
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name
  });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  // res.json({message: "success"})
  next();
};

exports.account = async (req, res, next) => {
  res.render("account", {
    title: "Edit Your Account"
  });
};

exports.updateAccount = async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: req.body },
    {
      new: true,
      runValidators: true,
      context: "query"
    }
  );
  req.flash("success" , "Details updated successfully") 
  res.redirect('/account')
};

// VALIDATION MIDDLEWARE
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "you must supply a name").notEmpty();
  req.checkBody("email", "that email is not valid").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("password", "password can't be empty").notEmpty();
  req
    .checkBody("password-confirm", "passwords don't match")
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("error", errors.map(error => error.msg)); // pass the req.flash an array of all the errors .
    return res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash()
    });
  }
  next();
};
