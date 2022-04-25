let socket = io(); // connect to server

let ctx, assets; // rendering context and assets

let playerName; // keep track of player name

function ready() { // player is ready to start
    socket.emit('ready');
    document.getElementById("ready").style.display = "none";
}

function bet() {
    document.getElementById("firstBet").style.display = "none";
    document.getElementById("addBet").style.display = "none";
    document.getElementById("bet").style.display = "block";
}

socket.on("nameResult", function(data) {
    if (data) { // set name and recieved rooms
        playerName = document.getElementById("name").value;
        let list = document.getElementById("roomList"); // get room list element
        list.innerHTML = "";  // erase list elements
        for (let room of data) { // append every name to the list
            let li = document.createElement("li");
            li.innerHTML = `<label style="margin-right: 10px;">${room}</label><button onclick="socket.emit("joinRoom",${room})">Join</button>`;
            list.appendChild(li);
        }
        // go to lobbies screen
        document.getElementById("login").style.display = "none";
        document.getElementById("game").style.display = "none";
        document.getElementById("rooms").style.display = "block";
    } else { // error occurred
        document.getElementById("nameError").style.display = "block";
    }
});

socket.on("roomResult", function(data) { // recieve room list from server
    if (data) { // joined room and start game
        document.getElementById("rooms").style.display = "none";
        document.getElementById("game").style.display = "block";
    } else { // error occurred
        document.getElementById("roomError").style.display = "block";
    }
});

socket.on("gameStart", function(data) {
    ctx = document.getElementById("canvas").getContext("2d");
});