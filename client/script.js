let socket = io(); // connect to server

let ctx; // rendering context

socket.on("nameResult", function(data) {
    if (data) { // set name and recieved rooms
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
        document.getElementById("roomName").innerText = data.name;
    } else { // error occurred
        document.getElementById("roomError").style.display = "block";
    }
});

document.onload = function() { // run when the page loads
    // setup canvas and rendering
    let canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = 1600;
    canvas.height = 900;
}