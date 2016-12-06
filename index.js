var express = require("express");
var app = express();
var http = require("http").Server(app);

var io = require("socket.io")(http);

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

io.on("connection", function(socket){
  console.log("Client connected");
  socket.on("disconnect", function(){
    console.log("Client disconnected");
  });

  socket.on("createroom", function(){
    var roomName = generateID();
    socket.room = roomName;
    socket.join(socket.room);
    socket.userID = 0;

    console.log("room " + roomName + " created");
    console.log("user ID set to " + socket.userID);
  });

  socket.on("joinroom", function(data){
    
    socket.emit("roomjoined");
  });
});
