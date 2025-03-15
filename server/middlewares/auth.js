const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  try {
    // 1. check header
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "There is no verification of user authentication.", status: "unauthorized" });
    
    // 2. verify token
    let decoded;
    const token = authHeader.split(" ")[1];
    try {
      decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              return reject({ status: 401, message: "หมดเวลาในการใช้งานโปรดเข้าสู่ระบบอีกครั้ง", statusText: "expired" });
            }
            return reject({ status: 403, message: "Your session has expired. Please log in again.", statusText: "invalid_token" });
          }
          resolve(decoded);
        });
      });
    } catch (err) {
      return res.status(err.status).json({ message: err.message, status: err.statusText });
    }

    // 3. query user
    const user = await User.findById(decoded._id).select("role_ids").lean();
    if (!user) return res.status(404).json({ message: "The user was not found." });

    // 4. query role
    const roles = await Role.find({ _id: { $in: user.role_ids } }).select("role_name").lean();
    const role_names = roles.map(role => role.role_name);

    // 5. create verify user data
    req.verify_user = {
      _id: decoded._id,
      roles: role_names
    };

    next();
  } catch (error) {
    res.status(400).json({ message: "User authentication is incorrect.", status: "invalid_token" });
  }
};

const verifyRole = (allow_roles) => {
  return (req, res, next) => {
    // check verify user
    if (!req.verify_user || !req.verify_user.roles) return res.status(403).json({ message: "Access denied." });
    // check role
    const hasRole = req.verify_user.roles.some(role => allow_roles.includes(role));
    if (!hasRole) return res.status(403).json({ message: "Access denied." });
    next();
  }
}

module.exports = { verifyToken, verifyRole };
