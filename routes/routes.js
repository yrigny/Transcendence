
async function routes(fastify, opts) {
  fastify.setNotFoundHandler((request, reply) => {
    reply.type('text/html').sendFile('index.html');
  });  
}

export default routes;