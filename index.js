//initialize project with requires and stuff
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Dict = require("collections/dict");

var dictionary = new Dict();
//var users = new Dict();

var rooms = [];
var clients = [];
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

/*
function getRoomClients(data){
  var room = io.sockets.adapter.rooms[data];
  console.log(room.length);
  return room.length;
}
*/

io.on("connection", function(socket){
  //for disconnect array deletion process
  var socketRoom;
  var socketNumber;
  console.log("Client has connected to the server");

  socket.on("disconnect", function(reason){
    console.log("socket room " + socketRoom + " socket number " + socketNumber);
    delete rooms[socketRoom][socketNumber];
  });

  socket.on("createroom", function(){
    var roomName = generateID();
    socket.room = roomName;
    socket.join(socket.room);
    socket.userNumber = 0;
    socketRoom = roomName;
    socketNumber = 0;

    dictionary.add(roomName, roomName);
    var users = [];
    users[0] = 0;
    console.log("USERS 0 " + users[0]);
    rooms[socket.room] = users;
    console.log(rooms[socket.room]);

    console.log("Room " + roomName + " created");
    console.log("User ID set to " + socket.userNumber);
  });

//recursively finds "first free slot" in the dictinary
function firstfree(data, roomid){
  console.log(rooms[roomid]);
  if(rooms[roomid][data] != null){
    return firstfree(data + 1, roomid);
  }else{
    rooms[roomid][data] = data;
    return data;
  }
}

  socket.on("joinroom", function(data){
    if(dictionary.has(data.roomid)){
      socket.room = data.roomid;
      var numb = firstfree(0, data.roomid);
      socket.userNumber = numb;
      socketRoom = data.roomid;
      socketNumber = numb;

      socket.emit("roomjoined");
      console.log("Client connected to room " + data.roomid);
      console.log("Clients ID is " + socket.userNumber);
    }else{
      var msg;
      if(rooms[data.roomid].length == 5){
        msg = "Room full"
      }else{
        msg = "No such ID"
      }
      socket.emit("nojoin", {message: msg});
    }
  });
});
