/*import React from 'react';
import ReactDOM from 'react-dom';*/

var user = JSON.parse(
    $('#userMeta meta').attr('data-userJSON')
  )
  console.log(user);


/*ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('taskList')
);*/

document.addEventListener('DOMContentLoaded', function () {
  var user = GetCurUser();
  socket.emit('getUserSearchesList', user);
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  });

function OpenModal(operation, tName, tComment, tDateFrom, tTimeFrom, tDateTo, tTimeTo, tVisibility, tEditable, tNumber){
  if (operation=="/editTask") {
    document.getElementById('name').value = tName;
    document.getElementById('comment').value = tComment;
    document.getElementById('dateFrom').value = tDateFrom;
    document.getElementById('timeFrom').value = tTimeFrom;
    document.getElementById('dateTo').value = tDateTo;
    document.getElementById('timeTo').value = tTimeTo;
  /*  document.getElementById('visibility').checked = (tVisibility=="true")?"true":undefined;
    document.getElementById('editable').checked = (tEditable=="true")?"true":undefined;*/
    document.getElementById('visibility').checked = (tVisibility==true)?"true":undefined;
    document.getElementById('editable').checked = (tEditable==true)?"true":undefined;
    document.getElementById('editedTask').value = tNumber;
    }
    else {
      document.getElementById('name').value = ""
      document.getElementById('comment').value = "";
      document.getElementById('dateFrom').value = undefined;
      document.getElementById('timeFrom').value = undefined;
      document.getElementById('dateTo').value = undefined;
      document.getElementById('timeTo').value = undefined;
      document.getElementById('visibility').checked = undefined;
      document.getElementById('editable').checked = undefined;
    }
    document.getElementById('modalTaskForm').style.display='block';
    document.getElementById('taskOperation').action = operation;

  }

  function OpenUnavailableTimeEditModal() {
    var curUser = GetCurUser();
    socket.emit('unavailableTime', curUser);

  }


  function FillUnavailableTimeForm(unavailableTime) {
    console.log(unavailableTime);
    unavailableCustomIntervalsNumbers = [];

    var unavailableTimeDiv = document.getElementById('unavailableTime');
    unavailableTimeDiv.innerHTML='<h3>Default unavailable time:</h3>';
    console.log(unavailableTime);
    unavailableTimeDiv.innerHTML+='<div class="unavailableTime" style="border: 4px solid grey;"><input type="time" name="defaultTimeFrom" id="defaultTimeFrom" style="border: 2px solid black;" value='
    +unavailableTime.default.from+'>'+ '<input type="time" name="defaultTimeTo" id="defaultTimeTo" style="border: 2px solid black;" value=' + unavailableTime.default.to + '></div>';
    unavailableTimeDiv.innerHTML+='<h3>Custom unavailable dates and times:</h3>';
    //unavailableTimeDiv.innerHTML+='<button type="button" onclick="AddCustomUnavailableInterval()">Add custom unavailable dates and times</button>';
    unavailableTimeDiv.innerHTML+='<img src="add.png" class="singleButton" alt="Add custom unavailable dates and times" title="Add custom unavailable dates and times"'+
    ' onclick="AddCustomUnavailableInterval()"></img>'
    unavailableTimeDiv.innerHTML+='<br>';
    unavailableTimeDiv.innerHTML+='<br>';

    for(let i=0;i<unavailableTime.custom.length;i++) {
      var year = new Date(unavailableTime.custom[i].from).getFullYear().toString();
      var month = (new Date(unavailableTime.custom[i].from).getMonth()+1).toString();
      console.log(month);
      month = (month.length>1)?month:"0"+month;
      var day = new Date(unavailableTime.custom[i].from).getDate().toString();
      day = (day.length>1)?day:"0"+day;
      var localDateFromString = year+"-"+month+"-"+day;

      var hours = new Date(unavailableTime.custom[i].from).getHours().toString();
      hours = (hours.length>1)?hours:"0"+hours;
      var minutes = new Date(unavailableTime.custom[i].from).getMinutes().toString();
      minutes = (minutes.length>1)?minutes:"0"+minutes;
      var localTimeFromString = hours+":"+minutes;

      year = new Date(unavailableTime.custom[i].to).getFullYear().toString();
      month = (new Date(unavailableTime.custom[i].to).getMonth()+1).toString();
      month = (month.length>1)?month:"0"+month;
      day = new Date(unavailableTime.custom[i].to).getDate().toString();
      day = (day.length>1)?day:"0"+day;
      var localDateToString = year+"-"+month+"-"+day;

      hours = new Date(unavailableTime.custom[i].to).getHours().toString();
      hours = (hours.length>1)?hours:"0"+hours;
      minutes = new Date(unavailableTime.custom[i].to).getMinutes().toString();
      minutes = (minutes.length>1)?minutes:"0"+minutes;
      localTimeToString = hours+":"+minutes;

      var newElement = '<div class="unavailableTime" style="border: 4px solid grey;" id=unavailableCustomInterval_'+i+'><table><tr><td align="center" width="100%">'+
              '<input type="date" style="border: 2px solid black;" value='+localDateFromString+ ' id=unavailableCustomDateFrom_' + i + '>'+
              '<input type="time" style="border: 2px solid black;" value='+localTimeFromString+' id=unavailableCustomTimeFrom_' + i + '>'+
              '<input type="date" style="border: 2px solid black;" value='+localDateToString+ ' id=unavailableCustomDateTo_' + i + '>'+
              '<input type="time" style="border: 2px solid black;" value='+localTimeToString+' id=unavailableCustomTimeTo_' + i + '>'+ '</td>'+
              '<td align="center"><img src="delete_small.png" class="close" id=unavailableCustomIntervalDelete_'+i+' onclick=DeleteCustomUnavailableInterval(this.id)></td>'+
              '</tr></table></div>';
      unavailableTimeDiv.innerHTML+= newElement;
      unavailableCustomIntervalsNumbers[unavailableCustomIntervalsNumbers.length] = i;



    }
    console.log(unavailableCustomIntervalsNumbers);
  }

  var unavailableCustomIntervalsNumbers = [];


  function DeleteCustomUnavailableInterval(id) {
    var idParts = id.split("_");
    var intervalNumber = idParts[1];
    var unavailableCustomInterval = document.getElementById("unavailableCustomInterval_"+intervalNumber);
    var unavailableTimeDiv = document.getElementById('unavailableTime');
    unavailableTimeDiv.removeChild(unavailableCustomInterval);

    var index = unavailableCustomIntervalsNumbers.indexOf(parseInt(intervalNumber, 10));
    if (index !== -1)
      unavailableCustomIntervalsNumbers.splice(index, 1);
    console.log(unavailableCustomIntervalsNumbers);
  }

  function AddCustomUnavailableInterval() {
    var unavailableTime = document.getElementById('unavailableTime');

    var newDiv = document.createElement('div');
    newDiv.className = "unavailableTime";
    var number = (unavailableCustomIntervalsNumbers.length!==0)?Math.max.apply(null, unavailableCustomIntervalsNumbers) + 1:0;
    newDiv.style=style="border: 4px solid grey;"
    newDiv.id="unavailableCustomInterval_" + number;
    newDiv.innerHTML = '<table><tr><td width=100% align="center">'+
    '<input type="date" style="border: 2px solid black;" id=unavailableCustomDateFrom_'+number+'>'+
    '<input type="time" style="border: 2px solid black;" id=unavailableCustomTimeFrom_'+number+'>'+
    '<input type="date" style="border: 2px solid black;" id=unavailableCustomDateTo_'+number+'>'+
    '<input type="time" style="border: 2px solid black;" id=unavailableCustomTimeTo_'+number+'>'+
    '</td><td align="center">'+
    '<img src="delete_small.png" class="close" id=unavailableCustomIntervalDelete_'+number+' onclick=DeleteCustomUnavailableInterval(this.id)></td></tr></table>';
    unavailableCustomIntervalsNumbers[unavailableCustomIntervalsNumbers.length] = number;

    unavailableTime.appendChild(newDiv);

//		console.log(unavailableCustomIntervalsNumbers);
  }

  function SaveUnavailableTime() {
    var unavailableTime;
    var defaultTimeFrom = document.getElementById('defaultTimeFrom').value;
    var defaultTimeTo = document.getElementById('defaultTimeTo').value;

  //	console.log("Default:" +  defaultTimeFrom + " - " + defaultTimeTo);

  //	console.log("Custom: ");
    unavailableTime = {"default":{"from":defaultTimeFrom, "to":defaultTimeTo}, "custom":[]};
  //	console.log(unavailableTime);
    var customIntervalsArray = [];
    for(let number of unavailableCustomIntervalsNumbers) {
      var customDateFrom = document.getElementById("unavailableCustomDateFrom_"+number).value;
      var customTimeFrom = document.getElementById("unavailableCustomTimeFrom_"+number).value;
      var customDateTo = document.getElementById("unavailableCustomDateTo_"+number).value;
      var customTimeTo = document.getElementById("unavailableCustomTimeTo_"+number).value;
      customIntervalsArray[customIntervalsArray.length] = {"dateFrom": customDateFrom, "timeFrom": customTimeFrom, "dateTo": customDateTo, "timeTo": customTimeTo};
    }
    unavailableTime.custom = customIntervalsArray;

    //console.log(JSON.stringify(unavailableTime));

    var curUser = GetCurUser();
    socket.emit('unavailableTime', curUser, unavailableTime);

    document.getElementById('modalUnavailableTimeEdit').style.display='none';

  }

  var socket = io.connect('http://localhost:3000');
  socket.on('unavailableTime', function(data) {
    FillUnavailableTimeForm(data);
    document.getElementById('modalUnavailableTimeEdit').style.display='block';
  });


  socket.on('search', function(data) {
    //var obj = JSON.parse(data);
    var foundedUsersList = document.getElementById('foundedUsersList');
    foundedUsersList.innerHTML='';



    console.log(data);
    for(let user of data){

      var subscriberList = user.subscriberList;
      var curUserId = GetCurUser();

      console.log(user.username);
      var newUserDiv = document.createElement('div');
      foundedUsersList.appendChild(newUserDiv);
      newUserDiv.className = "foundedUser";


      var buttonsPanel = document.createElement('div');
      buttonsPanel.className="buttonsPanel";
      buttonsPanel.style="position:absolute; top:0; right:0; width:200px;";


      if (user.username!=curUserId) {
        newUserDiv.innerHTML += '<h3 align="center">' + user.username  + '</h3>';


        if (subscriberList.indexOf(curUserId)==-1)
          //newUserDiv.innerHTML +='<button type="button" id="subscribeButton_'+user.username+'" onclick="Subscribe(this.id)" data-user="'+user.username+'">' + "Subscribe on schedule" + '</button>';
          buttonsPanel.innerHTML += '<img src="subscribe_on.png" alt="Subscribe" hspace="1" id="subscribeButton_'+user.username
          +'" onclick="Subscribe(this.id)" align="right" title="Subscribe on schedule" data-user="'+user.username+'"></img>';
        else
          //newUserDiv.innerHTML +='<button type="button" id="subscribeButton_'+user.username+'" onclick="Unsubscribe(this.id)" data-user="'+user.username+'">' + "Unsubscribe from schedule" + '</button>';
          buttonsPanel.innerHTML += '<img src="subscribe_off.png" alt="Unsubscribe" hspace="1" id="subscribeButton_'+user.username
          +'" onclick="Unsubscribe(this.id)" align="right" title="Unsubscribe on schedule" data-user="'+user.username+'"></img>';

      //  newUserDiv.innerHTML += '<br>';
      }

      var curUserInMapping = document.getElementById("mappingElement_"+user.username);
      if (curUserInMapping==null)
      //  newUserDiv.innerHTML +='<button type="button" id='+'toMapping_'+user.username+' onclick="ToMapping(this.id)">' + "Add to mapping" + '</button>';
        buttonsPanel.innerHTML +=' <img src="add_to_mapping.png" alt="Add to mapping" hspace="2" id=toMapping_'+user.username
        +' onclick="ToMapping(this.id)" align="right" title="Add to mapping"></img>';
      else
        //newUserDiv.innerHTML +='<button type="button" id='+'toMapping_'+user.username+' onclick="RemoveFromMapping(this.id)">' + "Remove from mapping" + '</button>';
        buttonsPanel.innerHTML +=' <img src="remove_from_mapping.png" alt="Remove from mapping" hspace="2" id=toMapping_'+user.username
        +' onclick="RemoveFromMapping(this.id)" align="right" title="Remove from mapping"></img>';

      newUserDiv.appendChild(buttonsPanel);

      var taskListDiv = document.createElement('div');
      //taskListDiv.style.visibility = "hidden";
      taskListDiv.id = "tasks_" + user.username;

      newUserDiv.innerHTML += '<br>';
    //  newUserDiv.innerHTML += '<a onClick="ChangeCurUserTaskListVisibility('+taskListDiv.id+')">Tasks</a>';


      for(let i=0;i<user.taskList.length;i++) {
        var newTaskDiv = document.createElement('div');
        newTaskDiv.className="miniTaskBox";

        var task = user.taskList[i];
        var taskSubscriberList = task.subscriberList;
        newTaskDiv.innerHTML += '<br>';
        newTaskDiv.innerHTML+='<table class="taskTable" border="3" cellpadding="5" width="100%" bordercolor="black">';
        newTaskDiv.innerHTML+='<tr>'  + '<td>'+ "Name: "+ task.name +  '</td>'+'</tr>';
        newTaskDiv.innerHTML+='<br>';
        if (comment!=="") {
          newTaskDiv.innerHTML+='<tr>' + '<td>'+ "Comment: "+task.comment + '</td>'+'</tr>';
          newTaskDiv.innerHTML+='<br>';
        }
        newTaskDiv.innerHTML+='<tr>' + '<td>'+ "From: " + task.dateFrom + ", " + task.timeFrom + '</td>'+'</tr>';
        newTaskDiv.innerHTML+='<br>';
        newTaskDiv.innerHTML+='<tr>' + '<td>'+ "To: " + task.dateTo + ", " + task.timeTo + '</td>'+'</tr>';
        newTaskDiv.innerHTML+='<br>';
      /*  document.getElementById('foundedUsersList').innerHTML+='<tr>' + '<td>'+ "Editable: " +  task.editable + '</td>'+'</tr>';
        document.getElementById('foundedUsersList').innerHTML+='<br>';
        document.getElementById('foundedUsersList').innerHTML+='<tr>' + '<td>'+ "Visibility: " + task.visibility + '</td>'+'</tr>';
        document.getElementById('foundedUsersList').innerHTML+='<br>';*/


        if ((user.username!=curUserId)) {
          if (taskSubscriberList.indexOf(curUserId)==-1)
            //newTaskDiv.innerHTML +='<button type="button" id='+'subscribeButton_'+user.username+'_' + task.taskNumber + ' onclick="Subscribe(this.id)" data-user="'
            //+user.username+'" data-taskNumber="'+task.taskNumber+'">' + "Subscribe on task" + '</button>';
            newTaskDiv.innerHTML +='<img src="subscribe_on.png" class="singleButton" alt="Subscribe" hspace="1" id="subscribeButton_'+user.username+'_' + task.taskNumber
            +'" onclick="Subscribe(this.id)" align="center" title="Subscribe on task" data-user="'+user.username+'" data-taskNumber="'+task.taskNumber
            +'" style="position:absolute; top:1px; right:1px; width:20px;"></img>';
          else
          //  newTaskDiv.innerHTML +='<button type="button" id='+'subscribeButton_'+user.username+'_' + task.taskNumber + ' onclick="Unsubscribe(this.id)" data-user="'
          //+user.username+'" data-taskNumber="'+task.taskNumber+'">' + "Unsubscribe from task" + '</button>';
            newTaskDiv.innerHTML +='<img src="subscribe_off.png" class="singleButton" alt="Unsubscribe" hspace="1" id="subscribeButton_'+user.username+'_' + task.taskNumber
            +'" onclick="Unsubscribe(this.id)" align="center" title="Unsubscribe from task" data-user="'+user.username+'" data-taskNumber="'+task.taskNumber
            +'" style="position:absolute; top:1px; right:1px; width:20px;"></img>';

        }
        newTaskDiv.innerHTML+='</table>';
        newTaskDiv.innerHTML+='<br>';

        taskListDiv.appendChild(newTaskDiv);
        taskListDiv.innerHTML+='<br>';

      }
      newUserDiv.appendChild(taskListDiv);

      foundedUsersList.innerHTML+='<br>';
    /*  newUserDiv.innerHTML+='<br>';
      newUserDiv.innerHTML+="____________________________";
      newUserDiv.innerHTML+='<br>';*/
    }


  });

  function ChangeCurUserTaskListVisibility(element) {
    if (element.style.visibility=="hidden")
      element.style.visibility = "visible";
    else
      element.style.visibility = "hidden";
  }

  socket.on('getUserSearchesList', function(searchesList) {
    console.log(searchesList);
  });

  socket.on('subscribe', function(subscribeReceiver, newSubscriber, event, task) {
    if (task===undefined) {
      var eventView = event?" subscribed on ":" unsubscribed from ";
      console.log(newSubscriber + eventView + subscribeReceiver);

      let id = 'subscribeButton_'+subscribeReceiver;
      var subscribeButton = document.getElementById(id);
      if (event) {
        subscribeButton.onclick = function() { Unsubscribe(id) };
      //  subscribeButton.textContent = "Unsubscribe from schedule";
        subscribeButton.src="subscribe_off.png";
        subscribeButton.alt="Unsubscribe";
        subscribeButton.title = "Unsubscribe from schedule";
      }
      else {
        subscribeButton.onclick = function() { Subscribe(id) };
        //subscribeButton.textContent = "Subscribe on schedule";
        console.log("dsfsfdsfsf");
        subscribeButton.src="subscribe_on.png";
        subscribeButton.alt="Subscribe";
        subscribeButton.title = "Subscribe on schedule";
      }
    }
    else {
      var eventView = event?" subscribed on ":" unsubscribed from ";
      console.log(newSubscriber + eventView + subscribeReceiver + "'s task " +"'"+ task.name + "'");

      let id = 'subscribeButton_'+subscribeReceiver+"_"+task.taskNumber;
      var subscribeButton = document.getElementById(id);
      if (event) {
        subscribeButton.onclick = function() { Unsubscribe(id) };
      //  subscribeButton.textContent = "Unsubscribe from task";
        subscribeButton.src="subscribe_off.png";
        subscribeButton.alt="Unsubscribe";
        subscribeButton.title = "Unsubscribe from task";
      }
      else {
        subscribeButton.onclick = function() { Subscribe(id) };
        //subscribeButton.textContent = "Subscribe on task";
        subscribeButton.src="subscribe_on.png";
        subscribeButton.alt="Subscribe";
        subscribeButton.title = "Subscribe on task";
      }
    }
  });

  socket.on('changes'+"_"+document.getElementById('curUserId').textContent, function(from, changeDescription, curDate) {
    console.log("From user " + from + ": " + changeDescription);
    //console.log("Current user is " + document.getElementById('curUserId').textContent);

    if (!Notification) {
      alert('Desktop notifications not available in your browser. Try Chromium.');
    }
    if (Notification.permission !== "granted")
      Notification.requestPermission();
    else
      var notification = new Notification('From user ' + from, { body: changeDescription, dir: 'auto'});

    var searchInput = document.getElementById('searchInput');
    Search(searchInput);
  });

  socket.on('mapping', function(data) {
    var mappingResults = document.getElementById('MappingResults');
    mappingResults.innerHTML = "";
    var mapResultsArray = data;
    console.log(data);
    console.log(data.length);
    var mapResultsAmount = mapResultsArray.length;
    if (mapResultsAmount>0) {
      mappingResults.innerHTML += '<h3>' + "Results:"+'</h3>';
      mappingResults.innerHTML +='<br>';

      for(var i=mapResultsAmount;i>0;i--) {
        var curAmountResList = mapResultsArray.filter(obj=>obj.amount===i);
        sortJSONArrayByField(curAmountResList, 'from');

        if (curAmountResList.length!==0) {
          mappingResults.innerHTML += '<h4>' + i + " free users:" + '</h4>';
          mappingResults.innerHTML +='<br>';

          for(var res of curAmountResList) {
            showMappingResultElement(res);
          }
        }
      }
    }
    else {
      mappingResults.innerHTML += '<h3>' + "No free time :("+'</h3>';
    }

  });




function showMappingResultElement(element) {
  var mappingResults = document.getElementById('MappingResults');
  var dateTimeFrom = new Date(element.from);
  var dateTimeTo = new Date(element.to);
  var localDateString = dateTimeFrom.toLocaleDateString(undefined, {
    day : 'numeric',
    month : 'numeric',
    year : 'numeric'
  });

  var localTimeString = dateTimeFrom.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  mappingResults.innerHTML += '<u>' + localDateString + ", " + localTimeString + " - " + '</u>';

  localDateString = dateTimeTo.toLocaleDateString(undefined, {
    day : 'numeric',
    month : 'numeric',
    year : 'numeric'
  });

  localTimeString = dateTimeTo.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  mappingResults.innerHTML +='<u>' + localDateString + ", " + localTimeString + '</u>';
  mappingResults.innerHTML += '<br>';
  var freeUsers = element.freeUsers;
  for(var user of freeUsers) {
    mappingResults.innerHTML += user + ", ";
  }
  mappingResults.innerHTML += '<br>';

}

function sortJSONArrayByField(array, field) {
    array = array.sort(function(a, b) {
    return (a[field] > b[field]) ? 1 : ((a[field] < b[field]) ? -1 : 0);
    });
}

function ToMapping(id) {
  var idParts = id.split("_");
  var username = idParts[1];
  console.log(username);

  var newDiv = document.createElement('div');
  newDiv.className = "mapElement";
  newDiv.id="mappingElement_"+username;
  newDiv.innerHTML = '<table><tr><td width=100% align="center">'+username+'</td><td align="center"><img src="delete_small.png" class="close" id=removeFromMapping_'
   + username+' onclick="RemoveFromMapping(this.id)"></td></tr></table>';
//  newDiv.innerHTML = '<table><tr><td width=100% align="center">'+username+'</td><td align="center"><a class="close" id=removeFromMapping_'
//+ username+' onclick="RemoveFromMapping(this.id)">X</a></td></tr></table>';
//  newDiv.innerHTML += '<img src="delete_small.png">';
//	a.className = "close";
//	a.align="top";

  document.getElementById('MappingList').appendChild(newDiv);
  //document.getElementById('MappingList').innerHTML+='<br>';

  var toMappingButton = document.getElementById("toMapping_"+username);
  if (toMappingButton!=null) {
    toMappingButton.onclick = function() { RemoveFromMapping("toMapping_"+username) };
    //toMappingButton.textContent = "Remove from mapping";
    toMappingButton.src="remove_from_mapping.png";
    toMappingButton.alt="Remove from mapping";
    toMappingButton.title="Remove from mapping";
  }

  var curUserId = GetCurUser();
  if (username==curUserId)
    document.getElementById('includeMyselfToMapping').checked = true;

  mappingElements[mappingElements.length] = username;

  CheckMappingElementsCount();

}

function RemoveFromMapping(id) {
  var idParts = id.split("_");
  var username = idParts[1];
  var mappingElementId = "mappingElement_"+username;
  var mappingElement = document.getElementById(mappingElementId);
  document.getElementById('MappingList').removeChild(mappingElement);
  var toMappingButton = document.getElementById("toMapping_"+username);
  if (toMappingButton!=null) {
    toMappingButton.onclick = function() { ToMapping("toMapping_"+username) };
    //toMappingButton.textContent = "Add to mapping";
    toMappingButton.src="add_to_mapping.png";
    toMappingButton.alt="Add to mapping";
    toMappingButton.title="Add to mapping";
  }

  var curUserId = GetCurUser();
  if (username==curUserId)
    document.getElementById('includeMyselfToMapping').checked = false;

  var index = mappingElements.indexOf(username);
  if (index !== -1)
    mappingElements.splice(index, 1);

  CheckMappingElementsCount();

  var mappingResults = document.getElementById('MappingResults');
  mappingResults.innerHTML = "";

}

function IncludeMyselfToMappingChanged(checkbox) {
  var curUserId = GetCurUser();
  if(checkbox.checked == true){
    ToMapping("toMapping_"+curUserId);
  }
  else{
    RemoveFromMapping("toMapping_"+curUserId);
  }
}

function GetCurUser() {
  var curUserId = document.getElementById('curUserId').textContent;
  return curUserId;
}

function CheckMappingElementsCount() {
  if (mappingElements.length>1) {
    document.getElementById('mapSchedules').style.visibility="visible";
    document.getElementById('mappingDateFrom').style.visibility="visible";
    document.getElementById('mappingTimeFrom').style.visibility="visible";
    document.getElementById('mappingDateTo').style.visibility="visible";
    document.getElementById('mappingTimeTo').style.visibility="visible";
    }

  else {
    document.getElementById('mapSchedules').style.visibility="hidden";
    document.getElementById('mappingDateFrom').style.visibility="hidden";
    document.getElementById('mappingTimeFrom').style.visibility="hidden";
    document.getElementById('mappingDateTo').style.visibility="hidden";
    document.getElementById('mappingTimeTo').style.visibility="hidden";
    }
}

function OnMapSchedulesClick() {
  var dateFrom = document.getElementById('mappingDateFrom').value;
  var timeFrom = document.getElementById('mappingTimeFrom').value;
  var dateTimeFrom = GetDateTime(dateFrom, timeFrom);
//	console.log(dateTimeFrom);
  var dateTo = document.getElementById('mappingDateTo').value;
  var timeTo = document.getElementById('mappingTimeTo').value;
  var dateTimeTo = GetDateTime(dateTo, timeTo);

  /*
  {
  	"dateFrom" : "2019-03-07",
      "timeFrom" : "12:00",
      "dateTo" : "2019-03-09",
      "timeTo" : "19:45",
      "users":["maxim", "lighthead"]

  }
  */
//	console.log(dateTimeTo);
//	console.log(mappingElements);
  var mappingData = {"dateFrom": dateFrom, "timeFrom": timeFrom, "dateTo": dateTo, "timeTo": timeTo, "users": mappingElements};
  //socket.emit('mapping', mappingElements, dateTimeFrom, dateTimeTo);
  var user = GetCurUser();

  socket.emit('mapping', mappingData, user);

}

function GetDateTime(date, time) {
  if ((date!="")&&(time!="")) {
    var dateParts = date.split("-");
    var timeParts = time.split(":");
    var dateTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1]);
  //	console.log(time);
    return dateTime;
  }
  else return undefined;

}

var mappingElements = [];

function Subscribe(id){
  //var subscribeReceiver = document.getElementById('searchInput').value;
  var newSubscriber = document.getElementById('curUserId').textContent;

  var btn = document.getElementById(id);
  console.log(btn);
  var subscribeReceiver = btn.getAttribute('data-user');
  console.log(subscribeReceiver);
  var taskNumber = btn.getAttribute('data-taskNumber');
  console.log(taskNumber);

  if (subscribeReceiver!="") {
    if (taskNumber===null) {
        socket.emit('subscribe', subscribeReceiver, newSubscriber, true);
        //console.log(newSubscriber + "->" + subscribeReceiver);
    }
    else socket.emit('subscribe', subscribeReceiver, newSubscriber, true, parseInt(taskNumber));
  }
}

function Unsubscribe(id){
//  var unsubscribeReceiver = document.getElementById('searchInput').value;
  var unsubscribedUser = document.getElementById('curUserId').textContent;

  var btn = document.getElementById(id);
  console.log(btn);
  var unsubscribeReceiver = btn.getAttribute('data-user');
  console.log(unsubscribeReceiver);
  var taskNumber = btn.getAttribute('data-taskNumber');
  console.log(taskNumber);

  if (unsubscribeReceiver!="") {
    if (taskNumber===null) {
        socket.emit('subscribe', unsubscribeReceiver, unsubscribedUser, false);
        console.log(unsubscribedUser + "<-" + unsubscribeReceiver);
    }
    else socket.emit('subscribe', unsubscribeReceiver, unsubscribedUser, false, parseInt(taskNumber));

  }
}

function Search(obj){
  var value = obj.value;
  if (value!="")
    socket.emit('search', value);
}

socket.on('taskById', function(task) {
  //console.log(data);
  var tName = task.name;
  var tDateFrom = task.dateFrom;
  var tTimeFrom = task.timeFrom;
  var tDateTo = task.dateTo;
  var tTimeTo = task.timeTo;
  var tComment = task.comment;
  var tVisibility = task.visibility;
  console.log(tVisibility);
  var tEditable = task.editable;
  var id = task.taskNumber;

  OpenModal("/editTask", tName, tComment, tDateFrom, tTimeFrom, tDateTo, tTimeTo, tVisibility, tEditable, id);
});

function OpenModalWithParams(id){
  var curUserId = document.getElementById('curUserId').textContent;
  socket.emit('taskById', curUserId, id);

  }
