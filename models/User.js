var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var TimeInterval = require("../models/TimeInterval");

var UserSchema = new Schema({
    username: String,
    password: String,
    name: String,
	surname: String,
	about: String,
	taskList: Array,
  subscriberList: Array,
  unavailableTime:{
    default: {
        from: String,
        to: String
      },
    custom:Array
  },
  notificationsList: Array,
  searchesList: Array
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
