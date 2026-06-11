const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  const clients = db.get('clients').value();
  const consultations = db.get('consultations').value();
  const followups = db.get('followups').value();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const todayStr = now.toISOString().split('T')[0];

  const upcomingConsultations = consultations
    .filter(c => c.date >= now.toISOString() && c.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const recentClients = clients
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const pendingFollowups = followups
    .filter(f => !f.done)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdueFollowups = pendingFollowups.filter(f => f.dueDate < todayStr);

  const thisMonthConsultations = consultations.filter(c => c.date >= startOfMonth);
  const thisMonthRevenue = thisMonthConsultations
    .filter(c => c.feePaid)
    .reduce((sum, c) => sum + (c.fee || 0), 0);

  const totalRevenue = consultations
    .filter(c => c.feePaid)
    .reduce((sum, c) => sum + (c.fee || 0), 0);

  // Attach client names to upcoming consultations
  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = c.name; });

  const upcomingWithNames = upcomingConsultations.map(c => ({
    ...c,
    clientName: clientMap[c.clientId] || 'Unknown'
  }));

  const pendingWithNames = pendingFollowups.slice(0, 5).map(f => ({
    ...f,
    clientName: clientMap[f.clientId] || 'Unknown'
  }));

  res.json({
    stats: {
      totalClients: clients.length,
      totalConsultations: consultations.length,
      thisMonthConsultations: thisMonthConsultations.length,
      pendingFollowups: pendingFollowups.length,
      overdueFollowups: overdueFollowups.length,
      thisMonthRevenue,
      totalRevenue
    },
    upcomingConsultations: upcomingWithNames,
    recentClients,
    pendingFollowups: pendingWithNames
  });
});

module.exports = router;
