'use strict'
import Fastify from 'fastify'
import FastifyStatic from '@fastify/static'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import routes from './routes/routes.js'
import dbConnector from './plugins/database.js'
import fastifyWebsocket from '@fastify/websocket'
import gameRoutes from './routes/game.js'
import multipart from '@fastify/multipart'
import userRoutes from './routes/user.js'
import formbody from '@fastify/formbody'
import fastifyCookie from '@fastify/cookie'
import authRoutes from './routes/auth.js'
import matchesRoutes from './routes/matches.js'
import tournamentManager from './routes/tournament.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fastify = Fastify({
  logger: true
})
export const ACTIVE_USERS = new Map()

fastify.register(routes)
fastify.register(FastifyStatic, { root: path.join(__dirname, 'public'), prefix: '/' })
fastify.register(FastifyStatic, { root: path.join(__dirname, 'volume/uploads'), prefix: '/uploads/', decorateReply: false })
fastify.register(dbConnector)
await fastify.register(fastifyWebsocket)
fastify.register(gameRoutes)
await fastify.register(multipart)
fastify.register(userRoutes)
await fastify.register(formbody)
await fastify.register(fastifyCookie)
fastify.register(authRoutes)
fastify.register(matchesRoutes)
fastify.register(tournamentManager)

try {
  await fastify.listen({ port: 80, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}