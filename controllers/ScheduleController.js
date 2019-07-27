var mongoose = require("mongoose");
var User = require("../models/User");

var scheduleController = {};



scheduleController.extGetReportIntervals = function(req, res) {
	var users= req.body.users;
	var dateFrom = req.body.dateFrom;
	var timeFrom = req.body.timeFrom;
	var dateTo = req.body.dateTo;
	var timeTo = req.body.timeTo;
	var dateTimeFrom = scheduleController.getDateTime(dateFrom, timeFrom);
	var dateTimeTo = scheduleController.getDateTime(dateTo, timeTo);

	var intervals = scheduleController.getReportIntervals(users, dateTimeFrom, dateTimeTo);
	intervals
		.then(
			result => {
				// первая функция-обработчик - запустится при вызове resolve
				console.log(result); // result - аргумент resolve
				res.send(result);
			},
			error => {
				// вторая функция - запустится при вызове reject
				console.log(error); // error - аргумент reject
				res.send(error);
			}
		);


}

scheduleController.extGetUserTaskFreeTime = function(req, res) {

	var username = req.body.username;
	var dateFrom = req.body.dateFrom;
	var timeFrom = req.body.timeFrom;
	var dateTo = req.body.dateTo;
	var timeTo = req.body.timeTo;
	var dateTimeFrom = scheduleController.getDateTime(dateFrom, timeFrom);
	var dateTimeTo = scheduleController.getDateTime(dateTo, timeTo);

	User.findOne({username:username}, function(err, user){
		if(err) return console.log(err);
		console.log(user);
		var taskFreeTime = scheduleController.getUserTaskFreeTime(user, dateTimeFrom, dateTimeTo);
		res.send(taskFreeTime);
	});

}

scheduleController.setUserUnavailableTime = function(req, res) {

	var unavailableTime = req.body.unavailableTime;
	var username = req.body.username;
	console.log(username);
	console.log(unavailableTime);


/*	var salt = req.user.salt;
	var hash = req.user.hash;
	var pswd = req.body.password;

	console.log(pswd);
	console.log(hash);
	console.log(salt);*/


	setUserUnavailableTime(username, unavailableTime);
	var response = {"username": username, "unavailableTime": unavailableTime};
	res.send(response);

}

scheduleController.setUserTaskList = function(req, res) {

	var username = req.body.username;
	var taskList = req.body.taskList;

	console.log("Set user task list");
	console.log(username);
//	console.log(taskList);

	var newTaskList = new Array();
	for(let task of taskList) {
		console.log(task);
		console.log(task.dateFrom + ", " + task.timeFrom);
		var dateTimeFrom = scheduleController.getDateTime(task.dateFrom, task.timeFrom);
		console.log(dateTimeFrom);
		console.log(task.dateTo + ", " + task.timeTo);
		var dateTimeTo = scheduleController.getDateTime(task.dateTo, task.timeTo);
		console.log(dateTimeTo);

		let taskNumber;
		if (typeof(task.taskNumber)=="string")
			taskNumber = parseInt(task.taskNumber);
		else
			taskNumber = task.taskNumber;

		var newTask = {
							"name": (task.name==undefined)?"":task.name,
							"comment": (task.comment==undefined)?"":task.comment,
							"dateFrom": task.dateFrom,
							"timeFrom": task.timeFrom,
							"dateTimeFrom": dateTimeFrom,
							"dateTo": task.dateTo,
							"timeTo": task.timeTo,
							"dateTimeTo": dateTimeTo,
							"visibility": task.visibility,
							"editable": task.editable,
							"taskNumber":taskNumber,
							"subscriberList":task.subscriberList
		}
		newTaskList[newTaskList.length] = newTask;
	}
	console.log(newTaskList);

	User.updateOne({username:username}, {taskList:newTaskList}, function(err, user){
		//mongoose.disconnect();
		if(err) return console.log(err);
		console.log(user);
		res.send(user);
	});
}

scheduleController.getUserById = function(req, res) {

	var id = req.params.id;

	User.findOne({username:id}, function(err, user){
		//mongoose.disconnect();

		if(err) return console.log(err);

		var taskList = user.taskList;
		var publicTaskList = getPublicTaskList(taskList);
		user.taskList = publicTaskList;

		res.send(user);

	});
}

scheduleController.getAllUsers = function(req, res) {

		User.find({}, function(err, docs){
			//mongoose.disconnect();

			if(err) return console.log(err);

			var userList = new Array();

			for(var user of docs) {

				var taskList = user.taskList;


			/*	var publicTaskList = new Array();
				console.log(taskList);
				for(var task of taskList) {
					if (task.visibility==true) {
						publicTaskList[publicTaskList.length] = task;
					}
				}*/
				var publicTaskList = getPublicTaskList(taskList);
				user.taskList = publicTaskList;
				userList[userList.length] = user;
			}

			res.send(userList);

		});

	}

	function getPublicTaskList(taskList) {
		var publicTaskList = new Array();
	//	console.log(taskList);
		for(var task of taskList) {
			if (task.visibility==true) {
				publicTaskList[publicTaskList.length] = task;
			}
			else {
				var privateTask = task;
				privateTask.name = "User is busy"
				privateTask.comment = "";
				publicTaskList[publicTaskList.length] = privateTask;
			}
		}
		return publicTaskList;
	}

	function getMaxNumberInTaskList(taskList) {
		if (taskList.length==0) return -1;
		var maxNumber = Math.max.apply(Math, taskList.map(function (o) { return o.taskNumber; }));
		//console.log(maxNumber);
		return maxNumber;
	}

	function getTimeValue(timeString) {
		var result;
		try {
			var timeParts = timeString.split(":");
			result = parseFloat(timeParts[0]) + 0.01*parseFloat(timeParts[1]);
		}
		catch(err) {
			console.log(err);
			result = "";
		}
		return result;
	}

	function getDateValue(dateTime) {
		var localDate = new Date(dateTime);
		var localDateString = localDate.toLocaleDateString(undefined, {
			day : 'numeric',
			month : 'numeric',
			year : 'numeric'
		});
		return localDateString;
	}


	function sortJSONArrayByField(array, field) {
		array = array.sort(function(a, b) {
		return (a[field] > b[field]) ? 1 : ((a[field] < b[field]) ? -1 : 0);
		});
	}

	function deleteDateDuplicates(array) {
		var resArray = new Array();
		array.sort(function(a, b) {
			return a>b ? -1 : a<b ? 1 : 0;});
		for(var i=0;i<array.length-1;i++) {
			if ((array[i].toISOString()!==array[i+1].toISOString())||(i==array.length-2)) {
				resArray[resArray.length] = array[i];
			}
		}
		return resArray;
	}

	scheduleController.getDateTime = function(date, time) {
		if ((date!="")&&(time!="")) {
			var dateParts = date.split("-");
			var timeParts = time.split(":");
			var dateTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1]);
		//	console.log(time);
			return dateTime;
		}
		else return undefined;

	}


	scheduleController.setUserUnavailableTime = function(username, unavailableTime) {
		var customIntervals = unavailableTime.custom;
		var resultCustomIntervalsArray = new Array();
		for(var intervals of customIntervals) {
			var customDateTimeFrom = scheduleController.getDateTime(intervals.dateFrom, intervals.timeFrom);
			var customDateTimeTo = scheduleController.getDateTime(intervals.dateTo, intervals.timeTo);
			console.log(customDateTimeFrom);
			console.log(customDateTimeTo);

			if ((customDateTimeFrom!=undefined)&&(customDateTimeTo!=undefined))
	        resultCustomIntervalsArray[resultCustomIntervalsArray.length] = {"from": customDateTimeFrom, "to": customDateTimeTo};

		}
		unavailableTime.custom = resultCustomIntervalsArray;
		console.log(unavailableTime.custom);

		User.updateOne({username:username}, {unavailableTime:unavailableTime}, function(err, user){
					if(err) return console.log(err);
					console.log(user)
			});
	}

	scheduleController.getUserUnavailableTime = function(username, socket) {
		User.findOne({username: username}, function(err, user){
			if(err) return console.log(err);
			socket.emit('unavailableTime', user.unavailableTime);
		});
	};


	scheduleController.filterUserTaskList = function(user){
			var taskList = user.taskList;
			var resList = new Array();
			for (var task of taskList) {
				if ((task.dateTimeFrom!=null)&&(task.dateTimeTo!=null)) {
					resList[resList.length] = task;
				}
			}
			user.taskList = resList;

		return user;
	}


	scheduleController.addUnavailableTimeToTaskList = function(user, dateTimeFrom, dateTimeTo) {

		var user = scheduleController.filterUserTaskList(user);
		var userTaskList = user.taskList;



		var curDate = dateTimeFrom;
		var count = 0;
		while (curDate<dateTimeTo) {

		//	console.log(curDate);
			var curDateTimeFrom;
			var curDateTimeTo;

			var customUserIntervals = user.unavailableTime.custom;
			var isCustomIntervalFounded = false;
			var unavailableIntervalTask;
			for(var customInterval of customUserIntervals) {
				var customIntervalDate = getDateValue(customInterval.from);
			//	console.log(customIntervalDate);
				var cd = getDateValue(curDate);
			//	console.log(cd);
				isCustomIntervalFounded = (customIntervalDate==cd);
			//	console.log(isDatesSame);
				if (isCustomIntervalFounded) {
					curDateTimeFrom = customInterval.from;
					curDateTimeTo = customInterval.to;
					break;
				}
			}

			var curDateString = curDate.getFullYear()+"-"+(curDate.getMonth()+1)+"-"+curDate.getDate();

			var day = curDate.getDate();
			day++;
			curDate.setDate(day);
			var nextDayString = curDate.getFullYear()+"-"+(curDate.getMonth()+1)+"-"+curDate.getDate();



			if (!isCustomIntervalFounded) {

			 var defaultUserUnavailableInterval = user.unavailableTime.default;

			 var fromTimeString = defaultUserUnavailableInterval.from;
			 var toTimeString = defaultUserUnavailableInterval.to;

			 if ((fromTimeString!=="")&&(toTimeString!=="")) {

				 var fromTime = getTimeValue(fromTimeString);
				 var toTime = getTimeValue(toTimeString);

				 if (fromTime<=toTime) {
					 curDateTimeFrom = scheduleController.getDateTime(curDateString, fromTimeString);
					 curDateTimeTo = scheduleController.getDateTime(curDateString, toTimeString);
				 }
				 else {
					 curDateTimeFrom = scheduleController.getDateTime(curDateString, fromTimeString);
					 curDateTimeTo = scheduleController.getDateTime(nextDayString, toTimeString);
		  		}
					let unavailableIntervalTask = {
						 "name":"User is unavailable",
						 "dateTimeFrom": curDateTimeFrom,
						 "dateTimeTo": curDateTimeTo
					};
					 userTaskList[userTaskList.length] = unavailableIntervalTask;
			 }
			}

			else {

				let unavailableIntervalTask = {
					 "name":"User is unavailable",
					 "dateTimeFrom": curDateTimeFrom,
					 "dateTimeTo": curDateTimeTo
				};
				 userTaskList[userTaskList.length] = unavailableIntervalTask;
			}





					count++;
			}

			//Извращенным способом возвращаем старую левую границу интервала сопоставления
			dateTimeFrom.setDate(day-count);

			sortJSONArrayByField(userTaskList, 'dateTimeFrom');

			return user;
		}


	scheduleController.getUserTaskFreeTime = function getUserTaskFreeTime(user, dateTimeFrom, dateTimeTo) {
			var filteredUser = scheduleController.filterUserTaskList(user);
			var userWithUnavailableTime = scheduleController.addUnavailableTimeToTaskList(user, dateTimeFrom, dateTimeTo);
			console.log(userWithUnavailableTime);

			var taskList = userWithUnavailableTime.taskList;
			var taskFreeTimeArray = new Array();

			var tempDateTime = dateTimeFrom;
			for (var task of taskList) {
				if (tempDateTime<task.dateTimeFrom) {
					taskFreeTimeArray[taskFreeTimeArray.length] = {"from":tempDateTime, "to":task.dateTimeFrom};
					tempDateTime = task.dateTimeTo;
				}
				else if (tempDateTime<task.dateTimeTo) {
					tempDateTime = task.dateTimeTo;
				}

			}
			if (tempDateTime<dateTimeTo) {
				taskFreeTimeArray[taskFreeTimeArray.length] = {"from":tempDateTime, "to":dateTimeTo};
			}


			return taskFreeTimeArray;

	}


	scheduleController.getReportIntervals = async function(userNames, dateFrom, dateTo, socket) {
		var usersFreeTimeArray = new Array();
		var reportTimesArray = new Array();
		var users = new Array();
		var usersFindingWasCompleted = false;
		for (var userName of userNames) {
			await User.findOne({username: userName}, function(err, user){
				if(err) return console.log(err);
				users[users.length] = user;
				usersFindingWasCompleted = (userNames.indexOf(userName)==userNames.length-1);
				console.log("Completed: " + usersFindingWasCompleted);
			});
		}

		console.log(userNames);
		console.log(dateFrom);
		console.log(dateTo);
		
		if (usersFindingWasCompleted) {
			for (var user of users) {
				var curUserFreeTimeArray = scheduleController.getUserTaskFreeTime(user, dateFrom, dateTo);
				for (var interval of curUserFreeTimeArray) {
					 reportTimesArray[reportTimesArray.length] = interval.from;
					 reportTimesArray[reportTimesArray.length] = interval.to;
				}
				var item = {"userName":user.username, "freeTimeIntervals":curUserFreeTimeArray};
				usersFreeTimeArray[usersFreeTimeArray.length] = item;
			}

			reportTimesArray = deleteDateDuplicates(reportTimesArray);
			reportTimesArray
			.reverse()
			;
			//console.log(reportTimesArray);

			var reportIntervalsArray = new Array();
			for(i=0;i<reportTimesArray.length-1;i++) {
				var curDateTimeFrom = reportTimesArray[i];
				var curDateTimeTo = reportTimesArray[i+1];

				if (curDateTimeTo<=dateTo) {

					var curIntervalUsers = new Array();

					for (var curUserFreeTimeArray of usersFreeTimeArray) {
					//	console.log(userFreeTime.freeTimeIntervals +" - " +  curDateTimeFrom);
					//	console.log(userFreeTime.freeTimeIntervals + " - " + curDateTimeTo);
						for (var userFreeTime of curUserFreeTimeArray.freeTimeIntervals) {
							if ((userFreeTime.from<=curDateTimeFrom)&&(userFreeTime.to>=curDateTimeTo))
								curIntervalUsers[curIntervalUsers.length] = curUserFreeTimeArray.userName;
						}

					}
					var curIntervalAmount = curIntervalUsers.length;

					reportIntervalsArray[reportIntervalsArray.length] = {"from": curDateTimeFrom,"to": curDateTimeTo, "freeUsers": curIntervalUsers, "amount": curIntervalAmount};
				}
			}

			sortJSONArrayByField(reportIntervalsArray, 'amount');
		//	console.log(reportIntervalsArray.reverse());
			reportIntervalsArray.reverse();

			if (socket!==undefined)
				socket.emit('mapping', reportIntervalsArray);
		}

	 	return reportIntervalsArray;

	}








//var socket = require("../socket/socket.js");

scheduleController.addTask = function(req, res) {
	var curUserTaskList = req.user.taskList;

	var dateTimeFrom = scheduleController.getDateTime(req.query.dateFrom, req.query.timeFrom);
	var dateTimeTo = scheduleController.getDateTime(req.query.dateTo, req.query.timeTo);

	var maxNumberInTaskList = getMaxNumberInTaskList(curUserTaskList);
	var editedTask = {"name": (req.query.name==undefined)?"":req.query.name,
					"comment": (req.query.comment==undefined)?"":req.query.comment,
					"dateFrom": req.query.dateFrom,
					"timeFrom": req.query.timeFrom,
					"dateTimeFrom": dateTimeFrom,
					"dateTo": req.query.dateTo,
					"timeTo": req.query.timeTo,
					"dateTimeTo": dateTimeTo,
					"visibility": (req.query.visibility==undefined)?false:true,
					"editable": (req.query.editable==undefined)?false:true,
					"taskNumber":maxNumberInTaskList+1,
					"subscriberList":new Array()};

	curUserTaskList[curUserTaskList.length] = editedTask;

	var io = socket.getIO();
	var subscriberList = req.user.subscriberList;

	if (editedTask.visibility) {
		var message = "Task '" + editedTask.name + "' " + "was added!"
		notify(subscriberList, req.user.username, message, io);
	}


	User.updateOne({_id:req.user._id}, {taskList:curUserTaskList}, function(err, users){

        if(err) return console.log(err);
    });
	res.redirect('/');
}

scheduleController.deleteTask = function(req, res) {
	//console.log(req.query);
	//console.log(req.user);
//	var removedTaskName = req.user.taskList[req.query.taskId].name;
	//console.log(removedTask);

	var io = socket.getIO();
	var subscriberList = req.user.subscriberList;
	var userTaskList = req.user.taskList;
	var deletedTask = userTaskList[req.query.taskId];
	var deletedTaskSubscriberList = deletedTask.subscriberList;

	var resultSubscriberList;
	if (deletedTaskSubscriberList!==null)
		resultSubscriberList = subscriberList.concat(deletedTaskSubscriberList.filter(a=>subscriberList.indexOf(a)===-1));
	else
		resultSubscriberList = subscriberList;
	console.log(resultSubscriberList);

	if (deletedTask.visibility) {
		var message = "Task '" + deletedTask.name + "' " + "was deleted!"
		notify(resultSubscriberList, req.user.username, message, io);
	}

//	var newTaskList = req.user.taskList;
	userTaskList.splice(req.query.taskId, 1);
	//console.log(taskList);

	User.updateOne({_id:req.user._id}, {taskList:userTaskList}, function(err, users){
		if(err) return console.log(err);
	});



	res.redirect('/');
}

var socket = require("../socket/socket.js");

scheduleController.editTask = function(req, res) {
	var curUserTaskList = req.user.taskList;
	var editedTaskSubscriberList = curUserTaskList[req.query.editedTask].subscriberList;

	var dateTimeFrom = scheduleController.getDateTime(req.query.dateFrom, req.query.timeFrom);
	var dateTimeTo = scheduleController.getDateTime(req.query.dateTo, req.query.timeTo);

	var editedTask = {"name": (req.query.name==undefined)?"":req.query.name,
					"comment": (req.query.comment==undefined)?"":req.query.comment,
					"dateFrom": req.query.dateFrom,
					"timeFrom": req.query.timeFrom,
					"dateTimeFrom": dateTimeFrom,
					"dateTo": req.query.dateTo,
					"timeTo": req.query.timeTo,
					"dateTimeTo": dateTimeTo,
					"visibility": (req.query.visibility==undefined)?false:true,
					"editable": (req.query.editable==undefined)?false:true,
				"taskNumber":parseInt(req.query.editedTask),
				"subscriberList":(editedTaskSubscriberList==undefined)?new Array():editedTaskSubscriberList};

	var io = socket.getIO();
	var subscriberList = req.user.subscriberList;

	var resultSubscriberList;
	if (editedTaskSubscriberList!==null)
		resultSubscriberList  = subscriberList.concat(editedTaskSubscriberList.filter(a=>subscriberList.indexOf(a)===-1));
	else resultSubscriberList  = subscriberList;
	console.log(resultSubscriberList);

	if (editedTask.visibility) {
		var message = "Task '" + editedTask.name + "' " + "was changed!"
		notify(resultSubscriberList, req.user.username, message, io);
	}

	curUserTaskList[req.query.editedTask] = editedTask;


	User.updateOne({_id:req.user._id}, {taskList:curUserTaskList}, function(err, users){

        if(err) return console.log(err);
    });

    res.redirect('/');
}

scheduleController.getTasks = function(data, /*io*/socket) {

	User.find({$or:[{username:{"$regex":data}}, {name:{"$regex":data}}, {surname:{"$regex":data}}]}, function(err, docs){
	//User.find({username: data}, function(err, docs){
		if(err) return console.log(err);

		for(var user of docs) {

			var taskList = user.taskList;
			var publicTaskList = getPublicTaskList(taskList);
			user.taskList = publicTaskList;
		}
		socket.emit('search', docs);

	});

}

scheduleController.getTaskById = function(username, taskId, socket) {

	User.findOne({username:username}, function(err, user){
	//User.find({username: data}, function(err, docs){
		if(err) return console.log(err);
		var taskList = user.taskList;
		var task = taskList[taskId];
		socket.emit('taskById', task);

	});
}

function notify(subscriberList, from, changeDescription, io) {
	for (let subscriber of subscriberList) {
		io.sockets.emit('changes'+"_"+subscriber, from, changeDescription);
	}
}

scheduleController.subscribe = function(subscribeReceiver, newSubscriber,socket, taskNumber) {
	User.find({username: subscribeReceiver}, function(err, docs){
		if(err) return console.log(err);

		for(var user of docs) {
			if (taskNumber===undefined) {
				var curSubscriberList = user.subscriberList;
				if (curSubscriberList.indexOf(newSubscriber)==-1) {
					curSubscriberList[curSubscriberList.length] = newSubscriber;
					User.updateOne({username:subscribeReceiver}, {subscriberList:curSubscriberList}, function(err, users){
				        if(err) return console.log(err);
				    });
					//	console.log(newSubscriber + " -> " + subscribeReceiver);
					socket.emit('subscribe', subscribeReceiver, newSubscriber, true);
				}
			}
			else {
				var userTaskList = user.taskList;
				//var subscribeReceiverTask = userTaskList[taskNumber];
				var subscribeReceiverTask = userTaskList.find(x=>x.taskNumber===taskNumber);
				var taskSubscriberList = subscribeReceiverTask.subscriberList;
				if (taskSubscriberList.indexOf(newSubscriber)==-1) {
					taskSubscriberList[taskSubscriberList.length] = newSubscriber;

					User.updateOne({username:subscribeReceiver}, {taskList:userTaskList}, function(err, users){

				        if(err) return console.log(err);

				    });
					socket.emit('subscribe', subscribeReceiver, newSubscriber, true, subscribeReceiverTask);
				}
			}
		}
	});

}

scheduleController.unsubscribe = function(unsubscribeReceiver, unsubscribedUser,socket, taskNumber) {

	User.find({username: unsubscribeReceiver}, function(err, docs) {
		if(err) return console.log(err);

		for(var user of docs) {
			if (taskNumber===undefined) {
				var curSubscriberList = user.subscriberList;
				if (curSubscriberList.indexOf(unsubscribedUser)!=-1) {
					curSubscriberList.splice(unsubscribedUser, 1);
					User.updateOne({username:unsubscribeReceiver}, {subscriberList:curSubscriberList}, function(err, users){
							if(err) return console.log(err);

					});
				//	console.log(unsubscribedUser + " <- " + unsubscribeReceiver);
					socket.emit('subscribe', unsubscribeReceiver, unsubscribedUser, false);
				}
			}
			else {
				var userTaskList = user.taskList;
				//var subscribeReceiverTask = userTaskList[taskNumber];
				var subscribeReceiverTask = userTaskList.find(x=>x.taskNumber==taskNumber);
				console.log(subscribeReceiverTask);
				var taskSubscriberList = subscribeReceiverTask.subscriberList;
				if (taskSubscriberList.indexOf(unsubscribedUser)!=-1) {
					taskSubscriberList.splice(unsubscribedUser, 1);
					User.updateOne({username:unsubscribeReceiver}, {taskList:userTaskList}, function(err, users){
							if(err) return console.log(err);

					});
					socket.emit('subscribe', unsubscribeReceiver, unsubscribedUser, false, subscribeReceiverTask);
				}
			}
		}
	});
}


//var io = require("../socket/socket.js");
//var g_socket;
//var g_io;

/*scheduleController.getServer = function(callback) {

	var server = callback();
	var io = require('socket.io')(server);
//	console.log(io);


	io.on('connection', function(socket) {
	//	g_socket = socket;
		g_io = io;
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

	});
}*/





module.exports = scheduleController;
