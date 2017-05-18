//initialize project with requires and stuff
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Dict = require("collections/dict");

var dictionary = new Dict();
var users = new Dict();

var rooms = [];

var port = process.env.PORT || 8080; 


app.use(express.static(__dirname + "/public"));

app.get("/", function(req,res){
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/:id", function(req, res){
  var roomid = req.params.id; 
  if(dictionary.has(roomid)){
    res.sendFile(__dirname + "/public/index.html");
  }else{
    res.redirect("/");
  }
});

http.listen(port, function(){
  console.log("Server listening on port: " + port);
});

function generateID(){
  var id = Math.random().toString(36).substr(2,20);
  if(dictionary.has(id)){
    return generateID();
  }else{
    return id;
  }
}

function generateUID(){
  var id = Math.random().toString(36).substr(2,10);
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
  //console.log(socket.handshake.url);

  socket.on("disconnect", function(reason){
    try{
      console.log("Delete room if its empty");
    }catch(err){
      //console.log(err);
      //No room to destroy ? 
    }
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
   socket.to(socket.room).emit("begin", {user: data.userID});
 });


//Really hacky solution. (its shit)
 socket.on("myurl", function(data){
    if(dictionary.has(data.roomURL)){
      socket.room = data.roomURL;
      socket.join(socket.room);
      var numb = generateUID();
      socket.userNumber = numb;
      socketRoom = data.roomURL;
      socketNumber = numb;

      rooms[socketRoom][socketNumber] = numb;

      socket.to(socketRoom).emit("clientjoined", {userID: socketNumber});
      socket.emit("instajoin", {ownID: numb, info: Object.keys(rooms[socketRoom])});
   }
});

  socket.on("createroom", function(){
    var roomName = generateID();
    socket.room = roomName;
    socket.join(socket.room);
    socket.userNumber = generateUID();
    socketRoom = roomName;
    socketNumber = socket.userNumber;

    dictionary.add(roomName, roomName);

    var canvases = [];
    canvases[socketNumber] = socketNumber;
    rooms[socket.room] = canvases;

    console.log("Room with ID " + socketRoom + " created");
    socket.emit("createresponse", {userID: socketNumber, roomID: roomName});
  });

  socket.on("joinroom", function(data){
    if(dictionary.has(data.roomid)){
      socket.room = data.roomid;
      socket.join(socket.room);
      var numb = generateUID();
      socket.userNumber = numb;
      socketRoom = data.roomid;
      socketNumber = numb;

      rooms[socketRoom][socketNumber] = numb;

      socket.to(socketRoom).emit("clientjoined", {userID: socketNumber});

      socket.emit("roomjoined", {info: Object.keys(rooms[socketRoom]), ownID: socketNumber});

    }else{
      var msg = "Room does not exist";

      socket.emit("nojoin", {message: msg});
    }
  });
});
