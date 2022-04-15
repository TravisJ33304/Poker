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
function findRoom(name) { // look for a room and return it otherwise return false
    for (let room of rooms)
        if (name == room.name)
            return room;
    return false;
}
function roomNames() { // return a list of room names
    let names = [];
    for (let room of rooms)
        names.push(room.name);
    return names;
}
function leaveRoom(socket) { // disconnect a player from a game room
    let room = socket.player.room;
    socket.leave(room.name);
    room.players.splice(room.players.indexOf(socket.player), 1);
    console.log(socket.player.name + " left room: " + room.name);
}
// object classes
function Player(name) {
    return {
        name: name,
        room: {},
        ready: false,
        hand: [], // cards in hand
        chips: [], // number of chips for each value
        calcMoney: function() { // return the integer total of money
            return (chips[0] * 100) + (chips[1] * 50) + (chips[2] * 25) + (chips * 10) + (chips[3] * 5) + (chips[4]);
        }
    };
}
function Room(name, host) {
    return {
        name: name,
        players: [host],
        state: "lobby", // state of the game
        currentBet: 0, // amount of bet being placed
        deck: [], // deck of cards
        playerTurn: 0,
        checkStart: function() {
            if (this.players.length < 2)
                return;
            for (let player of this.players) // check all players are ready
                if (player.ready === false)
                    return;
            this.newGame(); // start a new game
        },
        newGame: function() {
            this.deck = newDeck.splice(); // copy a new deck
            this.deck.sort(() => Math.random() - 0.5); // shuffle the deck
            for (let player of this.players) {
                player = {
                    ...player,
                    hand: [],
                    chips: [1, 2, 3, 4, 5],
                    betPlaced: 0,
                };
            }
            this.players[0].chips[3]--; // big blind
            this.players[0].betPlaced = 5;
            this.players[1].chips[4]--; // small blind
            this.players[1].betPlaced = 1;
            this.currentBet = 5;
            this.playerTurn = 1;
            io.to(this.name).emit("gameStart", this);
        }
    };
}
// client communication
io.on("connection", function (socket) { // client connects
    console.log("User connected: " + socket.id);
    socket.on("name", function(data) { // client sends name in
        if (checkInput(data) === true) {
            socket.player = Player(data); // add player object to socket
            players.push(socket.player); // add player to users
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
            let room = Room(data, socket.player);
            rooms.push(room);
            socket.emit("roomResult", room);
            socket.player.room = room;
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
            socket.player.room = room;
            socket.emit("roomsResult", room);
            console.log(socket.player.name + " joined room: " + socket.player.room.name);
        } else { // error occurred
            socket.emit("roomResult", false);
        }
    });
    socket.on("ready", function() { // player is ready to start
        socket.player.ready = true;
        socket.player.room.checkStart();
    });
    socket.on("leaveRoom", function() { // client leaves lobby
        leaveRoom(socket);
        socket.emit("nameResult", roomNames());
    });
    socket.on("disconnect", function() { // client disconnects
        console.log("User disconnected: " + socket.id);
        if (socket.player.room)
            leaveRoom(socket);
        players.splice(players.indexOf(socket.player), 1); // remove userdata
    });
});

http.listen(port, function () { // start the server
    console.log("Listening on port: " + port);
});