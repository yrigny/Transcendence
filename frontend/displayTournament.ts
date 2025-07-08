type TournamentMessage = {
    type: string;
	semifinals: {
		match1: MatchData;
		match2: MatchData;
	};
	final: MatchData
}

type GameMessage = {
	type: string;
	ball: { x: number; y: number };
    paddles: { y: number }[];
    scores: { left: string; right: string };
}

type PlayerInfo = {
	type: string;
	players: string[];
	alias: string[];
}

interface MatchData {
	players: [string, string];
	alias: [string, string];
	readyStatus: [boolean, boolean];
	winner: string;
}

type User = {
    username: string;
	isLoggedIn: boolean
};

function displayTournament() {
	const targetDiv = document.getElementById('tournament-inject');
	if (!targetDiv) {
		console.error('Target div not found');
		return;
	}
	targetDiv.innerHTML = `
	<div id="tournament-zone">
		<!-- Waiting Pool Section -->
		<div class="w-full max-w-4xl mb-8">
			<h2 class="text-xl font-semibold mb-4 w-full">Waiting Pool</h2>
			<div class="flex w-full">
				<div id="enter-tournament" class="flex flex-col w-1/4  mr-4 bg-blue-500 rounded-lg p-4">
					<input id="alias-input" type="text" placeholder="Enter Your Alias" class="border text-sm text-gray-50 border-gray-300 rounded-lg py-2 px-3 mt-2 mb-2 w-full" />
					<button id="enter-tournament-btn" class="enter-btn text-lg font-semibold text-white py-2 px-4 w-full rounded-lg hover:bg-blue-600">Enter Tournament</button>
				</div>
				<div id="waiting-pool" class="grid flex-1 grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow text-indigo-600">
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
	initTournament();
}

async function initTournament() {
	console.log('Initializing tournament...');

	const user = await fetch('/auth/status', { method: 'GET', credentials: 'include' })
		.then(res => res.json());
	const socket = new WebSocket(`wss://${location.host}/ws/tournament`);

	socket.onopen = () => {
		console.log('Tournament WebSocket connection opened');
		socket.send(JSON.stringify({ type: 'enter-tournament-page', userId: user.username }));
	}

	socket.onmessage = (event) => {
		const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    	const ctx = canvas.getContext("2d");
		const message = JSON.parse(event.data);

		if (!ctx) {
			console.error("Canvas context is not available");
			return;
		}
		if (message.type === 'tournament-fill-page') {
			fillPlayersPool(message.playersPool, message.playersAlias);
			fillTournamentMap(message, user.username, socket);
			enterButtonController(user, socket);
		}
		else if (message.type === 'tournament-update-pool') {
			console.log('message:', message);
			fillPlayersPool(message.playersPool, message.playersAlias);
		}
		else if (message.type === 'tournament-update-map') {
			fillTournamentMap(message, user.username, socket);
		}
		else if (message.type === 'tournament-update-ready-status') {
			const matchDiv = document.querySelector(`[data-match="${message.matchIndex}"]`);
			if (matchDiv)
			{
				const button = matchDiv.querySelectorAll('.ready-btn')[message.playerIndex];
				button.classList.remove('bg-gray-400');
				button.classList.add('bg-green-600');
			}
			
		}
		else if (message.type === 'tournament-game-start') {
			console.log('Game started, players:', message.players[0], message.players[1]);
			document.getElementById('tournament-zone')!.classList.add('hidden');
			document.getElementById('game-zone')!.classList.remove('hidden');
			// If the game is played by the current user, add event listener to keydown
			if (message.players.includes(user.username))
				startGame(user.username, socket);
			putUserInfo(message);
		}
		else if (message.type === 'output') {
			draw(ctx, canvas, message);
		}
		else if (message.type === 'tournament-game-end') {
			document.getElementById('game-zone')!.classList.add('hidden');
			document.getElementById('tournament-zone')!.classList.remove('hidden');
			console.log('Game ended, message:', message);
			fillTournamentMap(message, user.username, socket);
			// If the match is played by the current user, remove event listener to keydown
			if (message.matchIndex === 0 && message.semifinals.match1.players.includes(user.username) ||
				message.matchIndex === 1 && message.semifinals.match2.players.includes(user.username) ||
				message.matchIndex === 2 && message.final.players.includes(user.username))
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
async function fillPlayersPool(playersPool : string[], playersAlias: string[]) {
	const playerSlots = document.querySelectorAll('.player-slot');
	const playerCount = playersPool.length;
	for (let i = 0; i < playerCount; i++) {
		const playerAvatar = playerSlots[i].querySelector('img');
		const playerName = playerSlots[i].querySelector('p');
		if (playerName && playerAvatar)
		{
			playerName.textContent = playersAlias[i];
			playerAvatar.src = await fetch(`/users/${playersPool[i]}/avatar`).then(res => res.json()).then(data => data.avatar);
		}
	}
}

async function fillTournamentMap(message: TournamentMessage, userId: string, socket: WebSocket) {
	const semifinalMatchOne = document.querySelector(`[data-match="0"]`);
	const semifinalMatchTwo = document.querySelector(`[data-match="1"]`);
	const finalMatch = document.querySelector('.final-match');
	const champion = document.querySelector('.winner-container');
	const matchOneData = message.semifinals.match1;
	const matchTwoData = message.semifinals.match2;

	if (semifinalMatchOne && semifinalMatchTwo &&  matchOneData.players.length > 0 && 
		((!matchOneData.winner && !matchTwoData.winner) || message.type === 'tournament-fill-page')) {

		semifinalMatchOne.querySelector('.player1-name')!.textContent = matchOneData.alias[0];
		semifinalMatchOne.querySelector('.player2-name')!.textContent = matchOneData.alias[1];
		const semifinalMatchOnePlayer1 = semifinalMatchOne.querySelector('.player1-avatar') as HTMLImageElement;
		const semifinalMatchOnePlayer2 = semifinalMatchOne.querySelector('.player2-avatar') as HTMLImageElement;
		semifinalMatchOnePlayer1.src = await fetch(`/users/${matchOneData.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchOnePlayer2.src = await fetch(`/users/${matchOneData.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);

		semifinalMatchTwo.querySelector('.player1-name')!.textContent = matchTwoData.alias[0];
		semifinalMatchTwo.querySelector('.player2-name')!.textContent = matchTwoData.alias[1];
		const semifinalMatchTwoPlayer1 = semifinalMatchTwo.querySelector('.player1-avatar') as HTMLImageElement;
		const semifinalMatchTwoPlayer2 = semifinalMatchTwo.querySelector('.player2-avatar') as HTMLImageElement;
		semifinalMatchTwoPlayer1.src = await fetch(`/users/${matchTwoData.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		semifinalMatchTwoPlayer2.src = await fetch(`/users/${matchTwoData.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);
		
		readyButtonController(userId, socket, 0, matchOneData.players);
		readyButtonController(userId, socket, 1, matchTwoData.players);
	}
	// if the page is filled for the first time, update the ready button color
	if (message.type === 'tournament-fill-page') {
		if (semifinalMatchOne && matchOneData.readyStatus[0]) {
			semifinalMatchOne.querySelectorAll('.ready-btn')[0].classList.remove('bg-gray-400');
			semifinalMatchOne.querySelectorAll('.ready-btn')[0].classList.add('bg-green-600');
		}
		if (semifinalMatchOne && matchOneData.readyStatus[1]) {
			semifinalMatchOne.querySelectorAll('.ready-btn')[1].classList.remove('bg-gray-400');
			semifinalMatchOne.querySelectorAll('.ready-btn')[1].classList.add('bg-green-600');
		}
		if (semifinalMatchTwo && matchTwoData.readyStatus[0]) {
			semifinalMatchTwo.querySelectorAll('.ready-btn')[0].classList.remove('bg-gray-400');
			semifinalMatchTwo.querySelectorAll('.ready-btn')[0].classList.add('bg-green-600');
		}
		if (semifinalMatchTwo && matchTwoData.readyStatus[1]) {
			semifinalMatchTwo.querySelectorAll('.ready-btn')[1].classList.remove('bg-gray-400');
			semifinalMatchTwo.querySelectorAll('.ready-btn')[1].classList.add('bg-green-600');
		}
		if (finalMatch && message.final.readyStatus[0]) {
			finalMatch.querySelectorAll('.ready-btn')[0].classList.remove('bg-gray-400');
			finalMatch.querySelectorAll('.ready-btn')[0].classList.add('bg-green-600');
		}
		if (finalMatch && message.final.readyStatus[1]) {
			finalMatch.querySelectorAll('.ready-btn')[1].classList.remove('bg-gray-400');
			finalMatch.querySelectorAll('.ready-btn')[1].classList.add('bg-green-600');
		}
	}
	if (finalMatch && matchOneData.winner) {
		let matchOneWinnerAlias = '';
		if (matchOneData.winner === matchOneData.players[0]) matchOneWinnerAlias = matchOneData.alias[0];
		else matchOneWinnerAlias = matchOneData.alias[1];
		finalMatch.querySelector('.player1-name')!.textContent = matchOneWinnerAlias;
		const target = finalMatch.querySelector('.player1-avatar') as HTMLImageElement;
		target.src = await fetch(`/users/${matchOneData.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
	if (finalMatch && matchTwoData.winner) {
		let matchTwoWinnerAlias = '';
		if (matchTwoData.winner === matchTwoData.players[0]) matchTwoWinnerAlias = matchTwoData.alias[0];
		else matchTwoWinnerAlias = matchTwoData.alias[1];
		finalMatch.querySelector('.player2-name')!.textContent = matchTwoWinnerAlias;
		const target = finalMatch.querySelector('.player2-avatar') as HTMLImageElement;
		target.src = await fetch(`/users/${matchTwoData.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
	if (message.final.players.length && !message.final.readyStatus[0] && !message.final.readyStatus[1])
		readyButtonController(userId, socket, 2, message.final.players);
	if (champion && message.final.winner != null) {
		let winnerAlias = '';
		if (message.final.winner === message.final.players[0]) winnerAlias = message.final.alias[0];
		else winnerAlias = message.final.alias[1];
		champion.querySelector('.player-name')!.textContent = winnerAlias;
		const target = champion.querySelector('.player-avatar') as HTMLImageElement;
		target.src = await fetch(`/users/${message.final.winner}/avatar`).then(res => res.json()).then(data => data.avatar);
	}
}

function enterButtonController(user : User, socket: WebSocket) { // object from /auth/status response, socket
	const enterButton = document.getElementById('enter-tournament-btn');
	if (enterButton)
	{
		enterButton.addEventListener('click', () => {
			const input = document.getElementById("alias-input") as HTMLInputElement;
			socket.send(JSON.stringify({ type: 'tournament-join-pool', userId: user.username, alias: input.value.trim() }));
			input.value = '';
		});
	}
}

function readyButtonController(userId: string, socket: WebSocket, matchNumber: number, players: string[]) {
	console.log('Setting up ready button controller for match:', matchNumber);
	const matchDiv = document.querySelector(`[data-match="${matchNumber}"]`); // 0, 1, 2
	if (matchDiv)
	{
		const readyButtons = matchDiv.querySelectorAll('.ready-btn'); // 2 buttons of the match
		for (let i = 0; i < readyButtons.length; i++) {
			const button = readyButtons[i] as HTMLButtonElement;
			button.classList.remove('hidden');
			if (players[i] === userId) {
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
		}
	}
	
}

// Create a map to store event listeners by user ID
const keydownListeners = new Map<string, (e: KeyboardEvent) => void>();

async function startGame(userId: string, socket: WebSocket) {
    console.log(`Initializing remote game...`);
    const handleKeydown = (e: KeyboardEvent) => {
        const message: any = { type: "input", userId: userId };
        if (e.key === "s") message.sKey = true;
        if (e.key === "w") message.wKey = true;
        if (e.key === "l") message.lKey = true;
        if (e.key === "o") message.oKey = true;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    };
    // Store the listener reference for this user
    keydownListeners.set(userId, handleKeydown);
    document.addEventListener("keydown", handleKeydown);
}

async function endGame(userId: string, socket: WebSocket) {
    console.log(`Ending remote game...`);
    const handleKeydown = keydownListeners.get(userId);
    if (handleKeydown) {
        document.removeEventListener("keydown", handleKeydown);
        keydownListeners.delete(userId);
    }
}

function resetTournament() {
	const tournamentInject = document.getElementById('tournament-inject');
	if (tournamentInject)
	{
	tournamentInject.innerHTML = `
		<div id="tournament-zone">
			<!-- Waiting Pool Section -->
			<div class="w-full max-w-4xl mb-8">
				<h2 class="text-xl font-semibold mb-4 w-full">Waiting Pool</h2>
				<div class="flex w-full">
					<div id="enter-tournament" class="flex flex-col w-1/4  mr-4 bg-blue-500 rounded-lg p-4">
						<input id="alias-input" type="text" placeholder="Enter Your Alias" class="border text-sm text-gray-50 border-gray-300 rounded-lg py-2 px-3 mt-2 mb-2 w-full" />
						<button id="enter-tournament-btn" class="enter-btn text-lg font-semibold text-white py-2 px-4 w-full rounded-lg hover:bg-blue-600">Enter Tournament</button>
					</div>
					<div id="waiting-pool" class="grid flex-1 grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow text-indigo-600">
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
}

async function putUserInfo(message: PlayerInfo) {
	const gameZone = document.getElementById('game-zone');
	if (gameZone)
	{
		const leftUserAvatar = gameZone.querySelectorAll('img')[0];
		const rightUserAvatar = gameZone.querySelectorAll('img')[1];
		const leftUserName = gameZone.querySelectorAll('p')[0];
		const rightUserName = gameZone.querySelectorAll('p')[1];
		leftUserAvatar.src = await fetch(`/users/${message.players[0]}/avatar`).then(res => res.json()).then(data => data.avatar);
		rightUserAvatar.src = await fetch(`/users/${message.players[1]}/avatar`).then(res => res.json()).then(data => data.avatar);
		leftUserName.innerText = message.alias[0];
		rightUserName.innerText = message.alias[1];
	}
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(text, x, y);
}

function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: GameMessage) {
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