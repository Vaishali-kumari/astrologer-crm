const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// All routes require auth
router.use(authMiddleware);

// GET /api/clients - list all clients
router.get('/', (req, res) => {
  const { search, zodiac } = req.query;
  let clients = db.get('clients').value();

  if (search) {
    const q = search.toLowerCase();
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  }

  if (zodiac) {
    clients = clients.filter(c => c.zodiacSign === zodiac);
  }

  // Attach consultation count
  const consultations = db.get('consultations').value();
  clients = clients.map(c => ({
    ...c,
    consultationCount: consultations.filter(con => con.clientId === c.id).length
  }));

  res.json(clients);
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const client = db.get('clients').find({ id: req.params.id }).value();
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const consultations = db.get('consultations')
    .filter({ clientId: req.params.id })
    .value()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const followups = db.get('followups')
    .filter({ clientId: req.params.id })
    .value();

  res.json({ ...client, consultations, followups });
});

// POST /api/clients
router.post('/', (req, res) => {
  const {
    name, email, phone, dateOfBirth, timeOfBirth, placeOfBirth,
    zodiacSign, risingSign, moonSign, address, notes
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Client name is required' });
  }

  const newClient = {
    id: uuidv4(),
    name,
    email: email || '',
    phone: phone || '',
    dateOfBirth: dateOfBirth || '',
    timeOfBirth: timeOfBirth || '',
    placeOfBirth: placeOfBirth || '',
    zodiacSign: zodiacSign || '',
    risingSign: risingSign || '',
    moonSign: moonSign || '',
    address: address || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.get('clients').push(newClient).write();
  res.status(201).json(newClient);
});

// PUT /api/clients/:id
router.put('/:id', (req, res) => {
  const client = db.get('clients').find({ id: req.params.id }).value();
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const updatedClient = {
    ...client,
    ...req.body,
    id: client.id,
    createdAt: client.createdAt,
    updatedAt: new Date().toISOString()
  };

  db.get('clients').find({ id: req.params.id }).assign(updatedClient).write();
  res.json(updatedClient);
});

// DELETE /api/clients/:id
router.delete('/:id', (req, res) => {
  const client = db.get('clients').find({ id: req.params.id }).value();
  if (!client) return res.status(404).json({ error: 'Client not found' });

  db.get('clients').remove({ id: req.params.id }).write();
  // Also remove related consultations and followups
  db.get('consultations').remove({ clientId: req.params.id }).write();
  db.get('followups').remove({ clientId: req.params.id }).write();

  res.json({ message: 'Client deleted successfully' });
});

module.exports = router;
