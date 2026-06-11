const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/followups
router.get('/', (req, res) => {
  const { clientId, done } = req.query;
  let followups = db.get('followups').value();

  if (clientId) followups = followups.filter(f => f.clientId === clientId);
  if (done !== undefined) followups = followups.filter(f => f.done === (done === 'true'));

  const clients = db.get('clients').value();
  followups = followups.map(f => {
    const client = clients.find(c => c.id === f.clientId);
    return { ...f, clientName: client ? client.name : 'Unknown' };
  });

  followups.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  res.json(followups);
});

// POST /api/followups
router.post('/', (req, res) => {
  const { clientId, consultationId, dueDate, note } = req.body;

  if (!clientId || !dueDate) {
    return res.status(400).json({ error: 'clientId and dueDate are required' });
  }

  const followup = {
    id: uuidv4(),
    clientId,
    consultationId: consultationId || null,
    dueDate,
    note: note || '',
    done: false,
    createdAt: new Date().toISOString()
  };

  db.get('followups').push(followup).write();
  res.status(201).json(followup);
});

// PATCH /api/followups/:id/toggle - mark done/undone
router.patch('/:id/toggle', (req, res) => {
  const followup = db.get('followups').find({ id: req.params.id }).value();
  if (!followup) return res.status(404).json({ error: 'Follow-up not found' });

  db.get('followups').find({ id: req.params.id }).assign({ done: !followup.done }).write();
  res.json({ ...followup, done: !followup.done });
});

// DELETE /api/followups/:id
router.delete('/:id', (req, res) => {
  db.get('followups').remove({ id: req.params.id }).write();
  res.json({ message: 'Follow-up deleted' });
});

module.exports = router;
