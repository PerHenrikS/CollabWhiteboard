var socket = io();


//client information
var WIDTH = $(".canvas-holder").width();
var HEIGHT = $(".canvas-holder").outerHeight();

var canvas_array = [];
var context = [];

window.onload = function(){
  popupScreen();
}

//For the popup
function popupScreen(){
  var popupbg = document.getElementById("overlay");
  popupbg.style.display="block";
}

function addCanvas(id){
  var canv = document.createElement("canvas"),
      div = document.getElementsByClassName("canvas-holder");
  context[id] = canv.getContext("2d");
  canv.id = id;
  canv.width = WIDTH;
  canv.height = HEIGHT;
  canv.style.position = "absolute";
  canv.style.margin=0;
  $(div).append(canv);

  context[id].fillStyle="#ffffff";
  context[id].fillRect(0,0,WIDTH,HEIGHT);
}

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
  addCanvas(data.userID);
});

socket.on("clientjoined", function(data){
  addCanvas(data.userID);
  console.log("client joined");
});

socket.on("roomjoined", function(data){
  $("#join-form").hide();
  $("#welcome-form").show();

  var arr = Object.values(data.info);
  for(var i = 0; i < arr.length; i++){
      addCanvas(arr[i]);
  }

  setTimeout(function(){
    $(".popup").hide();
    $("#overlay").css("display", "none");
  }, 1000);
});

socket.on("nojoin", function(data){
  alert(data.message);
});
