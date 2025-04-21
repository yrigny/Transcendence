import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection plugin
async function dbConnector(fastify) {
  const db = new Database(path.join(__dirname, '../volume/database/database.sqlite'));
  console.log('Database connected');

  // Create the 'users' table if it doesn't exist
  try {
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT NOT NULL,
      two_fa_enabled BOOLEAN DEFAULT FALSE,
      register_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
  }

  // Create the 'matches' table if it doesn't exist
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1 TEXT NOT NULL,
        player2 TEXT NOT NULL,
        player1_score INTEGER NOT NULL DEFAULT 0,
        player2_score INTEGER NOT NULL DEFAULT 0,
        game_start_time TEXT,
        game_end_time TEXT,
        FOREIGN KEY (player1) REFERENCES users(name) ON DELETE CASCADE,
        FOREIGN KEY (player2) REFERENCES users(name) ON DELETE CASCADE
      )
    `).run();
    console.log('Matches table created successfully');
  } catch (error) {
    console.error('Error creating matches table:', error);
  }

  // Create the 'tournaments' table if it doesn't exist
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT CHECK(status IN ('upcoming', 'ongoing', 'finished')) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    console.log('Tournaments table created successfully');
  } catch (error) {
    console.log('Error creating tournaments table:', error);
  }

  // Create the 'friends' table if it doesn't exist
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS friends (
        user_name TEXT NOT NULL,
        friend_name TEXT NOT NULL,
        PRIMARY KEY (user_name, friend_name)
      )
    `).run();
    console.log('Friends table created successfully');
  } catch (error) {
    console.log('Error creating friends table:', error);
  }

  fastify.decorate('sqlite', db); // Attach the db to Fastify instance
}

export default fp(dbConnector); // Register the plugin
