import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { Followup, Client } from '../types';
import Modal from '../components/Modal';
import { format, parseISO, isPast, parseISO as parse } from 'date-fns';
import toast from 'react-hot-toast';

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientId: '', dueDate: '', note: '' });

  const fetchAll = () => {
    Promise.all([
      api.get('/followups', { params: showDone ? {} : { done: 'false' } }),
      api.get('/clients')
    ])
      .then(([fuRes, clientRes]) => {
        setFollowups(fuRes.data);
        setClients(clientRes.data);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [showDone]);

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/followups/${id}/toggle`);
      toast.success('Follow-up updated');
      fetchAll();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this follow-up?')) return;
    try {
      await api.delete(`/followups/${id}`);
      toast.success('Follow-up deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/followups', form);
      toast.success('Follow-up created');
      setShowModal(false);
      setForm({ clientId: '', dueDate: '', note: '' });
      fetchAll();
    } catch {
      toast.error('Failed to create follow-up');
    } finally {
      setSaving(false);
    }
  };

  const overdue = followups.filter(f => !f.done && f.dueDate < new Date().toISOString().split('T')[0]);
  const upcoming = followups.filter(f => !f.done && f.dueDate >= new Date().toISOString().split('T')[0]);
  const done = followups.filter(f => f.done);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-gray-500 text-sm mt-1">
            {overdue.length > 0 && <span className="text-red-600 font-medium">{overdue.length} overdue · </span>}
            {upcoming.length} upcoming
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 border border-gray-300 rounded-lg">
            <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded" />
            Show completed
          </label>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : followups.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No follow-ups found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-red-600 flex items-center gap-1 mb-2">
                <AlertCircle className="w-4 h-4" /> Overdue
              </h2>
              {overdue.map(f => <FollowupCard key={f.id} followup={f} onToggle={handleToggle} onDelete={handleDelete} />)}
            </div>
          )}
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Upcoming</h2>
              {upcoming.map(f => <FollowupCard key={f.id} followup={f} onToggle={handleToggle} onDelete={handleDelete} />)}
            </div>
          )}
          {/* Done */}
          {showDone && done.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-2 mt-4">Completed</h2>
              {done.map(f => <FollowupCard key={f.id} followup={f} onToggle={handleToggle} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title="New Follow-up" onClose={() => setShowModal(false)} size="md">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Client *</label>
              <select className="input" value={form.clientId}
                onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input className="input" type="date" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Note</label>
              <textarea className="input resize-none" rows={3} value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="What to follow up about..." />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Create Follow-up'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function FollowupCard({ followup: f, onToggle, onDelete }: {
  followup: Followup;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = !f.done && f.dueDate < new Date().toISOString().split('T')[0];

  return (
    <div className={`card flex items-start gap-3 mb-2 ${f.done ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <button
        onClick={() => onToggle(f.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          f.done ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-primary-500'
        }`}
      >
        {f.done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link to={`/clients/${f.clientId}`} className="font-medium text-gray-900 hover:text-primary-600 text-sm">
            {f.clientName}
          </Link>
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
            {format(parseISO(f.dueDate), 'dd MMM yyyy')}
          </span>
        </div>
        {f.note && <p className="text-sm text-gray-500 mt-0.5">{f.note}</p>}
      </div>
      <button
        onClick={() => onDelete(f.id)}
        className="text-gray-300 hover:text-red-500 transition-colors p-1"
      >
        ×
      </button>
    </div>
  );
}
