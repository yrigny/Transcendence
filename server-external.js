'use strict'
import Fastify from 'fastify'
import FastifyStatic from '@fastify/static'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'
import routes from './routes/routes.js'
import fastifyWebsocket from '@fastify/websocket'
import formbody from '@fastify/formbody'
import fastifyCookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import dbConnector from './plugins/database.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import gameManager from './routes/game.js'
import tournamentManager from './routes/tournament.js'
import { readFileSync } from 'fs'
import fastifyProxy from '@fastify/http-proxy'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read environment variables or use defaults
const INTERNAL_PORT = process.env.INTERNAL_PORT || 6788
const EXTERNAL_PORT = process.env.EXTERNAL_PORT || 6789

// External server (HTTPS for client-facing routes)
const externalServer = Fastify({
  https: {
    key: readFileSync(path.join(__dirname, 'certs/server.key')),
    cert: readFileSync(path.join(__dirname, 'certs/server.cert'))
  },
  logger: true
})

export const ACTIVE_USERS = new Map()

await externalServer.register(fastifyCookie)
await externalServer.register(formbody)
await externalServer.register(multipart)
await externalServer.register(fastifyWebsocket)
await externalServer.register(dbConnector)
externalServer.register(routes)
externalServer.register(authRoutes)
externalServer.register(userRoutes)
externalServer.register(gameManager)
externalServer.register(tournamentManager)
externalServer.register(FastifyStatic, { root: path.join(__dirname, 'public'), prefix: '/' })
externalServer.register(FastifyStatic, { root: path.join(__dirname, 'volume/uploads'), prefix: '/uploads/', decorateReply: false })

// Proxy internal service requests to the internal server
externalServer.register(fastifyProxy, {
  upstream: `http://localhost:${INTERNAL_PORT}`,
  prefix: '/api', // for internal API requests
  http2: false
})

try {
  externalServer.listen({ port: EXTERNAL_PORT, host: '0.0.0.0' })
  console.log(`External server listening on https://localhost:${EXTERNAL_PORT}`)
} catch (err) {
  externalServer.log.error(err)
  process.exit(1)
}