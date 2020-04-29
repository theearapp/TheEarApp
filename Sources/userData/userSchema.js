const mongoose = require('mongoose');
const Schema = mongoose.Schema; const ObjectId = Schema.ObjectId;
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10; // used for password encryption

const userSchema = new Schema({
  uid: {type: ObjectId, required: true, index: {unique: true}},
  username: {
    type: String,
    required: true,
    index: {unique: true},
    lowercase: true},

  name: {
    first: {type: String, required: false},
    last: {type: String, required: false},
  },
  phone: {
    number: {type: String, index: {unique: true, sparse: true}},
    isVerified: Boolean,
  },
  email: {
    value: {type: String, index: {unique: true, sparse: true}, lowercase: true},
    isVerified: Boolean
  },
  password: {type: String, required: true},
  dob: {type: String},
  address: {type: String},
  tokenInfo: [{
    _id: false,
    token: String,
    createdTimestamp: String,
    logoutTimestamp: String,
  }],
}, {collection: 'earUser'});

userSchema.pre('save', function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      this.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  // console.log(candidatePassword);
  // console.log(this.password);
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
module.exports = mongoose.model('earUsers', userSchema, 'earUsers');