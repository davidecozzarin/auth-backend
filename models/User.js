const mongoose = require('mongoose');
const crypto = require('crypto');

// Funzione per hash della password
const simpleHash = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  email: { type:  String, required: true, unique: true },
  profileImage: { type: String }
});

// Hash della password
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = simpleHash(this.password);
  next();
});

// Metodo per confrontare la password
userSchema.methods.comparePassword = function (password) {
  return simpleHash(password) === this.password;
};

module.exports = mongoose.model('User', userSchema);