let socket = io(); // connect to server

function chooseName() {
    let name = document.getElementById('name').value; // get name input
    socket.emit("name", name); // send name
}

function createRoom() {
    let name = document.getElementById("roomName").value;
    socket.emit("createRoom", name);
}

socket.on("nameResult", function(data) {
    if (data === data.res) {
        let list = document.getElementById("roomList"); // get room list element
        for (let room of data.rooms) { // append every name to the list
            let li = document.createElement("li");
            li.innerHTML = `${room}<button onclick="socket.emit("joinRoom",${room})">Join</button>`;
            list.appendChild(li);
        }
        document.getElementById("login").display = "none";
        document.getElementById("rooms").display = "block";
    } else {
        document.getElementById("nameError").display = "block";
    }
});

socket.on("roomResult", function(data) { // recieve room list from server
    if (data.res) {
        document.getElementById("rooms").display = "none";
        document.getElementById("game").display = "block";
        document.getElementById("roomName").innerText = data.name;
    } else {
        document.getElementById("roomError").display = "block";
    }
});