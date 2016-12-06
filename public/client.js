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

/*
  Initialize by making n canvases with n different
  canvas contexts to separate the drawing

  n=5 at the moment
*/
function initialize(){
  for(var i=0; i < 5; i++){
    var canv = document.createElement("canvas"),
        div = document.getElementsByClassName("canvas-holder");
    canv.id = "canvas"+i;
    context[i] = canv.getContext("2d");
    canv.width = WIDTH;
    canv.height = HEIGHT;
    canv.style.zIndex = i;
    canv.style.position = "absolute";
    canv.style.margin=0;
    $(div).append(canv);

    context[i].fillStyle="#ffffff";
    context[i].fillRect(0,0,WIDTH,HEIGHT);
  }
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

  initialize();
  socket.emit("createroom");

  setTimeout(function(){
    $(".popup").hide();
    $("#overlay").css("display", "none");
  }, 1000);
});

socket.on("roomjoined", function(){
  $("#join-form").hide();
  $("#welcome-form").show();

  initialize();

  setTimeout(function(){
    $(".popup").hide();
    $("#overlay").css("display", "none");
  }, 1000);
});
socket.on("nojoin", function(data){
  alert(data.message);
});
