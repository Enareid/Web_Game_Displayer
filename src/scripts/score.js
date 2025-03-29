const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const scores = {
    'total-score': [],
    'center-tiles': [],
    'dead-ends': [],
    'connected-exits': [],
    'longest-road': [],
    'longest-rail': []
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tab.classList.add('active');
        const targetTab = tab.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');
    });
});

let websocket = null;
let serverAddr = '';

function start() {
    serverAddr = window.location.hostname;
    connect();
}

function connect() {
    websocket = new WebSocket(`ws://${serverAddr}:3000`);
    websocket.onopen = () => {
        console.log('WebSocket Connected');
    };
    websocket.onerror = () => {
        console.log('WebSocket Error');
    };
    websocket.onmessage = (event) => {
        displayMessage(event.data);
    };
}

function displayMessage(message) {
    console.log(message);
    const parts = message.split(' ');
    if (parts.length === 6 && parts[0] === 'referee' && parts[1] === 'SCORES') {
        const category = parts[4]+'-'+parts[5];
        console.log(category);
        const playerId = parts[2];
        const score = parseInt(parts[3]);
        updateScores(category, playerId, score);
    }
    else if (parts.length === 7 && parts[0] === 'referee' && parts[1] === 'SCORES') {
        const category = parts[5]+'-'+parts[6];
        console.log(category);
        const playerId = parts[2];
        const score = parseInt(parts[3]);
        updateScores(category, playerId, score);
    }
}

function updateScores(category, playerId, score) {
    const tableId = `${category}-table`;
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    let playerRow = Array.from(table.rows).find(row => row.cells[1].textContent === playerId);
    if (!playerRow) {
        playerRow = table.insertRow();
        const positionCell = playerRow.insertCell(0);
        const playerCell = playerRow.insertCell(1); 
        const scoreCell = playerRow.insertCell(2);
        playerCell.textContent = playerId; 
        scoreCell.textContent = score;
    } else {
        playerRow.cells[2].textContent = score;
    }
    sortTable(table);
}

function sortTable(table) {
    const rows = Array.from(table.rows);
    rows.sort((rowA, rowB) => {
        const scoreA = parseInt(rowA.cells[2].textContent);
        const scoreB = parseInt(rowB.cells[2].textContent);
        return scoreB - scoreA;
    });
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
        table.appendChild(row);
    });
}

start();