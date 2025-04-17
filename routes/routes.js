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
  fastify.get('/logout', async function (request, reply) {
    const user = await request.jwtVerify()
    ACTIVE_USERS.delete(user.username)
    console.log('Logging out user: ', user.username)
    reply.clearCookie('token', { path: '/' })
    return reply.redirect('/home')
  })
  fastify.get('/auth/status', async function (request, reply) {
    try {
      const user = await request.jwtVerify()
      reply.send({ loggedIn: true, username: user.username })
    } catch (error) {
      reply.send({ loggedIn: false })
    }
  })
}

export default routes