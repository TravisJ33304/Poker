// dependencies
let express = require("express");
const { createContext } = require("vm");
let app = express();
let http = require("http").createServer(app);

let io = require("socket.io")(http);
// server variables
const port = 8080; // server port
// objects
let players = []; // store player data
let rooms = []; // game rooms

let newDeck = []; // list of full deck
// serve webpage to client
app.use("/client", express.static(__dirname + "/client")); // clientside file directory
app.get("/", function (req, res) { // send when webpage loaded
  res.sendFile(__dirname + "/client/index.html");
});
// utility functions
function checkInput(input) {
    if (input && input != "")
        return true;
    else
        return false;
}
function findRoom(name) {
    for (let room of rooms)
        if (name == room.name)
            return room;
    return false;
}
function roomNames() {
    let names = [];
    for (let room of rooms)
        names.push(room.name);
    return names;
}
function leaveRoom(player) {
    player.leave(player.room.name);
    player.room.players.splice(player.room.players.indexOf(player), 1);
    console.log(player.name + " left room: " + player.room.name);
}
// classes
function Player(name, player) {
    player = {
        ...player,
        name: name,
        hand: [],
        chips: [1, 2, 3, 4, 5],
        calcMoney: function() {
            return (chips[0] * 100) + (chips[1] * 50) + (chips[2] * 25) + (chips * 10) + (chips[3] * 5) + (chips[4]);
        }
    };
}
function Room(name, host) {
    return {
        name: name,
        players: [host],
        state: "lobby",
        deck: newDeck.splice(),
    };
}
// client communication
io.on("connection", function (socket) { // client connects
    console.log("User connected: " + socket.id);
    socket.on("name", function(data) { // client sends name in
        if (checkInput(data) === true) {
            Player(data, socket); // add player attributes to socket
            players.push(socket); // add player to users
            console.log("Name chosen: " + data);
            // get room names
            let names = roomNames();
            socket.emit("nameResult", names); // send back the rooms
        } else { // invalid input
            socket.emit("nameResult", false);
        }
    });
    socket.on("createRoom", function(data) { // make a new room
        if (checkInput(data) === true && findRoom(data) === false) {
            socket.join(data);
            rooms.push(Room(data, socket));
            socket.emit("roomResult", rooms[-1]);
            socket.room = rooms[-1];
            console.log("Room created: " + data);
        } else { // error occurred
            socket.emit("roomResult", false);
        }
    });
    socket.on("joinRoom", function(data) { // join a room
        let room = findRoom(data);
        if (room !== false) {
            room.players.push(socket);
            socket.join(data);
            socket.room = room;
            socket.emit("roomsResult", room);
            console.log(socket.name + " joined room: " + socket.room.name);
        } else { // error occurred
            socket.emit("roomResult", false);
        }
    });
    socket.on("leaveRoom", function() { // clinet leaves lobby
        leaveRoom(socket);
        socket.emit("nameResult", roomNames());
    });
    socket.on("disconnect", function() { // client disconnects
        console.log("User disconnected: " + socket.id);
        if (socket.room)
            leaveRoom(socket);
        players.splice(players.indexOf(socket), 1); // remove userdata
    });
});

http.listen(port, function () { // start the server
    console.log("Listening on port: " + port);
});

// shuffle the deck arr.sort(() => Math.random() - 0.5);