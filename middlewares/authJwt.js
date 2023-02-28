const jwt = require("jsonwebtoken");
const { User } = require("../models/db.js");

verifyToken = async (req, res, next) => {
  let token = req.session.token;
  if (!token) {
    return res.status(403).send({ message: "No token provided! Please Login" });
  }
  jwt.verify(token, process.env.JWT_SECURITY, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    let user = await User.findById(decoded.id);
    req.user = user;
    next();
  });
};

const authJwt = {
  verifyToken,
};
module.exports = authJwt;
