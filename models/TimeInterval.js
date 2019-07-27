var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    from: String,
    to: String
  }
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('TimeInterval', UserSchema);
