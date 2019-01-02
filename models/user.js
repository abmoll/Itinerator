var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  trip: {
    type: Array,
    required: false,
  }
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  // search for user email in database
  User.findOne({ email: email })
    .exec(function (err, user) {
      // catch errors and user not found situations
      if (err) {
        console.log("user.js")
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      // compares user password to database password
      bcrypt.compare(password, user.password, function (err, result) {
        // if password match send the callback function back with user info
        if (result === true) {
          return callback(null, user);
        // if user not found pass empty callback function to return an error
        } else {
          return callback();
        }
      })
    });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

UserSchema.statics.updateDB = function(trip, user, cb){
  User.findByIdAndUpdate(user,
    { $push: { trips: trip }},
    { new: true },
    function (err, user) {
      if (err) { return cb(err); };
      cb(null, user);
});
}

// UserSchema.statics.getData = function(user,cb){
//   User.find(user)
// }

// export user for use in other files
var User = mongoose.model('User', UserSchema);
module.exports = User;
module.exports.model = UserSchema;
