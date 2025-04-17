import { GameRoom } from '../game/GameRoom.js'

async function gameRoutes(fastify) {
  const waitingPool = [] // { userId, socket }
  const gameRooms = new Map() // gameId -> GameRoom
  const userToGame = new Map() // userId -> gameId

  fastify.get('/ws', { websocket: true }, (conn, req) => {
      let userId = ''

      conn.on('message', (msg) => {
        const data = JSON.parse(msg)
        if (data.type === 'join') {
          userId = data.userId
          console.log('User joined:', userId)
          if (waitingPool.length > 0) {
            const opponent = waitingPool.pop()
            const gameRoom = new GameRoom(
              { userId, socket: conn }, // player1
              opponent // player2
            )
            gameRooms.set(gameRoom.id, gameRoom)
            userToGame.set(userId, gameRoom.id)
            userToGame.set(opponent.userId, gameRoom.id)
          }
          else {
            waitingPool.push({ userId, socket: conn })
            console.log(userId, ' is waiting for an opponent')
          }
          console.log('waitingPool length: ', waitingPool.length)
        }
        if (data.type === 'input') {
          console.log('Input received:', data)
          // find gameRoom by userId
          const gameId = userToGame.get(userId)
          const gameRoom = gameRooms.get(gameId)
          // find paddle by userId
          const paddleIndex = gameRoom.players.findIndex(p => p.userId === userId)
          if (data.wKey && paddleIndex === 0 && gameRoom.state.paddles[0].y > 10)
            gameRoom.state.paddles[0].y -= 10
          if (data.sKey && paddleIndex === 0 && gameRoom.state.paddles[0].y < 310)
            gameRoom.state.paddles[0].y += 10
          if (data.oKey && paddleIndex === 1 && gameRoom.state.paddles[1].y < 10)
            gameRoom.state.paddles[1].y -= 10
          if (data.lKey && paddleIndex === 1 && gameRoom.state.paddles[1].y > 310)
            gameRoom.state.paddles[1].y += 10
        }
      })

      conn.on('close', () => {
        console.log('Closing connection for user:', userId)
        const gameId = userToGame.get(userId)
        if (gameId) {
          const game = gameRooms.get(gameId)
          if (game) game.endGame()
          gameRooms.delete(gameId)
        } else {
          const index = waitingPool.findIndex(p => p.userId === userId)
          if (index !== -1)
            waitingPool.splice(index, 1)
        }
        userToGame.delete(userId)
      })
  })
}

export default gameRoutes