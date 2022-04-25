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
// add cards to newDeck
let suits = ["s", "c", "d", "h"];
let cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k", "a"];
for (let suit of suits)
    for (let card of cards)
        newDeck.push({suit:suit, card:card});
// serve webpage to client
app.use("/client", express.static(__dirname + "/client")); // clientside file directory
app.get("/", function (req, res) { // send when webpage loaded
  res.sendFile(__dirname + "/client/index.html");
});
// utility functions
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
function leaveRoom(player) { // disconnect a player from a game room
    let room = findRoom(player.room);
    leave(room.name);
    room.players.splice(room.players.indexOf(player), 1);
    console.log(player.name + " left room: " + room.name);
}
// object classes
function Player(name) {
    return {
        name: name,
        room: "",
        ready: false,
        hand: [],
        money: 250, // starting money
        folded: true // not counted towards current round
    };
}
function Room(name, host) {
    return {
        name: name,
        players: [host],
        state: "lobby", // state of the game
        currentBet: 0, // amount of bet being placed
        pot: 0, // total winnings for the round
        deck: [], // deck of cards
        playerTurn: 0,
        checkStart: function() {
            if (this.players.length < 2) // 2 or more players required to play
                return;
            for (let player of this.players) // don't start if not ready
                if (player.ready === false)
                    return;
            this.newGame(); // start a new game
        },
        newGame: function() {
            this.deck = newDeck.slice(); // copy a new deck
            this.deck.sort(() => Math.random() - 0.5); // shuffle the deck
            for (let player of this.players) { // reset player data
                // give players money for blind
                if (player.money < 5)
                    player.money = 5;
                // empty hand and reset bet
                player.hand = [];
                player.betPlaced = 0;
                player.folded = false;
            }
            // start first round of betting
            this.players[0].money--; // small blind
            this.players[0].betPlaced = 1;
            this.players[1].money -= 5; // big blind
            this.players[1].betPlaced = 5;
            this.currentBet = 5;
            this.playerTurn = 2;
            // send initial data to players
            io.to(this.name).emit("gameStart", this);
        }
    };
}
// client communication
io.on("connection", function (socket) { // client connects
    console.log("User connected: " + socket.id);
    socket.on("name", function(data) { // client sends name in
        if (data) {
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
        if (data && findRoom(data) === false) {
            socket.join(data);
            let room = Room(data, socket.player);
            rooms.push(room);
            socket.emit("roomResult", room);
            socket.player.room = data;
            console.log("Room created: " + data);
        } else { // error occurred
            socket.emit("roomResult", false);
        }
    });
    socket.on("joinRoom", function(data) { // join a room
        let room = findRoom(data);
        if (room !== false && room.players.length <= 3) {
            room.players.push(socket);
            socket.join(data);
            socket.player.room = data;
            socket.emit("roomsResult", room);
            console.log(socket.player.name + " joined room: " + socket.player.room);
        } else { // error occurred
            socket.emit("roomResult", false);
        }
    });
    socket.on("ready", function() { // player is ready to start
        socket.player.ready = true;
        findRoom(socket.player.room).checkStart();
    });
    socket.on("leaveRoom", function() { // client leaves lobby
        leaveRoom(socket.player);
        socket.emit("nameResult", roomNames());
    });
    socket.on("disconnect", function() { // client disconnects
        console.log("User disconnected: " + socket.id);
        if (socket.player.room)
            leaveRoom(socket.player);
        players.splice(players.indexOf(socket.player), 1); // remove userdata
    });
});

http.listen(port, function () { // start the server
    console.log("Listening on port: " + port);
});