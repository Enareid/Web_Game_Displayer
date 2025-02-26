const socket = io();

let id = "";

let valid = false;

let websocket = null;

let messageHandler = null;

let alphaExp = /^[a-zA-z0-9]+$/;

socket.on('identification',() => connect());
socket.on('chat message',(msg)=> displayMessageChat(msg));
socket.on('send board', (socket1) => socket.emit('sended board',getBoard(),socket1, id));
socket.on('print board', (board, id) => displayBoard(board, id));

socket.on('sended update board',(board,id) => displayUpdatedBoard(board,id));

function displayUpdatedBoard(board,id){
    if (valid){
        const idBoard = document.getElementById(id);
        if(idBoard){
            displayBoard(board,id);
        }
    }
}

function getBoard() {
    let b = document.getElementById("board").innerHTML;
    return b;
}

function connect() {
    websocket = new WebSocket('ws://localhost:3000');
    websocket.onopen = () => {
        while (id == "" || id == null || !id.match(alphaExp)) {
            id = prompt("Enter your id", id);
        }
        console.log('Connected to server');
        sendCommand(`ENTERS`);
    }
    websocket.onerror = () => {
        while (id == "" || id == null) {
            id = prompt("Enter your id", id);
        }
    }
    websocket.onmessage = (event) => {
        displayMessage(event.data);
    } 
}
document.addEventListener("DOMContentLoaded",() => {
    const validate = document.getElementById("validate");
    const boardsDisplay = document.getElementById('boards-display');
    validate.addEventListener("click",()=> {  
        socket.emit("view board",socket.id)
        valid = true;
        });
});

function displayBoard(board, id){
    if(board != getBoard()){
        const boardsDisplay = document.getElementById("boards-display");
        boardsDisplay.innerHTML = "";   
        const boardName = document.createElement("div");
        const boardAdded = document.createElement("table");
        boardName.textContent = id + ' : ';
        boardAdded.id = id;
        boardAdded.className = "board-";
        boardAdded.innerHTML = board;
        boardsDisplay.appendChild(boardName);
        boardsDisplay.appendChild(boardAdded);
    }
}

function displayMessageChat(message){
    const chatDisplay = document.getElementById("chat-display");
    const messageElement = document.createElement("div");
    messageElement.className = "player-message";
    messageElement.textContent = `${message}`;
    chatDisplay.appendChild(messageElement);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function displayMessage(message) {
    const cmdDisplay = document.getElementById("cmd-display");
    const messageElement = document.createElement("div");
    messageElement.className = "player-message";
    messageElement.textContent = `${message}`;
    cmdDisplay.appendChild(messageElement);
    cmdDisplay.scrollTop = cmdDisplay.scrollHeight;
};

document.addEventListener('DOMContentLoaded',()=>{
    const chatSend = document.getElementById("chat-send");
    const chatInput = document.getElementById("chat-input");
    chatSend.addEventListener("click", () => {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit('message',id +' : '+message);
            chatInput.value = ""; // Clear input
        }
    });

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            chatSend.click();
        }
    });
}
)


function sendCommand(command) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(id + ' ' + command);
    }
}
