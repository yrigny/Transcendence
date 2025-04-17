import { v4 as uuidv4 } from 'uuid'

export class GameRoom {
	constructor(player1, player2) {
		console.log('Creating game room for ', player1.userId, ' and ', player2.userId)
		this.id = uuidv4()
		this.players = [player1, player2]
		this.state = this.initState()
		// this.broadcastState()
		this.putPlayerInfo()
		this.startGameLoop()
	}

	initState() {
		return {
			gaming: true,
			ball: { x: 300, y: 200, vx: 4, vy: 4 },
			paddles: [
				{ userId: this.players[0].userId, y: 160 },
				{ userId: this.players[1].userId, y: 160 }
			],
			scores: { left: 0, right: 0 }
		}
	}

	putPlayerInfo() {
		const msg = {}
		msg.type = "gameStart"
		msg.player1 = this.players[0].userId
		msg.player2 = this.players[1].userId
		this.players[0].socket.send(JSON.stringify(msg))
		this.players[1].socket.send(JSON.stringify(msg))
		console.log('Player info sent to both players')
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
			this.players[1].socket.send(JSON.stringify(msg))
		}
	}
	
	endGame() {
		this.state.gaming = false
		clearInterval(this.interval)
		this.players.forEach(player => player.socket.close())
	}
}