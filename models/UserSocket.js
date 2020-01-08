var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSocketSchema = new Schema({
  username:String,
  sId:String
});

module.exports = mongoose.model('UserSocket', UserSocketSchema);
