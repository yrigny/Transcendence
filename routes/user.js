import fs from 'node:fs'
import pump from 'pump'
import path from 'node:path'
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
				// else if (part.fieldname === 'username') {
				// 	const existingUser = fastify.sqlite.prepare(
				// 		'SELECT * FROM users WHERE name = ?'
				// 	).get(part.value);
				// 	if (existingUser && existingUser.name !== name) {
				// 		return reply.status(400).send({ error: "Username already exists" });
				// 	}
				// 	if (existingUser && existingUser.name === name) {
				// 		return reply.status(400).send({ error: "Username is unchanged" });
				// 	}
				// 	fastify.sqlite.prepare(
				// 		`UPDATE users SET name = ? WHERE name = ?`
				// 	).run(part.value, name);
				// }
			}
			return reply.status(200).send({ message: `Updated info for ${name}` });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})
}

export default userRoutes