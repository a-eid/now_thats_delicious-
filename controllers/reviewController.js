const mongoose = require("mongoose");
const Review = require("../models/Review");

exports.addReview = async (req, res, next) => {
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  await new Review(req.body).save();
  req.flash("success" , "Review added successfully");
  res.redirect("back");
};
