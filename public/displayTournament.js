
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
		const canvas = document.getElementById("game-canvas");
    	const ctx = canvas.getContext("2d");
		const message = JSON.parse(event.data);
		// console.log('Received message:', message);

		if (message.type === 'tournament-fill-page') {
			fillPlayersPool(message.playersPool);
			fillTournamentMap(message, user.username, socket);
			enterButtonController(user, socket);
		}
		// else if (message.type === 'tournament-reset') {
		// 	resetTournament();
		// }
		else if (message.type === 'tournament-update-pool') {
			fillPlayersPool(message.playersPool);
		}
		else if (message.type === 'tournament-update-map') {
			fillTournamentMap(message, user.username, socket);
		}
		else if (message.type === 'tournament-update-ready-status') {
			const matchDiv = document.querySelector(`[data-match="${message.matchIndex}"]`);
			const button = matchDiv.querySelectorAll('.ready-btn')[message.playerIndex];
			button.classList.remove('bg-gray-400');
			button.classList.add('bg-green-600');
		}
		else if (message.type === 'tournament-game-start') {
			console.log('Game started, players:', message.player1, message.player2);
			document.getElementById('tournament-zone').classList.add('hidden');
			document.getElementById('game-zone').classList.remove('hidden');
			// If the game is played by the current user, add event listener to keydown
			if (message.player1 === user.username || message.player2 === user.username)
				startGame(user.username, socket);
			putUserInfo(message);
		}
		else if (message.type === 'output') {
			draw(ctx, canvas, message);
		}
		else if (message.type === 'tournament-game-end') {
			document.getElementById('game-zone').classList.add('hidden');
			document.getElementById('tournament-zone').classList.remove('hidden');
			console.log('Game ended, message:', message);
			fillTournamentMap(message, user.username, socket);
			// If the game is played by the current user, remove event listener to keydown
			if (message.player1 === user.username || message.player2 === user.username)
				endGame(user.username, socket);
		}
		else if (message.type === 'error') {
			alert(message.message);
		}
	}
	socket.onclose = () => {
		console.log('Tournament WebSocket connection closed');
		resetTournament();
	}
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
// situation 3: Final match player is set
// situation 4: Winner is set
// situation 5: New client enters the tournament page
async function fillTournamentMap(message, userId, socket) { // object, object, string, socket
	const semifinalMatchOne = document.querySelector(`[data-match="0"]`);
	const semifinalMatchTwo = document.querySelector(`[data-match="1"]`);
	const finalMatch = document.querySelector('.final-match');
	const champion = document.querySelector('.winner-container');
	const matchOneData = message.semifinals.match1;
	const matchTwoData = message.semifinals.match2;

	if (matchOneData.players.length > 0 && 
		((!matchOneData.winner && !matchTwoData.winner) || message.type === 'tournament-fill-page')) {
		semifinalMatchOne.querySelector('.player1-name').textContent = matchOneData.players[0];
		semifinalMatchOne.querySelector('.player2-name').textContent = matchOneData.players[1];
		semifinalMatchOne.querySelector('.player1-avatar').src = await fetch(`/users/${matchOneData.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchOne.querySelector('.player2-avatar').src = await fetch(`/users/${matchOneData.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchTwo.querySelector('.player1-name').textContent = matchTwoData.players[0];
		semifinalMatchTwo.querySelector('.player2-name').textContent = matchTwoData.players[1];
		semifinalMatchTwo.querySelector('.player1-avatar').src = await fetch(`/users/${matchTwoData.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchTwo.querySelector('.player2-avatar').src = await fetch(`/users/${matchTwoData.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);
		readyButtonController(userId, socket, 0);
		readyButtonController(userId, socket, 1);
	}
	// if the page is filled for the first time, update the ready button color
	if (message.type === 'tournament-fill-page') {
		if (matchOneData.readyStatus[0]) {
			semifinalMatchOne.querySelectorAll('.ready-btn')[0].classList.remove('bg-gray-400');
			semifinalMatchOne.querySelectorAll('.ready-btn')[0].classList.add('bg-green-600');
		}
		if (matchOneData.readyStatus[1]) {
			semifinalMatchOne.querySelectorAll('.ready-btn')[1].classList.remove('bg-gray-400');
			semifinalMatchOne.querySelectorAll('.ready-btn')[1].classList.add('bg-green-600');
		}
		if (matchTwoData.readyStatus[0]) {
			semifinalMatchTwo.querySelectorAll('.ready-btn')[0].classList.remove('bg-gray-400');
			semifinalMatchTwo.querySelectorAll('.ready-btn')[0].classList.add('bg-green-600');
		}
		if (matchTwoData.readyStatus[1]) {
			semifinalMatchTwo.querySelectorAll('.ready-btn')[1].classList.remove('bg-gray-400');
			semifinalMatchTwo.querySelectorAll('.ready-btn')[1].classList.add('bg-green-600');
		}
		if (message.final.readyStatus[0]) {
			finalMatch.querySelectorAll('.ready-btn')[0].classList.remove('bg-gray-400');
			finalMatch.querySelectorAll('.ready-btn')[0].classList.add('bg-green-600');
		}
		if (message.final.readyStatus[1]) {
			finalMatch.querySelectorAll('.ready-btn')[1].classList.remove('bg-gray-400');
			finalMatch.querySelectorAll('.ready-btn')[1].classList.add('bg-green-600');
		}
	}
	if (matchOneData.winner) {
		finalMatch.querySelector('.player1-name').textContent = matchOneData.winner;
		finalMatch.querySelector('.player1-avatar').src = await fetch(`/users/${matchOneData.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
	if (matchTwoData.winner) {
		finalMatch.querySelector('.player2-name').textContent = matchTwoData.winner;
		finalMatch.querySelector('.player2-avatar').src = await fetch(`/users/${matchTwoData.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
	if (message.final.players.length === 2 && !message.final.readyStatus[0] && !message.final.readyStatus[1])
		readyButtonController(userId, socket, 2);
	if (message.final.winner != null) {
		champion.querySelector('.player-name').textContent = message.final.winner;
		champion.querySelector('.player-avatar').src = await fetch(`/users/${message.final.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
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

async function endGame(userId, socket) { // remove event listener doesn't work but not a big deal
	console.log(`Ending remote game...`);
	document.removeEventListener("keydown", (e) => {
		const message = { type: "input", userId: userId };
		if (e.key === "s") message.sKey = false;
		if (e.key === "w") message.wKey = false;
		if (e.key === "l") message.lKey = false;
		if (e.key === "o") message.oKey = false;
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(message));
		}
	});
}

function resetTournament() {
	document.getElementById('tournament-inject').innerHTML = `
		<div id="tournament-zone">
			<!-- Waiting Pool Section -->
			<div class="w-full max-w-4xl mb-8">
				<h2 class="text-xl font-semibold mb-4 w-full">Waiting Pool</h2>
				<div class="flex w-full">
					<button id="enter-tournament-btn" class="enter-btn bg-blue-500 text-lg font-semibold text-white py-2 px-4 mr-4 rounded-lg hover:bg-blue-600">Enter Tournament</button>
					<div id="waiting-pool" class="grid grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow text-indigo-600">
						<div class="player-slot flex flex-1 flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg" data-slot="0" data-status="available">
							<img src="" class="h-16 w-16 rounded-full border-4 border-gray-200 bg-gray-300"/>
							<p class="p-1">Player</p>
						</div>
						<div class="player-slot flex flex-1 flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg" data-slot="1" data-status="available">
							<img src="" class="h-16 w-16 rounded-full border-4 border-gray-200 bg-gray-300"/>
							<p class="p-1">Player</p>
						</div>
						<div class="player-slot flex flex-1 flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg" data-slot="2" data-status="available">
							<img src="" class="h-16 w-16 rounded-full border-4 border-gray-200 bg-gray-300"/>
							<p class="p-1">Player</p>
						</div>
						<div class="player-slot flex flex-1 flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg" data-slot="3" data-status="available">
							<img src="" class="h-16 w-16 rounded-full border-4 border-gray-200 bg-gray-300"/>
							<p class="p-1">Player</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Tournament Bracket -->
			<div class="w-full max-w-4xl">
				<div class="grid grid-cols-3 gap-4 mb-4 text-center">
					<h3 class="text-white text-lg font-semibold">Semifinals</h3>
					<h3 class="text-white text-lg font-semibold">Finals</h3>
					<h3 class="text-white text-lg font-semibold">Champion</h3>
				</div>
				<div class="grid grid-cols-3 gap-2 bg-white p-6 rounded-lg shadow">
					<!-- Semifinal Column -->
					<div class="semifinal-column">
						<div class="semifinal-match mb-8 border border-gray-200 rounded-lg p-4" data-match="0">
							<div class="semifinal-players">
								<div class="semifinal-player flex justify-between items-center mb-2 p-2 rounded bg-gray-50">
									<div class="flex items-center">
										<img src="" class="player1-avatar w-10 h-10 rounded-full bg-gray-300" />
										<span class="player1-name text-indigo-600 px-2">TBD</span>
									</div>
									<button class="hidden ready-btn bg-gray-400 text-white py-1 px-1 rounded text-sm">Ready</button>
								</div>
								<div class="semifinal-player flex justify-between items-center p-2 rounded bg-gray-50">
									<div class="flex items-center">
										<img src="" class="player2-avatar w-10 h-10 rounded-full bg-gray-300" />
										<span class="player2-name text-indigo-600 px-2">TBD</span>
									</div>
									<button class="hidden ready-btn bg-gray-400 text-white py-1 px-1 rounded text-sm">Ready</button>
								</div>
							</div>
						</div>	
						<div class="semifinal-match border border-gray-200 rounded-lg p-4" data-match="1">
							<div class="semifinal-players">
								<div class="semifinal-player flex justify-between items-center mb-2 p-2 rounded bg-gray-50">
									<div class="flex items-center">
									<img src="" class="player1-avatar w-10 h-10 rounded-full bg-gray-300" />
									<span class="player1-name text-indigo-600 px-2">TBD</span>
									</div>
									<button class="hidden ready-btn bg-gray-400 text-white py-1 px-1 rounded text-sm">Ready</button>
								</div>
								<div class="semifinal-player flex justify-between items-center p-2 rounded bg-gray-50">
									<div class="flex items-center">
										<img src="" class="player2-avatar w-10 h-10 rounded-full bg-gray-300" />
										<span class="player2-name text-indigo-600 px-2">TBD</span>
									</div>
									<button class="hidden ready-btn bg-gray-400 text-white py-1 px-1 rounded text-sm">Ready</button>
								</div>
							</div>
						</div>
					</div>
					
					<!-- Final Column -->
					<div class="final-column flex items-center justify-center h-full">
						<div class="final-match border border-gray-200 rounded-lg p-4" data-match="2">
							<div class="final-players">
								<div class="final-player flex justify-between items-center mb-2 p-2 rounded bg-gray-50">
									<div class="flex items-center">
										<img src="" class="player1-avatar w-10 h-10 rounded-full bg-gray-300" />
										<span class="player1-name text-indigo-600 px-2">TBD</span>
									</div>
									<button class="hidden ready-btn bg-gray-400 text-white py-1 px-1 rounded text-sm">Ready</button>
								</div>
								<div class="final-player flex justify-between items-center p-2 rounded bg-gray-50">
									<div class="flex items-center">
										<img src="" class="player2-avatar w-10 h-10 rounded-full bg-gray-300" />
										<span class="player2-name text-indigo-600 px-2">TBD</span>
									</div>
									<button class="hidden ready-btn bg-gray-400 text-white py-1 px-1 rounded text-sm">Ready</button>
								</div>
							</div>
						</div>
					</div>
					
					<!-- Winner Column -->
					<div class="winner-column flex items-center justify-center h-full">
						<div class="winner-container flex justify-center items-center border border-gray-200 rounded-lg p-4 w-full">
							<div class="flex items-center">
								<img src="" class="player-avatar w-10 h-10 rounded-full bg-gray-300" />
								<span class="player-name text-indigo-600 px-2">TBD</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Game Zone -->
		<div id="game-zone" class="hidden flex min-h-screen flex-col items-center p-16">
			<!-- Top Section: Circles with Text -->
			<div class="mb-8 flex w-full max-w-xl justify-between items-center h-full">
				<!-- Left Circle (Profile) -->
				<div class="flex flex-col items-center">
					<img id="player1-avatar" src="" class="h-20 w-20 rounded-full border-4 border-gray-200 bg-gray-300"/>
					<p id="player1" class="mt-2 text-sm text-white">Player 1</p>
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
}

async function putUserInfo(message) {
	const gameZone = document.getElementById('game-zone');
    const leftUserAvatar = gameZone.querySelectorAll('img')[0];
	const rightUserAvatar = gameZone.querySelectorAll('img')[1];
    const leftUserName = gameZone.querySelectorAll('p')[0];
    const rightUserName = gameZone.querySelectorAll('p')[1];
    leftUserAvatar.src = await fetch(`/users/${message.player1}/avatar`).then(res => res.json()).then(data => data.avatar);
    rightUserAvatar.src = await fetch(`/users/${message.player2}/avatar`).then(res => res.json()).then(data => data.avatar);
    leftUserName.innerText = message.player1;
    rightUserName.innerText = message.player2;
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