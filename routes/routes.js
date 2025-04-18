import { ACTIVE_USERS } from '../server.js'

async function routes(fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return reply.sendFile('index.html')
  })
  fastify.get('/home', async function (request, reply) {
    return reply.sendFile('index.html')
  })
  fastify.get('/game', async function (request, reply) {
    try {
      const user = await request.jwtVerify()
      if (!ACTIVE_USERS.has(user.username)) {
        return reply.redirect('/login')
      }
      return reply.sendFile('index.html')
    } catch (error) {
      console.error('JWT verification failed:', error)
      return reply.redirect('/login')
    }
  })
  fastify.get('/login', async function (request, reply) {
    return reply.sendFile('index.html')
  })
  fastify.get('/register', async function (request, reply) {
    return reply.sendFile('index.html')
  })
  fastify.get('/dashboard', async function (request, reply) {
    try {
      const user = await request.jwtVerify()
      if (!ACTIVE_USERS.has(user.username)) {
        return reply.redirect('/login')
      }
      return reply.sendFile('index.html')
    } catch (error) {
      console.error('JWT verification failed:', error)
      return reply.redirect('/login')
    }
  })
}

export default routes