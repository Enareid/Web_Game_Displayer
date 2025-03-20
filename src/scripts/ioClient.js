import PlacementManager from "../scripts/game.js";
const manager = new PlacementManager();
manager.init();
export const socket = io();

export let id = "";

let valid = false;
let serverAddr = null;

let websocket = null;

let messageHandler = null;

let alphaExp = /^[a-zA-z0-9]+$/;

socket.on('identification',() => connect());
socket.on('chat message',(msg)=> displayMessageChat(msg));
socket.on('send board', (socket1) => socket.emit('sended board',getBoard(),socket1, id));
socket.on('print board', (board, id) => displayBoard(board, id));
socket.on('get-address', (address) => { serverAddr = address; connect(); });

socket.on('sended update board',(board,id) => displayUpdatedBoard(board,id));

function displayUpdatedBoard(board,idtoChange){
    if(idtoChange != id){
        console.log(`i have change my board ${idtoChange}`);
        const idBoard = document.getElementById(idtoChange);
        const boardsDisplay = document.getElementById("boards-display");
        idBoard.remove();
        const idName = document.getElementById("name"+idtoChange);
        idName.remove();
        if(idBoard){
            displayBoard(board,idtoChange);
        }
    }
}

export function getBoard() {
    let b = document.getElementById("board").innerHTML;
    return b;
}

function connect() {

    websocket = new WebSocket(`ws://${serverAddr}:3000`);
    websocket.onopen = () => {
        while (id == "" || id == null || !id.match(alphaExp)) {
            id = prompt("Enter your id", id);
        }
        console.log('Connected to server');
        sendCommand(`ENTERS`);
    }
    websocket.onerror = () => {
        if(id != "" || id != null){
            sendCommand('LEAVES');
        }
        alert("Connection au reflecteur requise");
        connect();
    }
    websocket.onmessage = (event) => {
        displayMessage(event.data);
    } 
}

function displayBoard(board, idtoPrint){
    if(id != idtoPrint){
        const boardsDisplay = document.getElementById("boards-display");
        if(boardsDisplay.innerHTML != ""){
            const boardName = document.createElement("div");
            const boardAdded = document.createElement("table");
            boardName.textContent = idtoPrint + ' : ';
            boardName.id = "name"+idtoPrint;
            boardAdded.id = idtoPrint;
            boardAdded.className = "board-";
            boardAdded.innerHTML = board;
            boardsDisplay.append(boardName);
            boardsDisplay.append(boardAdded);
        }
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
    if (message.includes("THROWS")) {
        const boardsDisplay = document.getElementById("boards-display");
        boardsDisplay.innerHTML = "";
        const diceDisplay = document.getElementById("DiceRoll");
        const messageArray = message.split(" ");
        diceDisplay.innerHTML = "";
        for (let i = 2; i < messageArray.length; i++) {;
            // crée des div avec les imgaes des dés
            const diceElement = document.createElement("div");
            const diceImage = document.createElement("img");
            diceImage.className = "";
            diceImage.src = `images/${messageArray[i]}.png`;
            diceElement.appendChild(diceImage);
            diceDisplay.appendChild(diceElement);
        }

        manager.setupEventListeners();
    }
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


export function sendCommand(command) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(id + ' ' + command);
    }
}
