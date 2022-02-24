let socket = io(); // connect to server

function checkInput(input) {
    if (input && input != "")
        return true;
    else
        return false;
}

function chooseName() {
    let name = document.getElementById('name').value; // get name input
    if (checkInput(name)) { // valid name
        socket.emit("name", name);
        // move to next screen
        document.getElementById("login").display = "none";
        document.getElementById("rooms").display = "block";
    } else { // tell user to choose valid name
        document.getElementById("nameError").display = "block";
    }
}

function createRoom() {
    let name = document.getElementById("roomName").value;
    if (checkInput(name)) {
        socket.emit("createRoom", name);
        document.getElementById("rooms").display = "none";
        document.getElementById("game").display = "block";
    } else {
        document.getElementById("roomError").display = "block";
    }
}

socket.on("rooms", function(data) { // recieve room list from server
    let list = document.getElementById("roomList"); // get room list element
    for (let name of data) { // append every name to the list
        let li = document.createElement("li");
        li.innerHTML = `${name}<button onclick="joinRoom(${name})">Join</button>`;
        list.appendChild(li);
    }
});