import fs from 'node:fs'
import pump from 'pump'
import path from 'node:path'
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url'
import { ACTIVE_USERS } from '../server-external.js'

const isAlphaNumeric = str => /^[a-z0-9]*$/gi.test(str);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function userRoutes(fastify) {
	fastify.get('/users/:name', async (request, reply) => {
		try {
			const { name } = request.params;
			if (!isAlphaNumeric(name))
				return reply.status(400).send({ error: "Bad Request" });
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
			if (!isAlphaNumeric(name))
				return reply.status(400).send({ error: "Bad Request" });
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

	fastify.get('/users/:name/status', async (request, reply) => {
		try {
			const { name } = request.params;
			if (!isAlphaNumeric(name))
				return reply.status(400).send({ error: "Bad Request" });
			// Look up the user in the ACTIVE_USERS map
			if (ACTIVE_USERS.has(name)) {
				const userLoginInfo = ACTIVE_USERS.get(name);
				return { name, isOnline: true, since: userLoginInfo.loggedInAt };
			}
			return { name, isOnline: false };
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})

	fastify.post('/users/:name', async (request, reply) => {
		try {
			const { name } = request.params;
			console.log(name, 'is trying to update info');
			const parts = request.parts();
			for await (const part of parts) {
				console.log(part.fieldname, part.value);
				if (part.file) {
					let uploadPath;
					if (part.filename.length === 0)
						part.filename = 'default_avatar.png';
					uploadPath = path.join(__dirname, '../volume/uploads', part.filename);
					pump(part.file, fs.createWriteStream(uploadPath));
					if (!isAlphaNumeric(name))
						return reply.status(400).send({ error: "Bad Request" });
					fastify.sqlite.prepare(
						`UPDATE users SET avatar = ? WHERE name = ?`
					).run(part.filename, name);
				} else if (part.fieldname === 'password') {
					const hashedPassword = await bcrypt.hash(part.value, 10);
					fastify.sqlite.prepare(
						`UPDATE users SET password = ? WHERE name = ?`
					).run(hashedPassword, name);
				}
				else if (part.fieldname === 'email') {
					fastify.sqlite.prepare(
						`UPDATE users SET email = ? WHERE name = ?`
					).run(part.value, name);
				}
			}
			return reply.status(200).send({ message: `Updated info for ${name}` });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})

	fastify.post('/users/:name/friend', async (request, reply) => {
		try {
			const { userName, friendName } = request.body;
			if (!isAlphaNumeric(userName) || !isAlphaNumeric(friendName))
				return reply.status(400).send({ error: "Bad Request" });
			const existingUser = fastify.sqlite.prepare(
				`SELECT * FROM users WHERE name = ?`
			).get(userName);
			const existingFriend = fastify.sqlite.prepare(
				`SELECT * FROM users WHERE name = ?`
			).get(friendName);
			if (existingUser && existingFriend) {
				const existingFriendship = fastify.sqlite.prepare(
					`SELECT * FROM friends WHERE user_name = ? AND friend_name = ?`
				).get(userName, friendName);
				if (existingFriendship) {
					return reply.status(400).send({ error: "User is already your friend" });
				}
				// Add the user-friend unilateral relationship
				fastify.sqlite.prepare(
					`INSERT INTO friends (user_name, friend_name) VALUES (?, ?)`
				).run(userName, friendName);
				return reply.status(200).send({ message: "Friend added successfully" });
			}
			return reply.status(404).send({ error: `User named ${friendName} not found` });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})

	fastify.get('/users/:name/friends', async (request, reply) => {
		try {
			const { name } = request.params;
			if (!isAlphaNumeric(name))
				return reply.status(400).send({ error: "Bad Request" });
			console.log('Fetching friends list for', name);
			const friends = fastify.sqlite.prepare(
				`SELECT friend_name FROM friends WHERE user_name = ?`
			).all(name);
			return reply.status(200).send(friends);
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})
}

export default userRoutes