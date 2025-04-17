async function matchesRoutes(fastify, options) {
	// Get all match records
	fastify.get('/matches', async (request, reply) => {
		try {
			const matches = fastify.sqlite.prepare(`
				SELECT 
				m.id, 
				u1.name AS player1, 
				u2.name AS player2, 
				m.player1_score, 
				m.player2_score, 
				m.game_start_time, 
				m.game_end_time 
				FROM matches m
				JOIN users u1 ON m.player1 = u1.name
				JOIN users u2 ON m.player2 = u2.name
			`).all();
			reply.header('Content-Type', 'application/json').send(matches);
		} catch (error) {
			console.error('Database error:', error);
			reply.status(500).send({ error: 'Internal Server Error' });
		}
	})

	// Record a new match
	fastify.post('/matches', async (request, reply) => {
		console.log(request.body);
		const { player1_id, player2_id, player1_score, player2_score, game_start_time, game_end_time } = request.body;
		const formattedGameStartTime = new Date(game_start_time).toISOString().replace("T", " ").replace("Z", "");
		const formattedGameEndTime = new Date(game_end_time).toISOString().replace("T", " ").replace("Z", "");
		try {
		// Insert new match into the database
			fastify.sqlite.prepare(`
			INSERT INTO matches (player1, player2, player1_score, player2_score, game_start_time, game_end_time) 
			VALUES (?, ?, ?, ?, ?, ?)
		`).run(player1_id, player2_id, player1_score, player2_score, formattedGameStartTime, formattedGameEndTime);
		return { message: 'Match recorded!' };
		} catch (error) {
		console.error('Database Error:', error.message);
		return reply.status(400).send({ error: `Failed to record match, details: ${error.message}` });
		}
	})
}

export default matchesRoutes