import { readFileSync } from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';//need this fetch version to allow agent use

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const trustedCert = readFileSync(join(__dirname, '../certs/server.cert'));
//use the agent to tell fetch the certificate is trusted
const agent = new https.Agent({
  ca: trustedCert,
  rejectUnauthorized: true,
});

async function routes(fastify, opts) {
  // Helper function to check authentication and respond
  async function checkAuthAndRespond(request, reply, successFile) {
    try {
      const res = await fetch('https://localhost:6789/auth/status', {
        method: 'GET',
        headers: { Cookie: request.headers.cookie },
        agent
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

  fastify.get('/tournament', async function (request, reply) {
    return reply.sendFile('index.html');
  });
}

export default routes;