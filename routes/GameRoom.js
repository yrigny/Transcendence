import { v4 as uuidv4 } from 'uuid'
import { readFileSync } from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';//need this fetch version to allow agent use

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const trustedCert = readFileSync(join(__dirname, '../certs/server.cert'));
//use the agent to tell fetch the certificate is trusted
const agent = new https.Agent({
  ca: trustedCert,
  rejectUnauthorized: true,
});

export class GameRoom {
	constructor(players, isTournamentGame = false) {
		if (players.length === 2)
			console.log('Creating game room for ', players[0].userId, ' and ', players[1].userId)
		else if (players.length === 1)
			console.log('Creating game room for ', players[0].userId, ' in single-player mode')
		this.id = uuidv4()
		this.gameStartTime = new Date().toISOString()
		this.playerCount = players.length
		this.players = players
		this.state = this.initState()
		this.putPlayerInfo()
		this.startGameLoop()
		this.isTournamentGame = isTournamentGame
	}

	initState() {
		return {
			gaming: true,
			ball: { x: 300, y: 200, vx: 4, vy: 4 },
			paddles: [
				{ userId: this.players[0].userId, y: 160 },
				{ userId: this.playerCount === 1 ? this.players[0].userId : this.players[1].userId, y: 160 }
			],
			scores: { left: 0, right: 0 }
		}
	}

	putPlayerInfo() {
		const msg = {}
		// add game type to message
		if (this.playerCount === 1)
			msg.type = "game-start-local"
		else if (this.playerCount === 2)
			msg.type = "game-start-remote"
		// add player userid to message
		msg.player1 = this.players[0].userId
		if (this.playerCount === 2)
			msg.player2 = this.players[1].userId
		// send info to player1
		this.players[0].socket.send(JSON.stringify(msg))
		// if there's a second player, send info to player2
		if (this.playerCount === 2) {
			this.players[1].socket.send(JSON.stringify(msg))
		}
		console.log('Player info sent to players')
	}

	startGameLoop() {
		this.interval = setInterval(() => this.updateGame(), 30)
	}

	updateGame() {
		if (this.state.scores.left >= 5 || this.state.scores.right >= 5) {
			this.endGame()
			return
		}
		if (this.state.gaming) {
			this.state.ball.x += this.state.ball.vx
			this.state.ball.y += this.state.ball.vy
			if (this.state.ball.y <= 10 || this.state.ball.y >= 390)
				this.state.ball.vy *= -1
			if (this.state.ball.x === 28 && this.state.ball.y >= this.state.paddles[0].y && this.state.ball.y <= this.state.paddles[0].y + 80)
				this.state.ball.vx *= -1
			if (this.state.ball.x === 572 && this.state.ball.y >= this.state.paddles[1].y && this.state.ball.y <= this.state.paddles[1].y + 80)
				this.state.ball.vx *= -1
			if (this.state.ball.x < 20) {
				this.state.scores.right++
				this.resetBall()
			}
			if (this.state.ball.x > 580) {
				this.state.scores.left++
				this.resetBall()
			}
		}
		this.broadcastState()
	}

	resetBall() {
		this.state.ball.x = 300
		this.state.ball.y = 200
		this.state.ball.vx = Math.random() < 0.5 ? 4 : -4
		this.state.ball.vy = Math.random() < 0.5 ? 4 : -4
	}
	
	broadcastState() {
		const msg = {}
		msg.type = "output"
		msg.ball = this.state.ball
		msg.paddles = this.state.paddles
		msg.scores = this.state.scores
		msg.gaming = this.state.gaming
		// console.log('Broadcasting state: ', JSON.stringify(msg))
		if (this.state.gaming) {
			this.players[0].socket.send(JSON.stringify(msg))
			if (this.playerCount === 2)
				this.players[1].socket.send(JSON.stringify(msg))
		}
	}
	
	async endGame() {
		this.state.gaming = false
		clearInterval(this.interval)
		if (this.playerCount === 2) {
			const gameData = {}
			gameData.player1_id = this.players[0].userId
			gameData.player2_id = this.players[1].userId
			gameData.player1_score = this.state.scores.left
			gameData.player2_score = this.state.scores.right
			gameData.game_start_time = this.gameStartTime
			gameData.game_end_time = new Date().toISOString()
			try {
				const response = await fetch('http://localhost:6788/matches', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(gameData),
					// agent
				});
				const data = await response.json();
				console.log("Game saved: ", data);
			} catch (error) {
				console.log("Failed to save game: ", error);
			}
		}
		if (this.isTournamentGame && typeof this.getGameResult === 'function') {
			await this.getGameResult()
		}
		if (!this.isTournamentGame) {
			this.players.forEach(player => player.socket.close())
		}
	}
}