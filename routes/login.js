import bcrypt from 'bcrypt'
import { ACTIVE_USERS } from '../server.js'

async function loginRoutes(fastify) {

	fastify.post('/login', async (req, res) => {
		const { username, password } = req.body
		// validate the input
		if (!username || !password) {
			return res.status(400).send({ error: 'Username and password are required' })
		}
		// check user exists and password is correct
		const user = fastify.sqlite.prepare(
			'SELECT * FROM users WHERE name = ?'
		).get(username)
		if (!user) {
			return res.status(400).send({ error: 'User does not exist' })
		}
		const passwordMatch = await bcrypt.compare(password, user.password)
		if (!passwordMatch) {
			return res.status(400).send({ error: 'Invalid password' })
		}
		console.log('User logged in successfully: ', username)
		const token = fastify.jwt.sign({ username })
		console.log('Token generated: ', token)
		// save active user in map
		ACTIVE_USERS.set(username, { loggedInAt: Date.now() })
		res.setCookie('token', token, {
			httpOnly: true,
			path: '/',
			maxAge: 60 * 60, // 1 hour
		})
		// print all active users
		console.log('Active users: ')
		ACTIVE_USERS.forEach((value, key) => {
			console.log(key, value)
		})
		return res.redirect('/game')
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

export default loginRoutes