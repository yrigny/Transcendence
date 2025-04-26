
function displayGame() {
    const targetDiv = document.getElementById('game-inject');
    targetDiv.innerHTML = `
        <div class="flex min-h-screen flex-col items-center p-16">
            <!-- Top Section: Circles with Text -->
            <div class="mb-8 flex w-full max-w-xl justify-between items-center h-full">
                <!-- Left Circle (Profile) -->
                <div class="flex flex-col items-center">
                    <img id="player1-avatar" src="" class="h-20 w-20 rounded-full border-4 border-gray-200 bg-gray-300"/>
                    <p id="player1" class="mt-2 text-sm text-white">Player 1</p>
                </div>
                <!-- Middle Box (Game Start) -->
                <div class="flex flex-col items-center">
                    <button id="start-local-game" class="mb-2 w-full rounded-md bg-gray-300 p-3 transition duration-200 hover:bg-blue-300 text-gray-700">Start Local Game</button>
                    <button id="start-remote-game" class="w-full rounded-md bg-gray-300 p-3 transition duration-200 hover:bg-blue-300 text-gray-700">Start Remote Game</button>
                </div>
                <!-- Right Circle (Game Result) -->
                <div class="flex flex-col items-center">
                    <img id="player2-avatar" src="" class="h-20 w-20 rounded-full border-4 border-gray-200 bg-gray-300"/>
                    <p id="player2" class="mt-2 text-sm text-white">Player 2</p>
                </div>
            </div>
            <!-- Bottom Section: Game Canvas -->
            <canvas id="game-canvas" class="rounded-lg bg-black" width="600" height="400"></canvas>
        </div>
    `;
    initGame();
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

async function putUserInfo(message, isLocalGame) {
    const leftUserAvatar = document.getElementById("player1-avatar");
    const rightUserAvatar = document.getElementById("player2-avatar");
    const leftUserName = document.getElementById("player1");
    const rightUserName = document.getElementById("player2");

    leftUserAvatar.src = await getUserAvatarPath(message.player1);
    rightUserAvatar.src = isLocalGame
        ? leftUserAvatar.src
        : await getUserAvatarPath(message.player2);

    leftUserName.innerText = message.player1;
    rightUserName.innerText = isLocalGame ? message.player1 : message.player2;
}

async function initGame() {
    const startRemoteGame = document.getElementById("start-remote-game");
    const startLocalGame = document.getElementById("start-local-game");

    startRemoteGame.addEventListener("click", async () => {
        await startGame(false);
    });

    startLocalGame.addEventListener("click", async () => {
        await startGame(true);
    });
}

async function startGame(isLocalGame) {
    console.log(`Initializing ${isLocalGame ? 'local' : 'remote'} game...`);
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const userId = await getUserId() || 'Local User';
    console.log('User ID:', userId);

    const socket = new WebSocket(`ws://${location.host}/ws/game`);
    socket.onopen = function () {
        console.log('WebSocket connection opened');
        socket.send(JSON.stringify({ type: isLocalGame ? "join-single" : "join-double", userId }));
    };

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.type === (isLocalGame ? "game-start-local" : "game-start-remote")) {
            putUserInfo(message, isLocalGame);
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