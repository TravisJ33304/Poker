let socket = io(); // connect to server

socket.on("nameResult", function(data) {
    if (data !== false) { // set name and recieved rooms
        let list = document.getElementById("roomList"); // get room list element
        for (let room of data) { // append every name to the list
            let li = document.createElement("li");
            li.innerHTML = `${room}<button onclick="socket.emit("joinRoom",${room})">Join</button>`;
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
    if (data !== false) { // joined room and start game
        document.getElementById("rooms").style.display = "none";
        document.getElementById("game").style.display = "block";
        document.getElementById("roomName").style.innerText = data.name;
    } else { // error occurred
        document.getElementById("roomError").style.display = "block";
    }
});