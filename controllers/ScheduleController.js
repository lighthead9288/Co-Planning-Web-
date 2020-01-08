var mongoose = require("mongoose");
var User = require("../models/User");
var _ = require('lodash');

var scheduleController = {};


scheduleController.extAddTask = function(req, res) {

		var username = req.body.username;
		var newTask = req.body.task;

		User.findOne({username:username}, function(err, user){
			if(err) return console.log(err);
			scheduleController.addTaskCommand(user, newTask);
			res.send("Sucess!!!");
		});
}

scheduleController.extDeleteTask = function(req, res) {

	var username = req.query.username;
	var taskId = req.query.taskId;

	User.findOne({username:username}, function(err, user){
		if(err) return console.log(err);
		scheduleController.deleteTaskCommand(user, taskId);
		res.send("Sucess!!!");
	});

}

scheduleController.extEditTask = function(req, res) {

	var username = req.body.username;
	var task = req.body.task;
	var taskId = req.body.taskId;

	console.log(task);

	User.findOne({username:username}, function(err, user){
		if(err) return console.log(err);
		//var taskId = parseInt(task.editedTask);
		scheduleController.editTaskCommand(user, task, taskId);
		res.send("Sucess!!!");
	});

}

scheduleController.extGetTaskList = function(req, res) {

	var username = req.query.username;
	var dateFrom = req.query.dateFrom;
	var timeFrom = req.query.timeFrom;
	var dateTo = req.query.dateTo;
	var timeTo = req.query.timeTo;
	var taskFilter = req.query.taskFilter;

	var dateTimeFrom = scheduleController.getDateTimeWithoutTimeClarify(dateFrom, timeFrom);
	console.log(dateTimeFrom);
	var dateTimeTo = scheduleController.getDateTimeWithoutTimeClarify(dateTo, timeTo, true);
	console.log(dateTimeTo);

	console.log(username);

	User.findOne({username:username}, function(err, user){
		if(err) return console.log(err);

		var taskList = user.taskList;
		var resTaskList = new Array();
		for(let task of taskList) {
			var curTaskDateTimeFrom = task.dateTimeFrom;

			//filter by dateTime
			var dateTimeIntervalIncluding;

			if ((dateTimeFrom!=undefined)&&(dateTimeTo!=undefined))
				dateTimeIntervalIncluding = ((curTaskDateTimeFrom>=dateTimeFrom)&&(curTaskDateTimeFrom<dateTimeTo));
			else if (dateTimeFrom!=undefined)
				dateTimeIntervalIncluding = (curTaskDateTimeFrom>=dateTimeFrom);
			else if (dateTimeTo!=undefined)
				dateTimeIntervalIncluding = (curTaskDateTimeFrom<=dateTimeTo);
			else break;

			//filter by name
			var taskNameFilterContaining  = true;
			if ((taskFilter!="")&&(taskFilter!=undefined)) {
				if (task.name.toLowerCase().includes(taskFilter.toLowerCase()))
					taskNameFilterContaining = true;
				else
					taskNameFilterContaining = false;
			}

			if ((dateTimeIntervalIncluding)&&(taskNameFilterContaining))
				resTaskList[resTaskList.length] = task;

		}

		//console.log(resTaskList);

		var response = {"username": username, "taskList": resTaskList};

		res.send(response);
	});

}


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
			//	console.log(result); // result - аргумент resolve
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

	var username = req.query.username;
	var dateFrom = req.query.dateFrom;
	var timeFrom = req.query.timeFrom;
	var dateTo = req.query.dateTo;
	var timeTo = req.query.timeTo;
	var dateTimeFrom = scheduleController.getDateTime(dateFrom, timeFrom);
	var dateTimeTo = scheduleController.getDateTime(dateTo, timeTo);

	User.findOne({username:username}, function(err, user){
		if(err) return console.log(err);
		var taskFreeTime = scheduleController.getUserTaskFreeTime(user, dateTimeFrom, dateTimeTo);
		res.send(taskFreeTime);
	});

}

scheduleController.extSetUserUnavailableTime = function(req, res) {

	var unavailableTime = req.body.unavailableTime;
	var username = req.body.username;
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

scheduleController.extGetUserUnavailableTime = function(req, res) {
	var username = req.query.username;

	User.findOne({username: username}, function(err, user){
		if(err) return console.log(err);
		var response;
		if (user!=null)
			response = {"username": username, "unavailableTime": user.unavailableTime};
		else
			response = {"username": username, "unavailableTime": null};
		res.send(response);
	});

}

scheduleController.extSetUserTaskList = function(req, res) {

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
							"completed" : task.completed,
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
		console.log("Date:");
		console.log(date);
		console.log("Time:");
		console.log(time);
		if ((date!="")&&(time!="")&&(date!=undefined)&&(time!=undefined)) {
			var dateParts = date.split("-");
			var timeParts = time.split(":");
			var dateTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1]);
		//	console.log(time);
			return dateTime;
		}
		else return undefined;
		/*try {
			var dateParts = date.split("-");
			var timeParts = time.split(":");
			var dateTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1]);

			return dateTime;
		} catch (e) {
				return undefined;

		} finally {
		}*/

	}

	scheduleController.getDateTimeWithoutTimeClarify = function(date, time, toUpperTimeBorder) {
		if ((date!="")&&(date!=undefined)) {
			var dateParts = date.split("-");

			var timeParts;
			var dateTime;
			if ((time!="")&&(time!=undefined)) {
				timeParts = time.split(":");
				dateTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1]);
			}
			else {
				if (toUpperTimeBorder)
					dateTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], 23, 59);
				else
					dateTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], 0, 0);
			}

			return dateTime;
		}
		else return undefined;

	}


	scheduleController.setUserUnavailableTime = function(username, unavailableTime) {
		var customIntervals = unavailableTime.custom;
		var resultCustomIntervalsArray = new Array();
		for(var intervals of customIntervals) {
			console.log(intervals);

			var customDateTimeFrom = scheduleController.getDateTime(intervals.dateFrom, intervals.timeFrom);
			var customDateTimeTo = scheduleController.getDateTime(intervals.dateTo, intervals.timeTo);
			console.log(customDateTimeFrom);
			console.log(customDateTimeTo);

			if ((customDateTimeFrom!=undefined)&&(customDateTimeTo!=undefined))
	        resultCustomIntervalsArray[resultCustomIntervalsArray.length] = {"from": customDateTimeFrom, "to": customDateTimeTo};

		}
		console.log("Result array:");
		console.log(resultCustomIntervalsArray);

		if ((resultCustomIntervalsArray.length==0)&&(customIntervals.length!=0)) return;

		unavailableTime.custom = resultCustomIntervalsArray;

		User.updateOne({username:username}, {unavailableTime:unavailableTime}, function(err, user){
					if(err) return console.log(err);
					console.log(user);
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

		var dateTimeFromYear = dateTimeFrom.getFullYear();
		var dateTimeFromMonth = dateTimeFrom.getMonth();
		var dateTimeFromDay = dateTimeFrom.getDate();
		var dateTimeFromHours = dateTimeFrom.getHours();
		var dateTimeFromMinutes = dateTimeFrom.getMinutes();

		var curDate = dateTimeFrom;

		curDate.setHours(dateTimeTo.getHours());
		curDate.setMinutes(dateTimeTo.getMinutes());
		curDate.setDate(dateTimeFrom.getDate()-1);


		while (curDate<dateTimeTo) {

			var curDateTimeFrom;
			var curDateTimeTo;

			var customUserIntervals = user.unavailableTime.custom;
			var isCustomIntervalFounded = false;
			var unavailableIntervalTask;
			for(var customInterval of customUserIntervals) {
				var customIntervalDate = getDateValue(customInterval.from);
				var cd = getDateValue(curDate);
				isCustomIntervalFounded = (customIntervalDate==cd);
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

			}

			//Извращенным способом возвращаем старую левую границу интервала сопоставления
			dateTimeFrom.setFullYear(dateTimeFromYear);
			dateTimeFrom.setMonth(dateTimeFromMonth);
			dateTimeFrom.setDate(dateTimeFromDay);
			dateTimeFrom.setHours(dateTimeFromHours);
			dateTimeFrom.setMinutes(dateTimeFromMinutes);

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


	scheduleController.getReportIntervals = async function(userNames, dateTimeFrom, dateTimeTo, socket, username) {
		var usersFreeTimeArray = new Array();
		var reportTimesArray = new Array();
		var users = new Array();
		var usersFindingWasCompleted = false;
		for (var userName of userNames) {
			await User.findOne({username: userName}, function(err, user){
				if(err) return console.log(err);
				users[users.length] = user;
				usersFindingWasCompleted = (userNames.indexOf(userName)==userNames.length-1);
			//	console.log("Completed: " + usersFindingWasCompleted);
			});
		}

	//	console.log(userNames);
	//	console.log(dateTimeFrom);
	//	console.log(dateTimeTo);

		if (usersFindingWasCompleted) {
			for (var user of users) {
				var curUserFreeTimeArray = scheduleController.getUserTaskFreeTime(user, dateTimeFrom, dateTimeTo);
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

				if (curDateTimeTo<=dateTimeTo) {

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

			if (username!==undefined) {
					console.log("Saving search data for user '" + username +"' ..." );
					scheduleController.addSearch(username, dateTimeFrom, dateTimeTo, userNames, socket);
			}


		}

	 	return reportIntervalsArray;

	}


//var socket = require("../socket/socket.js");

scheduleController.addTask = function(req, res) {
	var user = req.user;
	var newTask = req.query;

	scheduleController.addTaskCommand(user, newTask);
	res.redirect('/');
}

scheduleController.addTaskCommand = function(user, task) {
	var curUserTaskList = user.taskList;

	var dateTimeFrom = scheduleController.getDateTime(task.dateFrom, task.timeFrom);
	var dateTimeTo = scheduleController.getDateTime(task.dateTo, task.timeTo);

	var maxNumberInTaskList = getMaxNumberInTaskList(curUserTaskList);
	var newTask = {"name": (task.name==undefined)?"":task.name,
					"comment": (task.comment==undefined)?"":task.comment,
					"dateFrom": task.dateFrom,
					"timeFrom": task.timeFrom,
					"dateTimeFrom": dateTimeFrom,
					"dateTo": task.dateTo,
					"timeTo": task.timeTo,
					"dateTimeTo": dateTimeTo,
					"visibility": ((task.visibility==undefined)||(task.visibility==false))?false:true,
					"editable": ((task.editable==undefined)||(task.editable==false))?false:true,
					"completed": ((task.completed==undefined)||(task.completed==false))?false:true,
					"taskNumber":maxNumberInTaskList+1,
					"subscriberList":new Array()};

	curUserTaskList[curUserTaskList.length] = newTask;

	var io = socket.getIO();
	var subscriberList = user.subscriberList;

	if (newTask.visibility) {
		var message = "Task '" + newTask.name + "' " + "was added!"
		var shortTask = scheduleController.getShortTask(newTask);
		notify(subscriberList, user.username, message, shortTask, io);
	}


	User.updateOne({_id:user._id}, {taskList:curUserTaskList}, function(err, users){

        if(err) return console.log(err);
    });
}

scheduleController.deleteTask = function(req, res) {
	var user = req.user;
	var taskId = req.query.taskId;

	scheduleController.deleteTaskCommand(user, taskId);
	res.redirect('/');
}

scheduleController.deleteTaskCommand = function(user, taskId) {
	var io = socket.getIO();
	var subscriberList = user.subscriberList;
	var userTaskList = user.taskList;
	//var deletedTask = userTaskList[taskId];
	console.log(taskId);
	var deletedTask;
	for (task of userTaskList) {
		if (task.taskNumber==taskId) {
			deletedTask = task;
			console.log(deletedTask);
			break;
		}
	}



	var deletedTaskSubscriberList = deletedTask.subscriberList;

	var resultSubscriberList;
	if (deletedTaskSubscriberList!==null)
		resultSubscriberList = subscriberList.concat(deletedTaskSubscriberList.filter(a=>subscriberList.indexOf(a)===-1));
	else
		resultSubscriberList = subscriberList;
	console.log(resultSubscriberList);

	if (deletedTask.visibility) {
		var message = "Task '" + deletedTask.name + "' " + "was deleted!"
		notify(resultSubscriberList, user.username, message, null, io);
	}


//	var newTaskList = req.user.taskList;
//	userTaskList.splice(taskId, 1);
	userTaskList = userTaskList.filter(task=>task.taskNumber!=taskId);
	console.log(userTaskList);

	User.updateOne({_id:user._id}, {taskList:userTaskList}, function(err, users){
		if(err) return console.log(err);
	});
}

var socket = require("../socket/socket.js");

scheduleController.editTask = function(req, res) {
	var user = req.user;
	var task = req.query;
	var taskId = parseInt(task.editedTask);

	scheduleController.editTaskCommand(user, task, taskId);
  res.redirect('/');
}

scheduleController.editTaskCommand = function(user, task, taskId) {

	var curUserTaskList = user.taskList;
//	var taskId = parseInt(task.editedTask);

	var editedTask;
	var index;
	for (let task of curUserTaskList) {
		if (task.taskNumber==taskId) {
			editedTask = task;
			index = curUserTaskList.indexOf(task);
			console.log(index);
			break;
		}
	}

	console.log(editedTask);
	var editedTaskSubscriberList = editedTask.subscriberList;
//	var editedTaskSubscriberList = curUserTaskList[task.editedTask].subscriberList;

	var dateTimeFrom = scheduleController.getDateTime(task.dateFrom, task.timeFrom);
	var dateTimeTo = scheduleController.getDateTime(task.dateTo, task.timeTo);

	var editedTask = {"name": (task.name==undefined)?"":task.name,
					"comment": (task.comment==undefined)?"":task.comment,
					"dateFrom": task.dateFrom,
					"timeFrom": task.timeFrom,
					"dateTimeFrom": dateTimeFrom,
					"dateTo": task.dateTo,
					"timeTo": task.timeTo,
					"dateTimeTo": dateTimeTo,
					"visibility": ((task.visibility==undefined)||(task.visibility==false))?false:true,
					"editable": ((task.editable==undefined)||(task.editable==false))?false:true,
					"completed": ((task.completed==undefined)||(task.completed==false))?false:true,
				"taskNumber":taskId,
				"subscriberList":(editedTaskSubscriberList==undefined)?new Array():editedTaskSubscriberList};

	var io = socket.getIO();
	var subscriberList = user.subscriberList;

	var resultSubscriberList;
	if (editedTaskSubscriberList!==null)
		resultSubscriberList  = subscriberList.concat(editedTaskSubscriberList.filter(a=>subscriberList.indexOf(a)===-1));
	else resultSubscriberList  = subscriberList;

	var oldTask = curUserTaskList[index];
	curUserTaskList[index] = editedTask;
	var difference = scheduleController.compareTasks(oldTask, editedTask);
	console.log(difference);


	if ((editedTask.visibility)&&(!(_.isEmpty(difference)))) {
		var message = "Task '" + editedTask.name + "' " + "was changed!"
		notify(resultSubscriberList, user.username, message, difference, io);
	}


	User.updateOne({_id:user._id}, {taskList:curUserTaskList}, function(err, users){
				console.log("Edit completed!");
        if(err) return console.log(err);
    });
}


scheduleController.compareTasks = function(oldTask, newTask) {
	var difference = {};

	if (oldTask.name!=newTask.name)
		difference.name = oldTask.name + "->" + newTask.name;
	if (oldTask.comment!=newTask.comment)
		difference.comment = oldTask.comment + "->" + newTask.comment;
	if ((oldTask.dateFrom!=newTask.dateFrom)||(oldTask.timeFrom!=newTask.timeFrom))
		difference.dateTimeFrom = ((oldTask.dateTimeFrom==null)?"??":oldTask.dateTimeFrom) + "->" + ((newTask.dateTimeFrom==null)?"??":newTask.dateTimeFrom);
	if ((oldTask.dateTo!=newTask.dateTo)||(oldTask.timeTo!=newTask.timeTo))
		difference.dateTimeTo = ((oldTask.dateTimeTo==null)?"??":oldTask.dateTimeTo) + "->" + ((newTask.dateTimeTo==null)?"??":newTask.dateTimeTo);

	return difference;
}

scheduleController.getShortTask = function(fullTask) {
	var shortTask = {};

	if (fullTask.name!=null)
		shortTask.name = fullTask.name;
	if (fullTask.comment!=null)
		shortTask.comment = fullTask.comment;
	if (fullTask.dateTimeFrom!=null)
		shortTask.dateTimeFrom = fullTask.dateTimeFrom;
	if (fullTask.dateTimeTo!=null)
		shortTask.dateTimeTo = fullTask.dateTimeTo;

	return shortTask;
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

scheduleController.getNotifications = function(username, socket) {

	User.findOne({username:username}, function(err, user){
		if(err) return console.log(err);
		var reversedNotificationsList = user.notificationsList.reverse();
		console.log(reversedNotificationsList);
		socket.emit('notifications', reversedNotificationsList);
	});
}

scheduleController.changeNotificationStatus = function(username, unreadNotifications) {
	User.findOne({username:username}, function(err, user){
		if(err) return console.log(err);
		var notifications = user.notificationsList;

		if (notifications==null) return;

		if (unreadNotifications==null) return;

		for (unreadNotification of unreadNotifications) {

				var dateTime = unreadNotification.dateTime;

				var changedNotification = notifications.find(x=>x.dateTime==dateTime);
				console.log(changedNotification);
				var indexOfChanged = notifications.indexOf(changedNotification);
				/*notifications[indexOfChanged] = {"dateTime": changedNotification.dateTime,
																				"receiver": changedNotification.receiver,
																				"sender": changedNotification.sender,
																				"description": changedNotification.description,
																				"additionalInfo": changedNotification.additionalInfo,
																				"status": true};*/

				notifications[indexOfChanged].status = true;

				User.updateOne({username: username}, {notificationsList:notifications}, function(err, users) {
																							console.log("Notification status was changed!");
																			        if(err) return console.log(err);
																			    });
		}

	});

}

function notify(subscriberList, from, changeDescription, additionalInfo, io) {
	for (let subscriber of subscriberList) {
		var curDate = new Date();
		io.sockets.emit('changes'+"_"+subscriber, from, changeDescription, curDate.toISOString(), additionalInfo);
		saveNotification(subscriber, from, changeDescription, curDate.toISOString(), additionalInfo);
	}
}

function saveNotification(receiver, sender, description, curDate, additionalInfo) {
	User.findOne({username:receiver}, function(err, user){
		if(err) return console.log(err);

		var notifications = user.notificationsList;

		console.log(curDate);

		var newNotification = {"dateTime": curDate, "receiver": receiver, "sender": sender, "description": description, "status": false, "additionalInfo": additionalInfo};
		notifications[notifications.length] = newNotification;

		var resultNotificationsList;
		if (notifications.length>10)
			resultNotificationsList = notifications.slice(notifications.length - 10);
		else
			resultNotificationsList = notifications;

		User.updateOne({username: receiver}, {notificationsList: resultNotificationsList}, function(err, user) {

			if(err) return console.log(err);

			console.log("Notification saving...")
			console.log(receiver);
			console.log(resultNotificationsList);
			console.log(user);


		});

	});
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

scheduleController.getUserSearchesList = function(username, socket) {
	User.findOne({username: username}, function(err, user) {
				if(err) return console.log(err);

				var searchesList = user.searchesList;
				if ((searchesList!=null)&&(searchesList.length!=0)) {
					for (var search in searchesList) {
					/*	var dateTimeFrom = search.dateTimeFrom;
						var dateTimeTo = search.dateTimeTo;
						var participantsList = search.participantsList;*/
						console.log(search);
					}
					socket.emit('getUserSearchesList', searchesList.reverse());
				}

				else
					socket.emit('getUserSearchesList', null);
	});
}

scheduleController.addSearch = function(username, dateTimeFrom, dateTimeTo, participantsList, socket) {
	User.findOne({username: username}, function(err, user) {
				if(err) return console.log(err);

				var searchesList = user.searchesList;
				var newSearch = {"dateTimeFrom": dateTimeFrom, "dateTimeTo": dateTimeTo, "participantsList": participantsList};

				var newSearchesList = ((searchesList==undefined)||(searchesList==null))?new Array():searchesList;
				newSearchesList[newSearchesList.length] = newSearch;

				var resultSearchesList;
				if (newSearchesList.length>10)
					resultSearchesList = newSearchesList.slice(newSearchesList.length - 10);
				else
					resultSearchesList = newSearchesList;

				User.updateOne({username:username}, {searchesList:resultSearchesList}, function(err, user) {
							if(err) return console.log(err);

					//		console.log("Changed user: ");
					//		console.log(user);
							console.log(resultSearchesList);
							console.log("Saving was finished!");


					});
					socket.emit('getUserSearchesList', resultSearchesList.reverse());
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
