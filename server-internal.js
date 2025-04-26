'use strict'
import Fastify from 'fastify'
import dotenv from 'dotenv'
import dbConnector from './plugins/database.js'
import fastifyWebsocket from '@fastify/websocket'
import matchesRoutes from './routes/matches.js'
import gameManager from './routes/game.js'
import tournamentManager from './routes/tournament.js'

dotenv.config()
const INTERNAL_PORT = process.env.INTERNAL_PORT || 6788

const internalServer = Fastify({
  logger: true
})

internalServer.register(dbConnector)
await internalServer.register(fastifyWebsocket)
internalServer.register(matchesRoutes)
internalServer.register(gameManager)
internalServer.register(tournamentManager)

try {
  internalServer.listen({ port: INTERNAL_PORT, host: 'localhost' })
  console.log(`Internal server listening on http://localhost:${INTERNAL_PORT}`)
} catch (err) {
  internalServer.log.error(err)
  process.exit(1)
}