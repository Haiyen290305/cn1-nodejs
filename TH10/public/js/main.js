const socket = io();

// ==========================
// UI ELEMENTS
// ==========================
const loginScreen = document.getElementById('login-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');

const myNameUI = document.getElementById('my-name');
const userListUI = document.getElementById('user-list');
const onlineCount = document.getElementById('online-count');

const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const messageDisplay = document.getElementById('message-display');
const chatWithTitle = document.getElementById('chat-with-title');

const emojiBtn = document.getElementById('emoji-btn');
const imageInput = document.getElementById('image-input');

// GAME
const gameModal = document.getElementById('game-modal');
const openGameBtn = document.getElementById('open-game-btn');
const closeGameBtn = document.getElementById('close-game-btn');

const board = document.getElementById('board');
const currentTurnUI = document.getElementById('current-turn');
const resetBtn = document.getElementById('reset-game');


// ==========================
// VARIABLES
// ==========================
let myName = '';
let selectedUser = '';

let conversations = {};

let cells = Array(9).fill('');

let currentTurn = 'X';

let gameOver = false;


// ==========================
// LOGIN
// ==========================
joinBtn.onclick = () => {

    myName = usernameInput.value.trim();

    if (!myName) {

        alert('Vui lòng nhập tên');

        return;
    }

    socket.emit('register-user', myName);

    myNameUI.innerText = myName;

    loginScreen.style.display = 'none';
};


// ==========================
// UPDATE USER LIST
// ==========================
socket.on('update-user-list', (users) => {

    userListUI.innerHTML = '';

    const filteredUsers =
        users.filter(user => user !== myName);

    onlineCount.innerText =
        filteredUsers.length;

    filteredUsers.forEach(user => {

        const li = document.createElement('li');

        li.classList.add('user-item');

        if (user === selectedUser) {

            li.classList.add('active');
        }

        li.innerHTML = `
            <div class="avatar-container">
                <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user}"
                    alt="avatar">
            </div>

            <div class="user-info">

                <span class="user-name">
                    ${user}
                </span>

                <span class="status-text">
                    Đang hoạt động
                </span>

            </div>
        `;

        li.onclick = () => {

            document
                .querySelectorAll('.user-item')
                .forEach(el => {

                    el.classList.remove('active');
                });

            li.classList.add('active');

            selectedUser = user;

            chatWithTitle.innerText =
                `Đang chat với: ${user}`;

            renderConversation(user);
        };

        userListUI.appendChild(li);
    });
});


// ==========================
// SEND MESSAGE
// ==========================
chatForm.onsubmit = (e) => {

    e.preventDefault();

    const message = msgInput.value.trim();

    if (!selectedUser) {

        alert('Hãy chọn người để chat');

        return;
    }

    if (!message) return;

    const data = {

        to: selectedUser,

        sender: myName,

        message: message,

        time: new Date().toLocaleTimeString([], {

            hour: '2-digit',

            minute: '2-digit'
        })
    };

    socket.emit('private-message', data);

    saveAndRenderMessage(
        selectedUser,
        {
            ...data,
            sender: 'Bạn',
            type: 'sent'
        }
    );

    msgInput.value = '';
};


// ==========================
// RECEIVE MESSAGE
// ==========================
socket.on('receive-private-message', (data) => {

    saveAndRenderMessage(
        data.sender,
        {
            ...data,
            type: 'received'
        }
    );
});


// ==========================
// SEND IMAGE
// ==========================
imageInput.onchange = () => {

    const file = imageInput.files[0];

    if (!file || !selectedUser) return;

    const reader = new FileReader();

    reader.onload = () => {

        const data = {

            to: selectedUser,

            sender: myName,

            image: reader.result,

            time: new Date().toLocaleTimeString([], {

                hour: '2-digit',

                minute: '2-digit'
            })
        };

        socket.emit('send-image', data);

        saveAndRenderMessage(
            selectedUser,
            {
                ...data,
                sender: 'Bạn',
                type: 'sent-image'
            }
        );
    };

    reader.readAsDataURL(file);

    imageInput.value = '';
};


// ==========================
// RECEIVE IMAGE
// ==========================
socket.on('receive-image', (data) => {

    saveAndRenderMessage(
        data.sender,
        {
            ...data,
            type: 'received-image'
        }
    );
});


// ==========================
// SAVE MESSAGE
// ==========================
function saveAndRenderMessage(targetUser, msgData) {

    if (!conversations[targetUser]) {

        conversations[targetUser] = [];
    }

    conversations[targetUser].push(msgData);

    if (selectedUser === targetUser) {

        renderConversation(targetUser);
    }
}


// ==========================
// RENDER CONVERSATION
// ==========================
function renderConversation(user) {

    messageDisplay.innerHTML = '';

    if (!conversations[user]) return;

    conversations[user].forEach(msg => {

        const div = document.createElement('div');

        const isSent =
            msg.type.startsWith('sent');

        div.classList.add(
            'msg',
            isSent ? 'sent' : 'received'
        );

        // IMAGE
        if (msg.image) {

            div.innerHTML = `

                <img
                    src="${msg.image}"
                    class="chat-image">

                <div class="msg-time">
                    ${msg.time}
                </div>
            `;

        } else {

            div.innerHTML = `

                <p>${msg.message}</p>

                <div class="msg-time">
                    ${msg.time}
                </div>
            `;
        }

        messageDisplay.appendChild(div);
    });

    messageDisplay.scrollTop =
        messageDisplay.scrollHeight;
}


// ==========================
// CHANGE COLOR
// ==========================
document
.querySelectorAll('.color-dot')
.forEach(dot => {

    dot.onclick = () => {

        const color =
            dot.getAttribute('data-color');

        document.documentElement
            .style
            .setProperty(
                '--primary-color',
                color
            );

        document
        .querySelectorAll('.color-dot')
        .forEach(d => {

            d.classList.remove('active');
        });

        dot.classList.add('active');
    };
});


// ==========================
// EMOJI
// ==========================
emojiBtn.onclick = () => {

    msgInput.value += '😀';

    msgInput.focus();
};


// ==========================
// OPEN GAME
// ==========================
openGameBtn.onclick = () => {

    if (!selectedUser) {

        alert('Hãy chọn người để chơi');

        return;
    }

    gameModal.style.display = 'flex';
};


// ==========================
// CLOSE GAME
// ==========================
closeGameBtn.onclick = () => {

    gameModal.style.display = 'none';
};


// ==========================
// CREATE BOARD
// ==========================
function createBoard() {

    board.innerHTML = '';

    cells.forEach((cell, index) => {

        const div = document.createElement('div');

        div.classList.add('cell');

        if (cell) {

            div.classList.add(
                cell.toLowerCase()
            );
        }

        div.innerText = cell;

        div.onclick = () => makeMove(index);

        board.appendChild(div);
    });
}


// ==========================
// MAKE MOVE
// ==========================
function makeMove(index) {

    if (
        gameOver ||
        cells[index] !== '' ||
        !selectedUser
    ) return;

    cells[index] = currentTurn;

    createBoard();

    if (checkWinner()) {

        alert(`${currentTurn} thắng`);

        gameOver = true;

    } else {

        currentTurn =
            currentTurn === 'X'
            ? 'O'
            : 'X';

        currentTurnUI.innerText =
            currentTurn;
    }

    socket.emit('game-move', {

        cells,

        currentTurn,

        gameOver,

        to: selectedUser
    });
}


// ==========================
// CHECK WINNER
// ==========================
function checkWinner() {

    const wins = [

        [0,1,2],
        [3,4,5],
        [6,7,8],

        [0,3,6],
        [1,4,7],
        [2,5,8],

        [0,4,8],
        [2,4,6]
    ];

    return wins.some(([a,b,c]) => {

        return (

            cells[a] &&

            cells[a] === cells[b] &&

            cells[a] === cells[c]
        );
    });
}


// ==========================
// UPDATE GAME
// ==========================
socket.on('update-game', (data) => {

    cells = data.cells;

    currentTurn = data.currentTurn;

    gameOver = data.gameOver;

    currentTurnUI.innerText =
        currentTurn;

    createBoard();
});


// ==========================
// RESET BUTTON
// ==========================
resetBtn.onclick = () => {

    resetGame();

    socket.emit(
        'reset-game',
        selectedUser
    );
};


// ==========================
// RECEIVE RESET
// ==========================
socket.on('game-reset', () => {

    resetGame();
});


// ==========================
// RESET GAME
// ==========================
function resetGame() {

    cells = Array(9).fill('');

    currentTurn = 'X';

    gameOver = false;

    currentTurnUI.innerText =
        currentTurn;

    createBoard();
}


// ==========================
// INIT
// ==========================
createBoard();