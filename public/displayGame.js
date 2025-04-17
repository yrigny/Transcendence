
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
	let userId = '';
	try {
		const res = await fetch('/auth/status', {
			method: 'GET',
			credentials: 'include'
		});
		const data = await res.json();
		userId = data.username || '';
		return userId;
	} catch (error) {
		console.error('Login check failed:', error);
	}
}

async function initGame() {
	const startDoublePlayerGame = document.getElementById("start-game")
	const startSinglePlayerGame = document.getElementById("start-game-single")

	startDoublePlayerGame.addEventListener("click", async () => {
		console.log('Initializing double-player game...');
		const canvas = document.getElementById("game-canvas");
		const ctx = canvas.getContext("2d");
		const userId = await getUserId();
		console.log('User ID:', userId);

		const socket = new WebSocket(`ws://${location.host}/ws`);
		socket.onopen = function () {
			console.log('WebSocket connection opened');
			socket.send(JSON.stringify({ type: "join-double", userId }));
		}

		socket.onmessage = function (event) {
			const message = JSON.parse(event.data);
			if (message.type === "gameStart-double") {
				putUserInfoDouble(message);
			}
			if (message.type === "output")
				draw(message);
		}

		socket.onerror = function (error) {
			console.error('WebSocket error:', error);
		}

		async function putUserInfoDouble(message) {
			const leftUserAvatar = document.getElementById("player1-avatar");
			const rightUserAvatar = document.getElementById("player2-avatar");
			const leftUserName = document.getElementById("player1");
			const rightUserName = document.getElementById("player2");
			leftUserAvatar.src = await getUserAvatarPath(message.player1);
			rightUserAvatar.src = await getUserAvatarPath(message.player2);
			leftUserName.innerText = message.player1;
			rightUserName.innerText = message.player2;
		}

		async function getUserAvatarPath(username) {
			const res = await fetch(`/users/${username}`);
			if (res.ok) {
				const data = await res.json();
				console.log('User avatar: ', data.avatar);
				return data.avatar;
			}
			else {
				console.error('Failed to fetch user avatar:', res.status);
				return '/default-avatar.png';
			}
		}

		function drawRect(x, y, w, h, color) {
			ctx.fillStyle = color
			ctx.fillRect(x, y, w, h)
		}
		
		function drawCircle(x, y, radius, color) {
			ctx.fillStyle = color
			ctx.beginPath()
			ctx.arc(x, y, radius, 0, Math.PI * 2)
			ctx.fill()
		}
		
		function drawText(text, x, y) {
			ctx.fillStyle = "white"
			ctx.font = "20px Arial"
			ctx.fillText(text, x, y)
		}
		
		function draw(message) {
			ctx.clearRect(0, 0, 600, 400);
			if (message.type == "output") {
				drawCircle(message.ball.x, message.ball.y, 10, "white");
				drawRect(10, message.paddles[0].y, 10, 80, "white");
				drawRect(canvas.width - 20, message.paddles[1].y, 10, 80, "white");
				drawText(message.scores.left, 100, 50);
				drawText(message.scores.right, canvas.width - 100, 50);
			}
		}

		document.addEventListener("keydown", (e) => {
			const message = { type: "input", userId: userId }
			if (e.key === "s") message.sKey = true
			if (e.key === "w") message.wKey = true
			if (e.key === "l") message.lKey = true
			if (e.key === "o") message.oKey = true
			if (socket.readyState === WebSocket.OPEN)
				socket.send(JSON.stringify(message));
		})
	})

	startSinglePlayerGame.addEventListener("click", async () => {
		console.log('Initializing single-player game...');
		const canvas = document.getElementById("game-canvas");
		const ctx = canvas.getContext("2d");
		const userId = await getUserId();
		console.log('User ID:', userId);

		const socket = new WebSocket(`ws://${location.host}/ws`);
		socket.onopen = function () {
			console.log('WebSocket connection opened');
			socket.send(JSON.stringify({ type: "join-single", userId }));
		}

		socket.onmessage = function (event) {
			const message = JSON.parse(event.data);
			if (message.type === "gameStart-single") {
				putUserInfoSingle(message);
			}
			if (message.type === "output")
				draw(message);
		}

		socket.onerror = function (error) {
			console.error('WebSocket error:', error);
		}

		async function putUserInfoSingle(message) {
			const leftUserAvatar = document.getElementById("player1-avatar");
			const rightUserAvatar = document.getElementById("player2-avatar");
			const leftUserName = document.getElementById("player1");
			const rightUserName = document.getElementById("player2");
			leftUserAvatar.src = await getUserAvatarPath(message.player1);
			rightUserAvatar.src = leftUserAvatar.src;
			leftUserName.innerText = message.player1;
			rightUserName.innerText = message.player1;
		}

		async function getUserAvatarPath(username) {
			const res = await fetch(`/users/${username}`);
			if (res.ok) {
				const data = await res.json();
				console.log('User avatar: ', data.avatar);
				return data.avatar;
			}
			else {
				console.error('Failed to fetch user avatar:', res.status);
				return '/default-avatar.png';
			}
		}

		function drawRect(x, y, w, h, color) {
			ctx.fillStyle = color
			ctx.fillRect(x, y, w, h)
		}
		
		function drawCircle(x, y, radius, color) {
			ctx.fillStyle = color
			ctx.beginPath()
			ctx.arc(x, y, radius, 0, Math.PI * 2)
			ctx.fill()
		}
		
		function drawText(text, x, y) {
			ctx.fillStyle = "white"
			ctx.font = "20px Arial"
			ctx.fillText(text, x, y)
		}
		
		function draw(message) {
			ctx.clearRect(0, 0, 600, 400);
			if (message.type == "output") {
				drawCircle(message.ball.x, message.ball.y, 10, "white");
				drawRect(10, message.paddles[0].y, 10, 80, "white");
				drawRect(canvas.width - 20, message.paddles[1].y, 10, 80, "white");
				drawText(message.scores.left, 100, 50);
				drawText(message.scores.right, canvas.width - 100, 50);
			}
		}

		document.addEventListener("keydown", (e) => {
			const message = { type: "input", userId: userId }
			if (e.key === "s") message.sKey = true
			if (e.key === "w") message.wKey = true
			if (e.key === "l") message.lKey = true
			if (e.key === "o") message.oKey = true
			if (socket.readyState === WebSocket.OPEN)
				socket.send(JSON.stringify(message));
		})
	})
}

export default displayGame;