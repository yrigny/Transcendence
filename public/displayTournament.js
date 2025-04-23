
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

const tournamentState = {
	playersPool: [],
	semifinals: {
		match1: { players: [], readyStatus: [false, false], gaming: false, winner: null },
		match2: { players: [], readyStatus: [false, false], gaming: false, winner: null }
	},
	final: { players: [], readyStatus: [false, false], gaming: false, winner: null },
};

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

		if (message.type === 'tournament-update-pool') {
			console.log('Received tournament-update-pool message', message);
			fillPlayersPool(message.playersPool);
		}
		if (message.type === 'tournament-update-map') {
			// Update tournament map
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
	}
	buttonController(user, socket);
}

async function fillPlayersPool(playersPool) { // data is from server
	console.log('Filling players pool:', playersPool);
	const playerSlots = document.querySelectorAll('.player-slot');
	playerSlots[0].querySelector('p').textContent = playersPool[0];
	playerSlots[1].querySelector('p').textContent = playersPool[1];
	playerSlots[2].querySelector('p').textContent = playersPool[2];
	playerSlots[3].querySelector('p').textContent = playersPool[3];
	// playerSlots.forEach(slot => async () => {
	// 	const avatar = slot.querySelector('img');
	// 	const playerName = slot.querySelector('p');
	// 	const slotIndex = slot.dataset.slot;
	// 	const dataset = playersPool[slotIndex];
	// 	playerName.textContent = dataset.userId;
	// 	avatar.src = await fetch(`/users/${dataset.userId}/avatar`).then(res => res.json()).then(data => data.avatar);
	// })
}

async function fillTournamentMap(tournamentState) {
	const semifinalMatchOne = document.querySelector(`[data-match="0"]`);
	const semifinalMatchTwo = document.querySelector(`[data-match="1"]`);
	const finalMatch = document.querySelector('.final-match');
	const champion = document.querySelector('.winner-container');
	const matchOneData = tournamentState.semifinals.match1;
	const matchTwoData = tournamentState.semifinals.match2;
	const finalMatchData = tournamentState.final;

	semifinalMatchOne.querySelector('.player1-name').textContent = matchOneData.players[0].userId;
	semifinalMatchOne.querySelector('.player2-name').textContent = matchOneData.players[1].userId;
	semifinalMatchOne.querySelector('.player1-avatar').src = await fetch(`/users/${matchOneData.players[0].userId}/avatar`).then(res => res.json()).then(data => data.avatar);
	semifinalMatchOne.querySelector('.player2-avatar').src = await fetch(`/users/${matchOneData.players[1].userId}/avatar`).then(res => res.json()).then(data => data.avatar);

	semifinalMatchTwo.querySelector('.player1-name').textContent = matchTwoData.players[0].userId;
	semifinalMatchTwo.querySelector('.player2-name').textContent = matchTwoData.players[1].userId;
	semifinalMatchTwo.querySelector('.player1-avatar').src = await fetch(`/users/${matchTwoData.players[0].userId}/avatar`).then(res => res.json()).then(data => data.avatar);
	semifinalMatchTwo.querySelector('.player2-avatar').src = await fetch(`/users/${matchTwoData.players[1].userId}/avatar`).then(res => res.json()).then(data => data.avatar);

	finalMatch.querySelector('.player1-name').textContent = finalMatchData.players[0].userId;
	finalMatch.querySelector('.player2-name').textContent = finalMatchData.players[1].userId;
	finalMatch.querySelector('.player1-avatar').src = await fetch(`/users/${finalMatchData.players[0].userId}/avatar`).then(res => res.json()).then(data => data.avatar);
	finalMatch.querySelector('.player2-avatar').src = await fetch(`/users/${finalMatchData.players[1].userId}/avatar`).then(res => res.json()).then(data => data.avatar);

	if (finalMatchData.winner) {
		champion.querySelector('.player-name').textContent = finalMatchData.winner;
		champion.querySelector('.player-avatar').src = await fetch(`/users/${finalMatchData.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
}

function buttonController(user, socket) {
	const enterButton = document.getElementById('enter-tournament-btn');
	enterButton.addEventListener('click', () => {
		console.log('Enter Tournament button clicked');
		// Send a join tournament request to the server through WebSocket
		socket.send(JSON.stringify({ type: 'tournament-join-pool', userId: user.username }));
	});

	const readyButtons = document.querySelectorAll('.ready-btn');
	readyButtons.forEach(button => {
		button.addEventListener('click', () => {
			console.log('Ready button clicked');
			// Send a join match No.X request to the server through WebSocket
		});
	});
}

function handleEnterTournament(event) {
	console.log('Enter Tournament button clicked');

	const availableSlots = document.querySelectorAll('[data-status="available"');
	console.log('Available slots:', availableSlots);

	if (availableSlots.length == 4) {
		// take the 1st slot where data-slot="0"
		playerTakeSlot(0);
	} else if (availableSlots.length == 3) {
		// take the 2nd slot where data-slot="1"
	} else if (availableSlots.length == 2) {
		// take the 3rd slot where data-slot="2"
	} else if (availableSlots.length == 1) {
		// take the 4th slot where data-slot="3"
	} else {
		// No available slots
		alert('No available slots in the next tournament.');
		return;
	}
}

async function playerTakeSlot(slotIndex) {
	const slot = document.querySelector(`[data-slot="${slotIndex}"]`);
	const user = await fetch('/auth/status', { method: 'GET', credentials: 'include' }).then(res => res.json());
	const avatar = slot.querySelector('img');
	avatar.src = await fetch(`/users/${user.username}/avatar`).then(res => res.json()).then(data => data.avatar);
	const playerName = slot.querySelector('p');
	playerName.textContent = user.username;
	slot.dataset.status = 'taken';
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