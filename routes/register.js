import fs from 'node:fs'
import pump from 'pump'
import path from 'node:path'
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function registerRoutes(fastify, options) {
	fastify.post('/register', async (req, res) => {
		const parts = req.parts()
		const fields = {}
		let avatarInfo = null
		try {
			for await (const part of parts) {
				if (part.file) {
					let uploadPath
					if (part.filename.length === 0)
						uploadPath = path.join(__dirname, '../volume/uploads', 'default_avatar.png')
					else
						uploadPath = path.join(__dirname, '../volume/uploads', part.filename)
					pump(part.file, fs.createWriteStream(uploadPath))
					avatarInfo = {
						filename: part.filename,
						mimetype: part.mimetype,
						path: uploadPath
					}
				}
				else {
					fields[part.fieldname] = part.value
				}
			}
		} catch (err) {
			console.error('Error processing multipart form:', err)
			return res.status(400).send({ error: 'Error processing multipart form' })
		}

		const { username, password, confirmPassword } = fields

		// validate the input
		if (!username || !password) {
			return res.status(400).send({ error: 'Username and password are required' })
		}
		if (password !== confirmPassword) {
			return res.status(400).send({ error: 'Passwords do not match' })
		}
		// if username already exists, return error
		const existingUser = fastify.sqlite.prepare(
			'SELECT * FROM users WHERE name = ?'
		).get(username)
		if (existingUser) {
			return res.status(400).send({ error: 'User already exists' })
		}
		// insert the user into the database
		const hashedPassword = await bcrypt.hash(password, 10)
		fastify.sqlite.prepare(
			'INSERT INTO users (name, password, avatar) VALUES (?, ?, ?)'
		).run(username, hashedPassword, avatarInfo.path)
		return res.send({ message: 'User registered successfully!' })
	})
}
export default registerRoutes