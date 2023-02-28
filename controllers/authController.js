const { User, userValidation } = require("../models/db.js");
const sendEmail = require("../notifications/email");
var jwt = require("jsonwebtoken");
require("dotenv").config();

exports.emailconfirmation = async (req, res) => {
  try {
    let token = req.params.token;
    let output;
    jwt.verify(token, process.env.JWT_SECURITY, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      output = decoded;
    });
    let user = await User.findOne({ _id: output.id });
    user.userconfirmation = true;
    user.save();

    return res.status(200).send({ message: "Email Confirmed" });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res) => {
  try {
    let valid = userValidation(req.body);
    if (valid.error) return res.status(400).send(valid.error.message);
    let user = await User.create({
      name: req.body.name,
      useremail: req.body.useremail,
      userpassword: req.body.userpassword,
      userconfirmation: false,
    });
    var token = jwt.sign({ id: user.id }, process.env.JWT_SECURITY, {
      expiresIn: 86400, // 24 hours
    });

    let url = `${process.env.BASE_URL}/api/auth/confirmation/` + token;
    let subject = "User Sign Up Email Confirmation";
    let text = `Hello ${req.body.name} \n You Have Signed Up \n Please Click on this link to confirm your account ${url}`;
    sendEmail.sendEmail(req.body.useremail, subject, text);
    res.status(200).json({ message: "User Created Successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error has happened" });
    console.log("err in user creation");
    console.log(err);
  }
};

exports.signin = async (req, res) => {
  let user = await User.findOne({
    useremail: req.body.useremail,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    if (user.userconfirmation == false) {
      return res.status(401).send({ message: "User Email Not Yet Confirmed." });
    }

    var passwordIsValid = false;

    if (req.body.userpassword == user.userpassword) {
      passwordIsValid = true;
    }
    if (!passwordIsValid) {
      return res.status(403).send({ message: "Invalid Password!" });
    }

    var token = jwt.sign({ id: user.id }, process.env.JWT_SECURITY, {
      expiresIn: 86400, // 24 hours
    });
    req.session.token = token;
    req.user = user;
    res.status(200).json({ message: "Successfully Signed In", token: token });
  });
};
