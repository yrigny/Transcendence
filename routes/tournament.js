import { GameRoom } from './GameRoom.js'

async function tournamentManager(fastify) {
	const playersPool = [] // { userId, socket }
	const gameRooms = new Map() // gameId -> GameRoom
	const userToGame = new Map() // userId -> gameId
	const tournamentState = {
		playersName: ['', '', '', ''],
		semifinals: {
			match1: { players: [], readyStatus: [false, false], gaming: false, winner: null },
			match2: { players: [], readyStatus: [false, false], gaming: false, winner: null }
		},
		final: { players: [], readyStatus: [false, false], gaming: false, winner: null },
	};

	fastify.get('/ws/tournament', { websocket: true }, (conn, req) => {
		let userId = ''

		conn.on('message', (msg) => {
			const data = JSON.parse(msg)
			if (data.type === 'enter-tournament-page') {
				userId = data.userId
				console.log('User entered tournament page:', userId)
				// Send initial tournamentState to the user
				let msg = {
					type: 'tournament-update-pool',
					playersPool: tournamentState.playersName,
				}
				console.log('Sending initial tournament state:', msg)
				conn.send(JSON.stringify(msg))
			}
			if (data.type === 'tournament-join-pool') {
				console.log('User joining tournament pool:', userId)
				let poolLength = tournamentState.playersPool.length
				// Add user to playersPool if not already present
				if (!tournamentState.playersPool.find(p => p.userId === userId) && poolLength < 4) {
					tournamentState.playersPool.push({ userId, socket: conn })
					tournamentState.playersName[poolLength] = userId
					console.log(userId, ' added to players pool')
				}
				else {
					conn.close()
					console.log('Closing existing connection for user:', userId)
				}
				// Send updated playersPool to all connected clients, msg type 'tournament-update-pool'
				let msg = {
					type: 'tournament-update-pool',
					playersPool: tournamentState.playersName
				}
				console.log('Sending updated players pool:', msg)
				conn.send(JSON.stringify(msg))
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
			// Remove user from playersPool if they disconnect
			const index = playersPool.findIndex(p => p.userId === userId)
			if (index !== -1) {
				playersPool.splice(index, 1)
				console.log(userId, ' removed from players pool')
			}
		})
	})
}

export default tournamentManager