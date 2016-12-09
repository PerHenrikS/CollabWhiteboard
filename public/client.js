var socket = io();

//client information
var WIDTH = $(".canvas-holder").width();
var HEIGHT = $(".canvas-holder").outerHeight();

var canvas_array = [];
var context = [];

var myID;

window.onload = function(){
  popupScreen();
}

//Function to change mouse position relative to canvas size
function getMousePosScale(canvas, evt){
  var rect = canvas.getBoundingClientRect(),
	scaleX = canvas.width / rect.width,
	scaleY = canvas.height / rect.height;

    return {
	    x: (evt.clientX - rect.left) * scaleX,
	    y: (evt.clientY - rect.top) * scaleY
    }
}

var mouse = {
    x: 0,
    y: 0
};

//For the popup
function popupScreen(){
  var popupbg = document.getElementById("overlay");
  popupbg.style.display="block";
}

function addCanvas(id){
  //myID = id;
  var canv = document.createElement("canvas"),
      div = document.getElementsByClassName("canvas-holder");
  context[id] = canv.getContext("2d");
  canv.id = id;
  canv.width = WIDTH;
  canv.height = HEIGHT;
  //assign no pointer events on all but own canvas
  if(id != myID){
    canv.className += "canvNoEvent";
  }
  canv.style.position ="absolute";
  canv.style.background ="transparent";
  canv.style.margin=0;
  canvas_array[id] = canv;
  $(div).append(canv);

  context[id].fillStyle="#ffffff";
  context[id].lineWidth = 5;
  context[id].lineJoin = "round";
  context[id].lineCap = "round";
  //context[id].fillRect(0,0,WIDTH,HEIGHT);
}

function addMouseMove(id){
  canvas_array[id].addEventListener("mousemove", function(e){
        var position = getMousePosScale(canvas_array[id], e);
        mouse.x = position.x;
        mouse.y = position.y;
  });
  //draw functions
  canvas_array[id].addEventListener('mousedown', function(e) {
      context[id].beginPath();
      context[id].moveTo(mouse.x, mouse.y);

      var mouseRelativeX = mouse.x / canvas_array[id].width;
      var mouseRelativeY = mouse.y / canvas_array[id].height;

      socket.emit("moveto", {mouseposx: mouseRelativeX, mouseposy: mouseRelativeY, who: id});
      socket.emit("openPath", {userID: id});

      canvas_array[id].addEventListener('mousemove', onPaint, false);
  }, false);

  canvas_array[id].addEventListener('mouseup', function() {
      canvas_array[id].removeEventListener('mousemove', onPaint, false);
      socket.emit("closeDrawing", {userID: id});
      context.closePath();
  }, false);
}

var onPaint = function() {

    context[myID].lineTo(mouse.x, mouse.y);
    context[myID].stroke();

    var mouseRelativeX = mouse.x / context[myID].canvas.width;
    var mouseRelativeY = mouse.y / context[myID].canvas.height;

    socket.emit("drawing", {posX: mouseRelativeX, posY: mouseRelativeY, userID: myID});
};


$("#join").click(function(){
  $("#join").hide("slide", {direction:"left"}, 300);
  $("#create").hide("slide", {direction:"right"}, 300);
  $("#join-form").show(400);

  $("#join-room").click(function(){
    var user_input = $("#user-input").val();
    if(user_input == ""){
      alert("Enter something");
    }else{
      socket.emit("joinroom", {roomid: $("#user-input").val()});
    }
  });
});

//create a new room
$("#create").click(function(){
  $("#join").hide("slide", {direction:"left"}, 300);
  $("#create").hide("slide", {direction:"right"}, 300);
  $("#welcome-form").show(400);

  //initialize();
  socket.emit("createroom");

  setTimeout(function(){
    $(".popup").hide();
    $("#overlay").css("display", "none");
  }, 1000);
});

socket.on("createresponse", function(data){
  myID = data.userID;
  addCanvas(data.userID);
  addMouseMove(data.userID);
});

socket.on("clientjoined", function(data){
  addCanvas(data.userID);
  console.log("client joined");
});

socket.on("roomjoined", function(data){
  $("#join-form").hide();
  $("#welcome-form").show();

  myID = data.ownID;
  var arr = Object.values(data.info);
  for(var i = 0; i < arr.length; i++){
      addCanvas(arr[i]);
  }

  addMouseMove(data.ownID);

  setTimeout(function(){
    $(".popup").hide();
    $("#overlay").css("display", "none");
  }, 1000);
});

socket.on("nojoin", function(data){
  alert(data.message);
});

socket.on("begin", function(data){
  context[data.user].beginPath();
});

socket.on("endPath", function(data){
  context[data.user].closePath();
});

socket.on("moveResponse", function(data){
    var relativePosX = data.mouseX * canvas_array[data.user].width;
    var relativePosY = data.mouseY * canvas_array[data.user].height;

    context[data.user].moveTo(relativePosX, relativePosY);
});

socket.on("drawResponse", function(data){
    var relativePosX = data.cmouseX * canvas_array[data.user].width;
    var relativePosY = data.cmouseY * canvas_array[data.user].height;

    context[data.user].lineTo(relativePosX, relativePosY);
    context[data.user].stroke();
});
