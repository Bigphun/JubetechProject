const Joi = require("joi");
const User = require("../models/User")

exports.validateEmail = (email) => {
  const emailRegex = /^[a-z\d._%+-]+@[a-z\d.-]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return false;
  }
  const schema = Joi.string().email({ tlds: { allow: true } }).lowercase().required();
  const { error } = schema.validate(email);
  return !error; 
};

exports.validateLength = (text, min, max) => {
  const schema = Joi.string().min(min).max(max).required();
  const { error } = schema.validate(text);
  return !error;
};

exports.validateUsername = async (username) => {
  const schema = Joi.string().alphanum().min(3).max(30).required();
  const { error } = schema.validate(username);

  if (error) {
    throw new Error(error.message); 
  }

  // Check for duplicate username
  let uniqueUsername = username;
  let isUnique = false;

  while (!isUnique) {
    const existingUser = await User.findOne({ username: uniqueUsername });
    if (existingUser) {
      uniqueUsername += Math.floor(Math.random() * 10);
    } else {
      isUnique = true;
    }
  }

  return uniqueUsername;
};
