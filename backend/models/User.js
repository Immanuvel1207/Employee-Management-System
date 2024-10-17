const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // Admin or Employee
});

module.exports = mongoose.model('User', userSchema);
