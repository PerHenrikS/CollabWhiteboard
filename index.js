//initialize project with requires and stuff
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Dict = require("collections/dict");

var dictionary = new Dict();
var users = new Dict();

var rooms = [];
//var clients = [];
//var canvases = [];
//var users = {};

app.use(express.static(__dirname + "/public"));

app.get("/", function(req,res){
  res.sendFile(__dirname + "/public/index.html");
});

http.listen(3000, function(){
  console.log("Server listening on localhost port: 3000");
});

function generateID(){
  var id = Math.random().toString(36).substr(2,10);
  if(dictionary.has(id)){
    return generateID();
  }else{
    return id;
  }
}

function generateUID(){
  var id = Math.random().toString(36).substr(2,20);
  if(users.has(id)){
    return generateUID();
  }else{
    return id;
  }
}

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}

io.on("connection", function(socket){
  //for disconnect array deletion process
  var socketRoom;
  var socketNumber;
  console.log("Client has connected to the server");

  socket.on("disconnect", function(reason){
    console.log("socket room " + socketRoom + " socket number " + socketNumber);
    //delete rooms[socketRoom][socketNumber];
  });

  socket.on("closeDrawing", function(data){
  //console.log("Close path");
  socket.to(socket.room).emit("endPath", {user: data.userID});
  });

  socket.on("moveto", function(data){
   socket.to(socket.room).emit("moveResponse", {mouseX: data.mouseposx, mouseY: data.mouseposy, user: data.who});
  });

  socket.on("drawing", function(data){
    //console.log(socketNumber + " is drawing");
     socket.to(socket.room).emit("drawResponse", {cmouseX: data.posX, cmouseY: data.posY, user: data.userID});
  });

  socket.on("openPath", function(data){
   //console.log("Begin path");
   socket.to(socket.room).emit("begin", {user: data.userID};
 });

  socket.on("createroom", function(){
    var roomName = generateID();
    socket.room = roomName;
    socket.join(socket.room);
    socket.userNumber = generateUID();
    socketRoom = roomName;
    socketNumber = socket.userNumber;

    dictionary.add(roomName, roomName);
    //var users = [];
    //users[socketNumber] = socketNumber;
    //rooms[socket.room] = users;
    var canvases = [];
    canvases[socketNumber] = socketNumber;
    rooms[socket.room] = canvases;

    //console.log(rooms[socket.room]);
    console.log("Room with ID " + socketRoom + " created");
    socket.emit("createresponse", {userID: socketNumber});
  });

  socket.on("joinroom", function(data){
    if(dictionary.has(data.roomid)){
      socket.room = data.roomid;
      socket.join(socket.room);
      var numb = generateUID();
      //var numb = firstfree(0, data.roomid);
      socket.userNumber = numb;
      socketRoom = data.roomid;
      socketNumber = numb;

      rooms[socketRoom][socketNumber] = numb;

      socket.to(socketRoom).emit("clientjoined", {userID: socketNumber});

      socket.emit("roomjoined", {info: Object.keys(rooms[socketRoom]), ownID: socketNumber});

    }else{
      var msg = "something wrong";

      socket.emit("nojoin", {message: msg});
    }
  });
});
