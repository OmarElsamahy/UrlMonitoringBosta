const { User } = require("../models/db.js");

checkDuplicateEmail = (req, res, next) => {
  // Email
  User.findOne({
    useremail: req.body.useremail,
  }).exec((err, user) => {
    if (err) {
      res.status(500).json({ message: err });
      console.log(err);
      return;
    }
    if (user) {
      res.status(409).json({ message: "Failed! Email is already in use!" });
      return;
    }
    next();
  });
};

const verifySignUp = {
  checkDuplicateEmail,
};

module.exports = verifySignUp;
