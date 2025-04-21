
async function routes(fastify, opts) {
  // Helper function to check authentication and respond
  async function checkAuthAndRespond(request, reply, successFile) {
    try {
      const res = await fetch('http://localhost:6789/auth/status', {
        method: 'GET',
        headers: { Cookie: request.headers.cookie },
      });
      if (res.status === 200) {
        return reply.sendFile(successFile);
      } else {
        return reply.redirect('/login');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      return reply.redirect('/login');
    }
  }

  fastify.get('/', async function (request, reply) {
    return reply.sendFile('index.html');
  });

  fastify.get('/home', async function (request, reply) {
    return reply.sendFile('index.html');
  });

  fastify.get('/game', async function (request, reply) {
    return checkAuthAndRespond(request, reply, 'index.html');
  });

  fastify.get('/login', async function (request, reply) {
    return reply.sendFile('index.html');
  });

  fastify.get('/register', async function (request, reply) {
    return reply.sendFile('index.html');
  });

  fastify.get('/dashboard', async function (request, reply) {
    return checkAuthAndRespond(request, reply, 'index.html');
  });

  fastify.get('/friends', async function (request, reply) {
    return checkAuthAndRespond(request, reply, 'index.html');
  });
}

export default routes;