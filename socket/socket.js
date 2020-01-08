var Socket = {};

//var scheduleController = require("../controllers/ScheduleController.js");

var g_io;

Socket.getServer = function(callback) {

  var server = callback();
	var io = require('socket.io')(server);
  g_io = io;
  //console.log(io);

/*  io.on('connection', function(socket) {
  //	g_socket = socket;
    //g_io = io;
    console.log("Connection established!");
    console.log(socket.id);

    socket.on('search', function(data) {
      //console.log(app.locals.settings.io);

      var docs = scheduleController.getTasks(data,socket);
      //var docs = schedule.getTasks(data, io);
      //io.sockets.emit('search', 'Responce from server: ' + data);
    });

    socket.on('subscribe', function(receiver, transmitter, direction) {

      if (direction) {
        scheduleController.subscribe(receiver, transmitter,socket);
      }
      else {
        scheduleController.unsubscribe(receiver, transmitter,socket);
      }

    });

  });*/

}

Socket.getIO = function() {

  return g_io;
}

module.exports = Socket;
