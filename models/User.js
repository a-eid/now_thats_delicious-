const mongoose = require("mongoose");
const md5 = require("md5");
const validator = require("validator");
const mongooseErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please supply a name"
  },
  name: {
    type: String,
    required: "Please supply a name",
    tring: true
  },
  resetPasswordToken: String, 
  resetPasswordExpires: Date ,
  hearts:[{
    type: mongoose.Schema.ObjectId , 
    ref: 'Store' // what the fuck are mongoose refs ? => what do the objectids ref to => Stores right yup 
  }]
});

userSchema.virtual('gravatar').get(function(){
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`
})

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(mongooseErrorHandler)

module.exports = mongoose.model("User", userSchema);
