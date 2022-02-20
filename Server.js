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
// classes
function Player(name, player) {
    return {
        ...player,
        name: name,
        hand: [],
        money: [1, 2, 3, 4, 5],
        calcMoney: function() {
            return (money[0] * 100) + (money[1] * 50) + (money[2] * 25) + (money * 10) + (money[3] * 5) + (money[4]);
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
        // get room names
        let names = [];
        for (room of rooms)
            names.push(room.name)
        socket.emit("rooms", names); // send back the rooms
    });
    socket.on("createRoom", function(data) {
        socket.join(data);
        rooms.push(Room(data, socket));
    });
    socket.on("joinRoom", function(data) {
        for (room of rooms) {
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