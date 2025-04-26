import { GameRoom } from './GameRoom.js'

async function gameManager(fastify) {
  const waitingPool = [] // { userId, socket }
  const gameRooms = new Map() // gameId -> GameRoom
  const userToGame = new Map() // userId -> gameId
  const danglingSockets = [] // sockets that are not in any game
  
  fastify.get('/ws/game', { websocket: true }, (conn, req) => {
    let userId = ''

    conn.on('message', (msg) => {
      const data = JSON.parse(msg)
      if (data.type === 'join-double') {
        userId = data.userId
        console.log('User joined:', userId)
        // If the user is already in the waiting pool or a game room, close the connection
        if (!waitingPool.find(p => p.userId === userId) && !userToGame.has(userId)) {
          waitingPool.push({ userId, socket: conn })
          console.log(userId, ' added to waiting pool')
        }
        else {
          danglingSockets.push(conn)
          conn.send(JSON.stringify({ type: 'error', message: 'User already in a game' }))
          conn.close()
          console.log('Closing existing connection for user:', userId)
        }
        // Check if there are two players in the waiting pool, if so, create a game room
        if (waitingPool.length > 1) {
          const player1 = waitingPool.shift()
          const player2 = waitingPool.shift()
          const gameRoom = new GameRoom([
            { userId: player1.userId, socket: player1.socket },
            { userId: player2.userId, socket: player2.socket }]
          )
          gameRooms.set(gameRoom.id, gameRoom)
          userToGame.set(player1.userId, gameRoom.id)
          userToGame.set(player2.userId, gameRoom.id)
          console.log('gameRooms size: ', gameRooms.size)
          console.log('userToGame size: ', userToGame.size)
        }
        console.log('waitingPool length: ', waitingPool.length)
      }
      if (data.type === 'join-single') {
        userId = data.userId
        console.log('User joined:', userId)
        // If the user is already in the waiting pool or a game room, close the connection
        if (!waitingPool.find(p => p.userId === userId) && !userToGame.has(userId)) {
          console.log(userId, ' started a local game')
          const gameRoom = new GameRoom(
            [{ userId, socket: conn }]
          )
          gameRooms.set(gameRoom.id, gameRoom)
          userToGame.set(userId, gameRoom.id)
          console.log('gameRooms size: ', gameRooms.size)
          console.log('userToGame size: ', userToGame.size)
        } else {
          danglingSockets.push(conn)
          conn.send(JSON.stringify({ type: 'error', message: 'User already in a game' }))
          conn.close();
          console.log('Closing existing connection for user:', userId);
        }
      }
      if (data.type === 'input') {
        console.log('Input received:', data)
        // find gameRoom by userId
        const gameId = userToGame.get(userId)
        const gameRoom = gameRooms.get(gameId)
        if (!gameRoom) return
        // single-player mode
        if (gameRoom.playerCount === 1) {
          if (data.wKey && gameRoom.state.paddles[0].y > 10)
            gameRoom.state.paddles[0].y -= 10
          if (data.sKey && gameRoom.state.paddles[0].y < 310)
            gameRoom.state.paddles[0].y += 10
          if (data.oKey && gameRoom.state.paddles[1].y > 10)
            gameRoom.state.paddles[1].y -= 10
          if (data.lKey && gameRoom.state.paddles[1].y < 310)
            gameRoom.state.paddles[1].y += 10
        }
        // double-player mode
        else if (gameRoom.playerCount === 2) {
          const paddleIndex = gameRoom.players.findIndex(p => p.userId === userId)
          if (data.wKey && paddleIndex === 0 && gameRoom.state.paddles[0].y > 10)
            gameRoom.state.paddles[0].y -= 10
          if (data.sKey && paddleIndex === 0 && gameRoom.state.paddles[0].y < 310)
            gameRoom.state.paddles[0].y += 10
          if (data.oKey && paddleIndex === 1 && gameRoom.state.paddles[1].y > 10)
            gameRoom.state.paddles[1].y -= 10
          if (data.lKey && paddleIndex === 1 && gameRoom.state.paddles[1].y < 310)
            gameRoom.state.paddles[1].y += 10
        }
      }
    })

    conn.on('close', () => {
      // If dangling socket, remove it from danglingSockets, skip further processing
      if (danglingSockets.includes(conn)) {
        const index = danglingSockets.indexOf(conn)
        if (index !== -1) {
          danglingSockets.splice(index, 1)
          console.log('Dangling socket removed:')
        }
        return
      }
      const gameId = userToGame.get(userId)
      if (gameId) {
        const gameRoom = gameRooms.get(gameId)
        gameRoom.players.forEach(player => {
          userToGame.delete(player.userId)
        })
        gameRooms.delete(gameId)
      } else {
        const index = waitingPool.findIndex(p => p.userId === userId)
        if (index !== -1)
          waitingPool.splice(index, 1)
      }
    })
  })
}

export default gameManager