//initialize project with requires and stuff
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Dict = require("collections/dict");

var dictionary = new Dict();
var users = new Dict();

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
  return id;
}


function getRoomClients(data){
  var room = io.sockets.adapter.rooms[data];
  console.log(room.length);
  return room.length;
}

io.on("connection", function(socket){
  console.log("Client has connected to the server");
  socket.on("disconnect", function(){
    users.delete(String(socket.userNumber));
    console.log("Client has disconnected");
  });

  socket.on("createroom", function(){
    var roomName = generateID();
    socket.room = roomName;
    socket.join(socket.room);

    socket.userNumber = 0;
    users.add(0, "0");
    //users[socket.userNumber] = socket.userNumber;

    dictionary.add(roomName, roomName);

    console.log("Room " + roomName + " created");
    console.log("User ID set to " + socket.userNumber);
  });

//recursively finds "first free slot" in the dictinary
function firstfree(data){
  //console.log(data);
  if(users.has(String(data))){
    return firstfree(data + 1);
  }else{
    users.add(data, String(data));
    return data;
  }
}

  socket.on("joinroom", function(data){
    if(dictionary.has(data.roomid) && users.length < 5){
      socket.room = data.roomid;
      var numb = firstfree(0);
      socket.userNumber = numb;

      socket.emit("roomjoined");
      console.log("Client connected to room " + data.roomid);
      console.log("Clients ID is " + socket.userNumber);
    }else{
      var data;
      if(users.length == 5){
        data = "Room full"
      }else{
        data = "No such ID"
      }
      socket.emit("nojoin", {message: data});
    }
  });
});
