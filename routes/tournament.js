import { GameRoom } from './GameRoom.js'

// Done: When a user connects to the tournament page (ws/tournament), they will be added to the connection pool
// Note: connection pool != players pool, there can be audience users who don't participate in the tournament but can see what's going on
// Done: The server will first send the tournament state to the newly connected user
// Ongoing: The server will keep sending updated state (playersPool or tournamentMap) to all connected users upon any changes
// Done: When a user joins the players pool, they will be added to the players pool
// Done: When a players pool is full (4 players), the server will matchmake the players according to their win percentage to plan 2 semi-finals
// Done: When a player is ready for a planned game, the server will update the readyStatus of the target game
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

	const matchMaking = async () => {
		const player1 = playersPool[0].userId
		const player2 = playersPool[1].userId
		const player3 = playersPool[2].userId
		const player4 = playersPool[3].userId
		const player1WinPercentage = await getUserWinPercentage(player1)
		const player2WinPercentage = await getUserWinPercentage(player2)
		const player3WinPercentage = await getUserWinPercentage(player3)
		const player4WinPercentage = await getUserWinPercentage(player4)
		console.log('Player win percentages:', player1WinPercentage, player2WinPercentage, player3WinPercentage, player4WinPercentage)
		// Sort players by win percentage from highest to lowest
		const players = [
			{ userId: player1, winPercentage: player1WinPercentage },
			{ userId: player2, winPercentage: player2WinPercentage },
			{ userId: player3, winPercentage: player3WinPercentage },
			{ userId: player4, winPercentage: player4WinPercentage }
		]
		players.sort((a, b) => b.winPercentage - a.winPercentage)
		console.log('Sorted players:', players)
		// Assign players to matches
		tournamentState.semifinals.match1.players[0] = players[0].userId
		tournamentState.semifinals.match1.players[1] = players[1].userId
		tournamentState.semifinals.match2.players[0] = players[2].userId
		tournamentState.semifinals.match2.players[1] = players[3].userId
		console.log('Tournament state after matchmaking:', tournamentState.semifinals.match1.players, tournamentState.semifinals.match2.players)
	}

	const getUserWinPercentage = async (userId) => {
		// Fetch all games played by the user
		const res = await fetch(`http://localhost:6789/matches/${userId}`)
		const data = await res.json()
		if (!data || !Array.isArray(data)) return -1
		let winCount = 0
		let lossCount = 0
		data.forEach(match => {
			const { player1, player2, player1_score, player2_score } = match
			if (player1 === userId && player1_score > player2_score) winCount++
			if (player2 === userId && player2_score > player1_score) winCount++
			if (player1 === userId && player1_score < player2_score) lossCount++
			if (player2 === userId && player2_score < player1_score) lossCount++
		})
		const totalCount = winCount + lossCount
		return totalCount === 0 ? -1 : (winCount / totalCount) * 100
	}

	fastify.get('/ws/tournament', { websocket: true }, (conn, req) => {
		let userId = ''

		conn.on('message', async (msg) => {
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
				else if (poolLength >= 4)
					conn.send(JSON.stringify({ type: 'error', message: 'Players pool is full' }))
				else if (tournamentState.playersName.find(p => p === userId))
					conn.send(JSON.stringify({ type: 'error', message: 'You are already in the players pool' }))
				// Check if players pool is full (4 players), if so, start matchmaking
				if (tournamentState.playersName.length === 4) {
					console.log('Players pool is full, starting matchmaking...')
					await matchMaking()
					let msg = {
						type: 'tournament-update-map',
						semifinals: tournamentState.semifinals,
						final: tournamentState.final
					}
					broadcastToAllConnections(msg)
				}
			}
			if (data.type === 'tournament-ready-for-game') {
				console.log('User ready for game:', userId)
				let targetMatch = null
				if (data.match === 0) targetMatch = tournamentState.semifinals.match1
				else if (data.match === 1) targetMatch = tournamentState.semifinals.match2
				else if (data.match === 2) targetMatch = tournamentState.final
				// Update the ready status for the user
				if (targetMatch.players[0] === userId) targetMatch.readyStatus[0] = true
				else if (targetMatch.players[1] === userId) targetMatch.readyStatus[1] = true
				// Send updated tournamentState to all connected clients
				let msg = {
					type: 'tournament-update-ready-status',
					matchIndex: data.match,
					playerIndex: targetMatch.players[0] === userId ? 0 : 1,
				}
				broadcastToAllConnections(msg)
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