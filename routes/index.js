var express = require('express');
var router = express.Router();
var auth = require("../controllers/AuthController.js");
var schedule = require("../controllers/ScheduleController.js");

// restrict index for logged in user only
router.get('/', auth.home);

// route to register page
router.get('/register', auth.register);

// route for register action
router.post('/register', auth.doRegister);

// route to login page
router.get('/login', auth.login);

// route for login action
router.post('/login', auth.doLogin);

// route for logout action
router.get('/logout', auth.logout);

//add task to schedule
router.get('/addTask', schedule.addTask);

//delete task from schedule
router.get('/deleteTask', schedule.deleteTask);

//edit task
router.get('/editTask', schedule.editTask);

//subscribe on user
router.get('/subscribe', schedule.subscribe);

//unsubscribe from user
router.get('/unsubscribe', schedule.unsubscribe);


router.get('/api/extGetUserTaskList', schedule.extGetTaskList);

router.post('/api/extAddTask', schedule.extAddTask);

router.post('/api/extDeleteTask', schedule.extDeleteTask);

router.post('/api/extEditTask', schedule.extEditTask);

router.get('/api/extGetReportIntervals', schedule.extGetReportIntervals);

router.get('/api/extGetUserTaskFreeTime', schedule.extGetUserTaskFreeTime);

router.post('/api/extSetUserUnavailableTime', schedule.extSetUserUnavailableTime);

router.get('/api/extGetUserUnavailableTime', schedule.extGetUserUnavailableTime);

router.post('/api/extSetUserTaskList', schedule.extSetUserTaskList);

router.post('/api/extRegister', auth.extRegister);

router.post('/api/extLogin', auth.extLogin);

router.post('/api/extLogout', auth.extLogout);

//get all users
router.get('/api/getAllUsers', schedule.getAllUsers);

//get user by id
router.get('/api/getUserById/:id', schedule.getUserById);

module.exports = router;
