
function displayTournament() {
	fetch('tournament.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('tournament-inject');
			targetDiv.innerHTML = html;
			initTournament();
		})
		.catch(error => {
			console.error('Failed to fetch tournament.html:', error);
		});
}

/*
const tournamentState = {
	playersPool: [],
	semifinals: {
		match1: { players: [], readyStatus: [false, false], gaming: false, winner: null },
		match2: { players: [], readyStatus: [false, false], gaming: false, winner: null }
	},
	final: { players: [], readyStatus: [false, false], gaming: false, winner: null },
};
*/

async function initTournament() {
	console.log('Initializing tournament...');

	// Open websocket connection
	const user = await fetch('/auth/status', { method: 'GET', credentials: 'include' })
		.then(res => res.json());
	const socket = new WebSocket(`ws://${location.host}/ws/tournament`);

	socket.onopen = () => {
		console.log('Tournament WebSocket connection opened');
		socket.send(JSON.stringify({ type: 'enter-tournament-page', userId: user.username }));
	}

	socket.onmessage = (event) => {
		// const canvas = document.getElementById("game-canvas");
    	// const ctx = canvas.getContext("2d");
		const message = JSON.parse(event.data);
		console.log('Received message:', message);

		if (message.type === 'tournament-fill-page') {
			fillPlayersPool(message.playersPool);
			fillTournamentMap(message.semifinals, message.final, user.username, socket);
		}
		else if (message.type === 'tournament-update-pool') {
			fillPlayersPool(message.playersPool);
		}
		else if (message.type === 'tournament-update-map') {
			fillTournamentMap(message.semifinals, message.final, user.username, socket);
		}
		else if (message.type === 'tournament-update-ready-status') {
			const matchDiv = document.querySelector(`[data-match="${message.matchIndex}"]`);
			const button = matchDiv.querySelectorAll('.ready-btn')[message.playerIndex];
			button.classList.remove('bg-gray-400');
			button.classList.add('bg-green-600');
		}
		if (message.type === 'tournament-game-start') {
			// Hide tournament-inject div, show game-inject div
			putUserInfo(message); // An array of 4 players name
			startGame(user.username, socket); // and addEventListener to keydown
		}
		if (message.type === 'tournament-game-output') {
			draw(ctx, canvas, message);
		}
		if (message.type === 'tournament-game-end') {
			// Hide game-inject div and show tournament-inject div
		}
		if (message.type === 'error') {
			alert(message.message);
		}
	}
	enterButtonController(user, socket);
}

async function fillPlayersPool(playersPool) { // array of userId in string
	const playerSlots = document.querySelectorAll('.player-slot');
	const playerCount = playersPool.length;
	for (let i = 0; i < playerCount; i++) {
		const playerAvatar = playerSlots[i].querySelector('img');
		const playerName = playerSlots[i].querySelector('p');
		playerName.textContent = playersPool[i];
		playerAvatar.src = await fetch(`/users/${playersPool[i]}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
}

// situation 1: 2 semifinals are planned
// situation 2: Player ready status is set to true
// situation 3: Final match is planned
async function fillTournamentMap(semifinals, final, userId, socket) { // object, object, string, socket
	const semifinalMatchOne = document.querySelector(`[data-match="0"]`);
	const semifinalMatchTwo = document.querySelector(`[data-match="1"]`);
	const finalMatch = document.querySelector('.final-match');
	const champion = document.querySelector('.winner-container');
	const matchOneData = semifinals.match1;
	const matchTwoData = semifinals.match2;

	if (matchOneData.players.length > 0) { // matchmaking plans 2 semifinals oneshot, so just check if match 1 is planned and can fill the 2 semifinals' info together
		semifinalMatchOne.querySelector('.player1-name').textContent = matchOneData.players[0];
		semifinalMatchOne.querySelector('.player2-name').textContent = matchOneData.players[1];
		semifinalMatchOne.querySelector('.player1-avatar').src = await fetch(`/users/${matchOneData.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchOne.querySelector('.player2-avatar').src = await fetch(`/users/${matchOneData.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchTwo.querySelector('.player1-name').textContent = matchTwoData.players[0];
		semifinalMatchTwo.querySelector('.player2-name').textContent = matchTwoData.players[1];
		semifinalMatchTwo.querySelector('.player1-avatar').src = await fetch(`/users/${matchTwoData.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchTwo.querySelector('.player2-avatar').src = await fetch(`/users/${matchTwoData.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);
		if (matchOneData.readyStatus[0] === false && matchOneData.readyStatus[1] === false)
			readyButtonController(userId, socket, 0);
		if (matchTwoData.readyStatus[0] === false && matchTwoData.readyStatus[1] === false)
			readyButtonController(userId, socket, 1);
	}

	if (final.players.length > 0) {
		finalMatch.querySelector('.player1-name').textContent = final.players[0];
		finalMatch.querySelector('.player2-name').textContent = final.players[1];
		finalMatch.querySelector('.player1-avatar').src = await fetch(`/users/${final.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		finalMatch.querySelector('.player2-avatar').src = await fetch(`/users/${final.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);
		if (final.readyStatus[0] === false && final.readyStatus[1] === false)
			readyButtonController(userId, socket, 2);
	}

	if (final.winner != null) {
		champion.querySelector('.player-name').textContent = final.winner;
		champion.querySelector('.player-avatar').src = await fetch(`/users/${final.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
}

function enterButtonController(user, socket) { // object from /auth/status response, socket
	const enterButton = document.getElementById('enter-tournament-btn');
	enterButton.addEventListener('click', () => {
		socket.send(JSON.stringify({ type: 'tournament-join-pool', userId: user.username }));
	});
}

function readyButtonController(userId, socket, matchNumber) { // string, socket, number
	console.log('Setting up ready button controller for match:', matchNumber);
	const matchDiv = document.querySelector(`[data-match="${matchNumber}"]`); // 0, 1, 2
	const readyButtons = matchDiv.querySelectorAll('.ready-btn'); // 2 buttons of the match
	readyButtons.forEach(button => {
		// Remove the hidden class
		button.classList.remove('hidden');
		const playerName = button.parentElement.querySelector('span').textContent;
		if (playerName === userId) {
			console.log('User is the current player:', userId);
			// Add hover effect and event listener
			button.classList.add('hover:bg-green-600');
			button.addEventListener('click', () => {
				socket.send(JSON.stringify({ type: 'tournament-ready-for-game', match: matchNumber, userId: userId}));
				// When clicked, remove the hover effect and event listener
				button.classList.remove('hover:bg-green-600');
				button.classList.remove('bg-gray-400');
				button.classList.add('bg-green-600');
			})
		}
	});
}

async function startGame(userId, socket) {
    console.log(`Initializing remote game...`);
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

async function putUserInfo(message) {
    const leftUserAvatar = document.getElementById("player1-avatar");
    const rightUserAvatar = document.getElementById("player2-avatar");
    const leftUserName = document.getElementById("player1");
    const rightUserName = document.getElementById("player2");
    leftUserAvatar.src = await fetch(`/users/${message.player1}/avatar`).then(res => res.json()).then(data => data.avatar);
    rightUserAvatar.src = await getUserAvatarPath(message.player2);
    leftUserName.innerText = message.player1;
    rightUserName.innerText = message.player2;
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

export default displayTournament;