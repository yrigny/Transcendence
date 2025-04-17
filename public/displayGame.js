function displayGame() {
    fetch('game.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            const targetDiv = document.getElementById('game-inject');
            targetDiv.innerHTML = html;
            initGame();
        })
        .catch(err => console.error('Failed to fetch game.html:', err));
}

async function getUserId() {
    try {
        const res = await fetch('/auth/status', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        return data.username || '';
    } catch (error) {
        console.error('Login check failed:', error);
        return '';
    }
}

async function getUserAvatarPath(username) {
    try {
        const res = await fetch(`/users/${username}/avatar`);
        if (res.ok) {
            const data = await res.json();
            console.log('User avatar: ', data.avatar);
            return data.avatar;
        } else {
            console.error('Failed to fetch user avatar:', res.status);
            return '/default-avatar.png';
        }
    } catch (error) {
        console.error('Error fetching user avatar:', error);
        return '/default-avatar.png';
    }
}

function drawRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(ctx, text, x, y) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(text, x, y);
}

function draw(ctx, canvas, message) {
    ctx.clearRect(0, 0, 600, 400);
    if (message.type === "output") {
        drawCircle(ctx, message.ball.x, message.ball.y, 10, "white");
        drawRect(ctx, 10, message.paddles[0].y, 10, 80, "white");
        drawRect(ctx, canvas.width - 20, message.paddles[1].y, 10, 80, "white");
        drawText(ctx, message.scores.left, 100, 50);
        drawText(ctx, message.scores.right, canvas.width - 100, 50);
    }
}

async function putUserInfo(message, isSinglePlayer) {
    const leftUserAvatar = document.getElementById("player1-avatar");
    const rightUserAvatar = document.getElementById("player2-avatar");
    const leftUserName = document.getElementById("player1");
    const rightUserName = document.getElementById("player2");

    leftUserAvatar.src = await getUserAvatarPath(message.player1);
    rightUserAvatar.src = isSinglePlayer
        ? leftUserAvatar.src
        : await getUserAvatarPath(message.player2);

    leftUserName.innerText = message.player1;
    rightUserName.innerText = isSinglePlayer ? message.player1 : message.player2;
}

async function initGame() {
    const startDoublePlayerGame = document.getElementById("start-game");
    const startSinglePlayerGame = document.getElementById("start-game-single");

    startDoublePlayerGame.addEventListener("click", async () => {
        await startGame(false);
    });

    startSinglePlayerGame.addEventListener("click", async () => {
        await startGame(true);
    });
}

async function startGame(isSinglePlayer) {
    console.log(`Initializing ${isSinglePlayer ? 'single' : 'double'}-player game...`);
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const userId = await getUserId();
    console.log('User ID:', userId);

    const socket = new WebSocket(`ws://${location.host}/ws`);
    socket.onopen = function () {
        console.log('WebSocket connection opened');
        socket.send(JSON.stringify({ type: isSinglePlayer ? "join-single" : "join-double", userId }));
    };

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.type === (isSinglePlayer ? "gameStart-single" : "gameStart-double")) {
            putUserInfo(message, isSinglePlayer);
        }
        if (message.type === "output") {
            draw(ctx, canvas, message);
        }
    };

    socket.onerror = function (error) {
        console.error('WebSocket error:', error);
    };

    document.addEventListener("keydown", (e) => {
        const message = { type: "input", userId: userId };
        if (e.key === "s") message.sKey = true;
        if (e.key === "w") message.wKey = true;
        if (e.key === "l") message.lKey = true;
        if (e.key === "o") message.oKey = true;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    });
}

export default displayGame;