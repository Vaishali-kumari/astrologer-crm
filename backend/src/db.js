const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const adapter = new FileSync(path.join(__dirname, '../data/db.json'));
const db = low(adapter);

// Default structure
db.defaults({
  users: [],
  clients: [],
  consultations: [],
  followups: []
}).write();

// Seed a default admin user if none exists
const users = db.get('users').value();
if (users.length === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.get('users').push({
    id: uuidv4(),
    name: 'Admin Astrologer',
    email: 'admin@astrologer.com',
    password: hashedPassword,
    createdAt: new Date().toISOString()
  }).write();
  console.log('Default user created: admin@astrologer.com / admin123');
}

module.exports = db;
