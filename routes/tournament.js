import { GameRoom } from './GameRoom.js'

// When a user connects to the tournament page (ws/tournament), they will be added to the connection pool
// Note: connection pool != players pool, there can be audience users who don't participate in the tournament but can see what's going on
// The server will first send the tournament state to the newly connected user
// The server will keep sending updated state (playersPool or tournamentMap) to all connected users upon any changes
// When a user joins the players pool, they will be added to the players pool (when full, the frontend should block the join-tournament button action and show an alert)
// When a players pool is full (4 players), the server will matchmake the players according to their win percentage to plan 2 semi-finals
// When a player is ready for a planned game, the server will update the readyStatus of the target game
// When both players of a game are ready, the server will start a GameRoom and send the game state to both players (for the audience, should we let them watch the live game? if so, the two semi-finals should take place one after another, because the audience can only watch one game at a time)
// When a semi-final is finished, the server will update the tournament state and send the updated tournament map to all connected users (the winner will show up in the final game placeholder)
// When the final game is finished, the server will update the tournament state and send the updated state to all connected users (the champion will show up in the champion placeholder)
// When a user disconnects, they will be removed from the players pool

async function tournamentManager(fastify) {
	const connectionsPool = [] // { userId, socket }
	const playersPool = [] // { userId, socket }
	const gameRooms = new Map() // gameId -> GameRoom
	const userToGame = new Map() // userId -> gameId
	const tournamentState = {
		playersName: [],
		semifinals: {
			match1: { players: [], readyStatus: [false, false], gaming: false, winner: null },
			match2: { players: [], readyStatus: [false, false], gaming: false, winner: null }
		},
		final: { players: [], readyStatus: [false, false], gaming: false, winner: null },
	};

	const broadcastToAllConnections = (msg) => {
		connectionsPool.forEach(client => {
			if (client.socket.readyState === client.socket.OPEN) {
				client.socket.send(JSON.stringify(msg))
			}
		})
	}

	const broadcastToAllPlayers = (msg) => {
		playersPool.forEach(player => {
			if (player.socket.readyState === player.socket.OPEN) {
				player.socket.send(JSON.stringify(msg))
			}
		})
	}

	fastify.get('/ws/tournament', { websocket: true }, (conn, req) => {
		let userId = ''

		conn.on('message', (msg) => {
			const data = JSON.parse(msg)
			if (data.type === 'enter-tournament-page') {
				userId = data.userId
				console.log('User entered tournament page:', userId)
				connectionsPool.push({ userId, socket: conn })
				let msg = {
					type: 'tournament-fill-page',
					playersPool: tournamentState.playersName,
					semifinals: tournamentState.semifinals,
					final: tournamentState.final
				}
				conn.send(JSON.stringify(msg))
			}
			if (data.type === 'tournament-join-pool') {
				console.log('User joining tournament pool:', userId)
				let poolLength = tournamentState.playersName.length
				// Add user to playersPool if not already present and pool is not full
				if (!tournamentState.playersName.find(p => p === userId) && poolLength < 4) {
					playersPool.push({ userId, socket: conn })
					tournamentState.playersName[poolLength] = userId
					console.log(userId, ' added to players pool')
					let msg = {
						type: 'tournament-update-pool',
						playersPool: tournamentState.playersName
					}
					broadcastToAllConnections(msg)
				}
				else if (poolLength >= 4) {
					console.log('Players pool is full, cannot add user:', userId)
					conn.send(JSON.stringify({ type: 'error', message: 'Players pool is full' }))
				}
				else if (tournamentState.playersName.find(p => p === userId)) {
					console.log('User already in players pool:', userId)
					conn.send(JSON.stringify({ type: 'error', message: 'You are already in the players pool' }))
				}
			}
			if (data.type === 'tournament-ready-for-game') {
				console.log('User ready for game:', userId)
				// Update ready status of target game in tournamentState

				// Send updated tournamentState to all connected clients, msg type 'tournament-update-map'

				// Check if both players are ready, if so, start a GameRoom and send msg type 'tournament-game-start'
			}
		})

		conn.on('close', () => {
			console.log('Connection closed for user:', userId)
			// Remove user from playersPool and ConnectionsPool if they disconnect
		})
	})
}

export default tournamentManager