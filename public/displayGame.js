var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        if (targetDiv) {
            targetDiv.innerHTML = html;
            initGame();
        }
    })
        .catch(err => console.error('Failed to fetch game.html:', err));
}
function getUserId() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/auth/status', {
                method: 'GET',
                credentials: 'include',
            });
            const data = yield res.json();
            return data.username || '';
        }
        catch (error) {
            console.error('Login check failed:', error);
            return '';
        }
    });
}
function getUserAvatarPath(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`/users/${username}/avatar`);
            if (res.ok) {
                const data = yield res.json();
                console.log('User avatar:', data.avatar);
                return data.avatar;
            }
            else {
                console.error('Failed to fetch user avatar:', res.status);
                return '/default-avatar.png';
            }
        }
        catch (error) {
            console.error('Error fetching user avatar:', error);
            return '/default-avatar.png';
        }
    });
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
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(text, x, y);
}
function draw(ctx, canvas, message) {
    ctx.clearRect(0, 0, 600, 400);
    if (message.type === 'output' && message.ball && message.paddles && message.scores) {
        drawCircle(ctx, message.ball.x, message.ball.y, 10, 'white');
        drawRect(ctx, 10, message.paddles[0].y, 10, 80, 'white');
        drawRect(ctx, canvas.width - 20, message.paddles[1].y, 10, 80, 'white');
        drawText(ctx, message.scores.left, 100, 50);
        drawText(ctx, message.scores.right, canvas.width - 100, 50);
    }
}
function putUserInfo(message, isLocalGame) {
    return __awaiter(this, void 0, void 0, function* () {
        const leftUserAvatar = document.getElementById("player1-avatar");
        const rightUserAvatar = document.getElementById("player2-avatar");
        const leftUserName = document.getElementById("player1");
        const rightUserName = document.getElementById("player2");
        if (leftUserAvatar && rightUserAvatar && leftUserName && rightUserName && message.player1) {
            leftUserAvatar.src = yield getUserAvatarPath(message.player1);
            if (isLocalGame) {
                rightUserAvatar.src = leftUserAvatar.src;
            }
            else if (message.player2) {
                rightUserAvatar.src = yield getUserAvatarPath(message.player2);
            }
            leftUserName.innerText = message.player1;
            rightUserName.innerText = isLocalGame ? message.player1 : message.player2 || '';
        }
    });
}
function initGame() {
    return __awaiter(this, void 0, void 0, function* () {
        const startRemoteGame = document.getElementById("start-remote-game");
        const startLocalGame = document.getElementById("start-local-game");
        startRemoteGame === null || startRemoteGame === void 0 ? void 0 : startRemoteGame.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            yield startGame(false);
        }));
        startLocalGame === null || startLocalGame === void 0 ? void 0 : startLocalGame.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            yield startGame(true);
        }));
    });
}
function startGame(isLocalGame) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Initializing ${isLocalGame ? 'local' : 'remote'} game...`);
        const canvas = document.getElementById("game-canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.error("Canvas context is not available");
            return;
        }
        const userId = (yield getUserId()) || 'Local User';
        console.log('User ID:', userId);
        const socket = new WebSocket(`ws://${location.host}/ws`);
        socket.onopen = () => {
            console.log('WebSocket connection opened');
            socket.send(JSON.stringify({
                type: isLocalGame ? "join-single" : "join-double",
                userId
            }));
        };
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === (isLocalGame ? "game-start-local" : "game-start-remote")) {
                putUserInfo(message, isLocalGame);
            }
            if (message.type === "output") {
                draw(ctx, canvas, message);
            }
        };
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        document.addEventListener("keydown", (e) => {
            const message = { type: "input", userId };
            if (e.key === "s")
                message.sKey = true;
            if (e.key === "w")
                message.wKey = true;
            if (e.key === "l")
                message.lKey = true;
            if (e.key === "o")
                message.oKey = true;
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(message));
            }
        });
    });
}
export default displayGame;
