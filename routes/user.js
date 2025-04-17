
async function userRoutes(fastify) {
	fastify.get('/users/:name', async (request, reply) => {
		try {
			const { name } = request.params;
			const user = fastify.sqlite.prepare(
				'SELECT * FROM users WHERE name = ?'
			).get(name);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}
			return reply.send(user);
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})

	fastify.get('/users/:name/avatar', async (request, reply) => {
		try {
			const { name } = request.params;
			const row = fastify.sqlite.prepare(
				'SELECT avatar FROM users WHERE name = ?'
			).get(name);
			if (!row) {
				return reply.status(404).send({ error: "User not found" });
			}
			return { avatar: `/uploads/${row.avatar}` };
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})
}

export default userRoutes