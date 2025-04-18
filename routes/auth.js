import fs from 'node:fs'
import pump from 'pump'
import path from 'node:path'
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { ACTIVE_USERS } from '../server.js'

async function authRoutes(fastify) {
	fastify.post('/register', async (req, res) => {
		const parts = req.parts()
		const fields = {}
		let avatarInfo = null
		try {
			for await (const part of parts) {
				if (part.file) {
					let uploadPath
					if (part.filename.length === 0)
						part.filename = 'default_avatar.png'
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
		).run(username, hashedPassword, avatarInfo.filename)
		return res.send({ message: 'User registered successfully!' })
	})
	
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
		return res.redirect('/home')
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

export default authRoutes