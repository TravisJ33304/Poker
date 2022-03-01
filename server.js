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
// classes
function Player(name, player) {
    return {
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
    socket.on("name", function(data) {
        socket = Player(data, socket); // add player attributes to socket
        players.push(socket); // add player to users
        console.log("Name chosen: " + data);
        // get room names
        let names = [];
        for (let room of rooms)
            names.push(room.name);
        socket.emit("rooms", names); // send back the rooms
    });
    socket.on("createRoom", function(data) {
        socket.join(data);
        rooms.push(Room(data, socket));
        console.log("Room created: " + data);
    });
    socket.on("joinRoom", function(data) {
        for (let room of rooms) {
            if (room.name == data) {
                room.players.push(socket);
                socket.join(data);
            }
        }
        socket.emit("roomError");
    });
    socket.on("disconnect", function() {
        console.log("User disconnected: " + socket.id);
        players.splice(players.indexOf(socket), 1); // remove userdata
    });
});

http.listen(port, function () { // start the server
    console.log("Listening on port: " + port);
});

// shuffle the deck arr.sort(() => Math.random() - 0.5);