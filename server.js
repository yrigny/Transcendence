'use strict'
import Fastify from 'fastify'
import FastifyStatic from '@fastify/static'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import routes from './routes/routes.js'
import dbConnector from './plugins/database.js'
import fastifyWebsocket from '@fastify/websocket'
import gameRoutes from './plugins/game.js'
import multipart from '@fastify/multipart'
import registerRoutes from './routes/register.js'
import formbody from '@fastify/formbody'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import loginRoutes from './routes/login.js'

const fastify = Fastify({logger: true})
export const ACTIVE_USERS = new Map()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

fastify.register(routes)
fastify.register(FastifyStatic, { root: path.join(__dirname, 'public'), prefix: '/' })
fastify.register(FastifyStatic, { root: path.join(__dirname, 'volume/uploads'), prefix: '/uploads/', decorateReply: false })
fastify.register(dbConnector)
await fastify.register(fastifyWebsocket)
fastify.register(gameRoutes)
await fastify.register(multipart)
fastify.register(registerRoutes)
await fastify.register(formbody)
await fastify.register(fastifyCookie)
await fastify.register(fastifyJwt, {secret: 'supersecret', 
  cookie: { cookieName: 'token', signed: false }})
fastify.register(loginRoutes)


try {
  await fastify.listen({ port: 6789, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}