type GameMessage = {
    type: string;
    ball: { x: number; y: number };
    paddles: { y: number }[];
    scores: { left: string; right: string };
    player1: string;
    player2: string;
}

function displayGame() {
    const targetDiv = document.getElementById('game-inject');
    if (!targetDiv) {
        console.error('Target div not found');
        return;
    }
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

async function getUserId(): Promise<string> {
    try {
        const res = await fetch('/auth/status', {
            method: 'GET',
            credentials: 'include',
        });
        const data = await res.json();
        return data.username || '';
    } catch (error) {
        console.error('Login check failed:', error);
        return '';
    }
}

async function getUserAvatarPath(username: string): Promise<string> {
    try {
        const res = await fetch(`/users/${username}/avatar`);
        if (res.ok) {
            const data = await res.json();
            console.log('User avatar:', data.avatar);
            return data.avatar;
        } else {
            console.error('Failed to fetch user avatar:', res.status);
            return '/uploads/default-avatar.png';
        }
    } catch (error) {
        console.error('Error fetching user avatar:', error);
        return '/uploads/default-avatar.png';
    }
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(text, x, y);
}

function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: GameMessage): void {
    ctx.clearRect(0, 0, 600, 400);
    if (message.type === 'output' && message.ball && message.paddles && message.scores) {
        drawCircle(ctx, message.ball.x, message.ball.y, 10, 'white');
        drawRect(ctx, 10, message.paddles[0].y, 10, 80, 'white');
        drawRect(ctx, canvas.width - 20, message.paddles[1].y, 10, 80, 'white');
        drawText(ctx, message.scores.left, 100, 50);
        drawText(ctx, message.scores.right, canvas.width - 100, 50);
    }
}

async function putUserInfo(message: GameMessage, isLocalGame: boolean): Promise<void> {
    const leftUserAvatar = document.getElementById("player1-avatar") as HTMLImageElement;
    const rightUserAvatar = document.getElementById("player2-avatar") as HTMLImageElement;
    const leftUserName = document.getElementById("player1");
    const rightUserName = document.getElementById("player2");

    if (leftUserAvatar && rightUserAvatar && leftUserName && rightUserName && message.player1) {
        leftUserAvatar.src = await getUserAvatarPath(message.player1);
        if (isLocalGame) {
            rightUserAvatar.src = leftUserAvatar.src;
        } else if (message.player2) {
            rightUserAvatar.src = await getUserAvatarPath(message.player2);
        }

        leftUserName.innerText = message.player1;
        rightUserName.innerText = isLocalGame ? message.player1 : message.player2 || '';
    }
}

async function initGame(): Promise<void> {
    const startRemoteGame = document.getElementById("start-remote-game");
    const startLocalGame = document.getElementById("start-local-game");

    startRemoteGame?.addEventListener("click", async () => {
        await startGame(false);
    });

    startLocalGame?.addEventListener("click", async () => {
        await startGame(true);
    });
}

async function startGame(isLocalGame: boolean): Promise<void> {
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        console.error("Canvas context is not available");
        return;
    }

    const userId = await getUserId() || 'Local User';
    console.log(userId, `is starting a ${isLocalGame ? 'local' : 'remote'} game...`);

    const socket = new WebSocket(`wss://${location.host}/ws/game`);

    socket.onopen = () => {
        console.log('WebSocket connection opened');
        socket.send(JSON.stringify({
            type: isLocalGame ? "join-single" : "join-double",
            userId
        }));
    };

    socket.onmessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === (isLocalGame ? "game-start-local" : "game-start-remote")) {
            putUserInfo(message, isLocalGame);
        }
        if (message.type === "output") {
            draw(ctx, canvas, message);
        }
        if (message.type === "error") {
            console.error("Error from server:", message.message);
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    document.addEventListener("keydown", (e: KeyboardEvent) => {
        const message: any = { type: "input", userId };
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
