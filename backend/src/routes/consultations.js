const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/consultations - list all with optional filters
router.get('/', (req, res) => {
  const { clientId, status, type, upcoming } = req.query;
  let consultations = db.get('consultations').value();

  if (clientId) consultations = consultations.filter(c => c.clientId === clientId);
  if (status) consultations = consultations.filter(c => c.status === status);
  if (type) consultations = consultations.filter(c => c.type === type);
  if (upcoming === 'true') {
    const now = new Date().toISOString();
    consultations = consultations.filter(c => c.date >= now && c.status !== 'cancelled');
  }

  // Attach client info
  const clients = db.get('clients').value();
  consultations = consultations.map(c => {
    const client = clients.find(cl => cl.id === c.clientId);
    return { ...c, clientName: client ? client.name : 'Unknown' };
  });

  // Sort by date descending
  consultations.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(consultations);
});

// GET /api/consultations/:id
router.get('/:id', (req, res) => {
  const consultation = db.get('consultations').find({ id: req.params.id }).value();
  if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

  const client = db.get('clients').find({ id: consultation.clientId }).value();
  res.json({ ...consultation, client });
});

// POST /api/consultations
router.post('/', (req, res) => {
  const {
    clientId, date, type, duration, status, fee, feePaid,
    notes, recommendations, nextFollowupDate
  } = req.body;

  if (!clientId || !date) {
    return res.status(400).json({ error: 'clientId and date are required' });
  }

  const client = db.get('clients').find({ id: clientId }).value();
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const newConsultation = {
    id: uuidv4(),
    clientId,
    date,
    type: type || 'General',
    duration: duration || 60,
    status: status || 'scheduled',
    fee: fee || 0,
    feePaid: feePaid || false,
    notes: notes || '',
    recommendations: recommendations || '',
    nextFollowupDate: nextFollowupDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.get('consultations').push(newConsultation).write();

  // Auto-create follow-up if date provided
  if (nextFollowupDate) {
    db.get('followups').push({
      id: uuidv4(),
      clientId,
      consultationId: newConsultation.id,
      dueDate: nextFollowupDate,
      note: 'Follow-up after consultation',
      done: false,
      createdAt: new Date().toISOString()
    }).write();
  }

  res.status(201).json(newConsultation);
});

// PUT /api/consultations/:id
router.put('/:id', (req, res) => {
  const consultation = db.get('consultations').find({ id: req.params.id }).value();
  if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

  const updated = {
    ...consultation,
    ...req.body,
    id: consultation.id,
    clientId: consultation.clientId,
    createdAt: consultation.createdAt,
    updatedAt: new Date().toISOString()
  };

  db.get('consultations').find({ id: req.params.id }).assign(updated).write();
  res.json(updated);
});

// DELETE /api/consultations/:id
router.delete('/:id', (req, res) => {
  const consultation = db.get('consultations').find({ id: req.params.id }).value();
  if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

  db.get('consultations').remove({ id: req.params.id }).write();
  res.json({ message: 'Consultation deleted' });
});

module.exports = router;
