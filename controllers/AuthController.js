var mongoose = require("mongoose");
var passport = require("passport");

var User = require("../models/User");
var UserSocket = require("../models/UserSocket");

var userController = {};



userController.extRegister = function(req, res) {


  User.register(new User({ username : req.body.username,
								name: req.body.name,
								surname: req.body.surname,
								taskList: new Array(),
                subscriberList: new Array(),
                unavailableTime: {"default":{"from":String, "to":String}, "custom": new Array(),
                notificationsList: new Array(),
                searchesList: new Array()}
								}),
  req.body.password,  function(err, user) {
    if (err) {
      return res.render('register', { user : user });
    }

    passport.authenticate('local')(req, res, function () {
      var socket = require("../socket/socket.js");
      var io = socket.getIO();
      userController.setIO(io, req);

      res.send(req.user);
    });
  });
}

userController.extLogin = function(req, res) {
  passport.authenticate('local')(req, res, function () {

    var socket = require("../socket/socket.js");
    var io = socket.getIO();
    userController.setIO(io, req);

    res.send(req.user);
  });
}


userController.extLogout = function(req, res) {

  req.logout();
  res.send({"username": req.body.username, "status":"logout"});
};


// Restrict access to root page
userController.home = function(req, res) {
  res.render('index', { user : req.user });
};

// Go to registration page
userController.register = function(req, res) {
  res.render('register');
};

// Post registration
userController.doRegister = function(req, res) {
  console.log(req.body);
  User.register(new User({ username : req.body.username,
								name: req.body.name,
								surname: req.body.surname,
								taskList: new Array(),
                subscriberList: new Array(),
                unavailableTime: {"default":{"from":String, "to":String}, "custom": new Array(),
                notificationsList: new Array(),
                searchesList: new Array()}
								}),
  req.body.password,  function(err, user) {
    if (err) {
      console.log("Error!!!");
      return res.render('register', { user : user });
    }

    passport.authenticate('local')(req, res, function () {
      var socket = require("../socket/socket.js");
      var io = socket.getIO();
      userController.setIO(io, req);

      res.redirect('/');
    });
  });
};

// Go to login page
userController.login = function(req, res) {
  res.render('login');
};


var scheduleController = require("../controllers/ScheduleController.js");


async function GetHash(salt, password) {
  var hash = await bcrypt.hashSync(password, salt);
  return hash;
}

function checkPassword(inputPassword, actualPassword) {
  bcrypt.compare(inputPassword, actualPassword, function(err, isMatch) {
      if (err) throw err;
      console.log(isMatch);
    });

}

// Post login
userController.doLogin = function(req, res) {

  passport.authenticate('local')(req, res, function () {

    var salt = req.user.salt;
    var hash = req.user.hash;
    var pswd = req.body.password;

  /*  console.log(pswd);
    console.log(hash);
    console.log(salt);

    checkPassword(pswd, hash);*/
  /*  var resHash = GetHash(salt, pswd);
    resHash
      .then(
        result => {
          // первая функция-обработчик - запустится при вызове resolve
          console.log(result); // result - аргумент resolve
        },
        error => {
          // вторая функция - запустится при вызове reject
          console.log(error); // error - аргумент reject
        }
      );*/





  /*  bcrypt.genSalt(10, function(err, slt) {
           bcrypt.hash(pswd, slt, function(err, h) {
               console.log(h);
           });
       });*/


  /*  var slt = bcrypt.getSaltSync(10);
    console.log(slt);*/

/*   bcrypt.hashSync(pswd, salt, null, function (err, hash) {
      if (err)
        throw err;
      var h = hash;
      console.log(h);
    });*/

    var socket = require("../socket/socket.js");
    var io = socket.getIO();
    userController.setIO(io, req);

  //  res.redirect('/');

      res.redirect('/');
  });

};

userController.setIO = function(io, req) {
  io.on('connection', function(socket) {
    console.log("Connection established!");
    console.log(socket.id);
    console.log(req.user.username + " connected.");

    socket.on('unavailableTime', function(username, unavailableTime){
      if (unavailableTime==null) {
        console.log("Get unavailable time");
        scheduleController.getUserUnavailableTime(username, socket);
      }
      else {
        console.log("______________________________________");
        console.log("Unavailable time:");
        console.log(unavailableTime);
        console.log("______________________________________");
        scheduleController.setUserUnavailableTime(username, unavailableTime);
      }
    });

    //socket.on('mapping', function(mappingElements, dateTimeFrom, dateTimeTo) {
      socket.on('mapping', function(mappingData, username) {


      //var from = new Date(dateTimeFrom);
      //var to = new Date(dateTimeTo);
      console.log(mappingData);

      var from = scheduleController.getDateTime(mappingData.dateFrom, mappingData.timeFrom);
      var to = scheduleController.getDateTime(mappingData.dateTo, mappingData.timeTo);
      var mappingElements = mappingData.users;

      var intervals = scheduleController.getReportIntervals(mappingElements, from, to, socket, username);
      intervals
        .then(
          result => {
          //  console.log(result);
          },
          error => {
            console.log(error);
          }
        );
    });

    socket.on('search', function(data) {
      //console.log(app.locals.settings.io);
      console.log(data);
      var docs = scheduleController.getTasks(data,socket);
      //var docs = schedule.getTasks(data, io);
      //io.sockets.emit('search', 'Responce from server: ' + data);
    });

    socket.on('taskById', function(user, id) {

      scheduleController.getTaskById(user,id,socket);
    });

    socket.on('notifications', function(username) {
      scheduleController.getNotifications(username, socket);
    });

    socket.on('changeNotificationStatus', function(username, dateTime) {
      scheduleController.changeNotificationStatus(username, dateTime);
    })

    socket.on('subscribe', function(receiver, transmitter, direction, taskNumber) {

      if (direction) {
        console.log("AuthController: " + transmitter + " -> " + receiver);
        scheduleController.subscribe(receiver, transmitter,socket, taskNumber);
      }
      else {
        console.log("AuthController: " + transmitter + " <- " + receiver);
        scheduleController.unsubscribe(receiver, transmitter,socket, taskNumber);
      }

    });

    socket.on('getUserSearchesList', function(username) {

      scheduleController.getUserSearchesList(username, socket);
    });




  });

}

// logout
userController.logout = function(req, res) {

  req.logout();
  res.redirect('/');
};

module.exports = userController;
