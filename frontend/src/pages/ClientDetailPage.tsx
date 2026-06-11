import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, Phone, Mail, MapPin, Calendar, Clock } from 'lucide-react';
import api from '../api/axios';
import { Client, Consultation, CONSULTATION_TYPES, CONSULTATION_STATUSES } from '../types';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-yellow-100 text-yellow-700'
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client & { consultations: Consultation[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consultForm, setConsultForm] = useState({
    date: '', type: 'General', duration: 60, status: 'scheduled',
    fee: 0, feePaid: false, notes: '', recommendations: '', nextFollowupDate: ''
  });

  const fetchClient = () => {
    api.get(`/clients/${id}`)
      .then(res => setClient(res.data))
      .catch(() => toast.error('Failed to load client'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClient(); }, [id]);

  const handleEdit = async (data: Partial<Client>) => {
    setSaving(true);
    try {
      await api.put(`/clients/${id}`, data);
      toast.success('Client updated');
      setShowEditModal(false);
      fetchClient();
    } catch {
      toast.error('Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this client and all their consultations?')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client deleted');
      navigate('/clients');
    } catch {
      toast.error('Failed to delete client');
    }
  };

  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/consultations', {
        clientId: id,
        ...consultForm,
        nextFollowupDate: consultForm.nextFollowupDate || null
      });
      toast.success('Consultation added');
      setShowConsultModal(false);
      setConsultForm({ date: '', type: 'General', duration: 60, status: 'scheduled', fee: 0, feePaid: false, notes: '', recommendations: '', nextFollowupDate: '' });
      fetchClient();
    } catch {
      toast.error('Failed to add consultation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (!client) return <div className="text-gray-400">Client not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/clients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-500 text-sm">Client since {format(parseISO(client.createdAt), 'dd MMM yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="btn-secondary">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-cosmic-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{client.name}</h2>
                <div className="flex flex-wrap gap-1 mt-1">
                  {client.zodiacSign && <span className="badge bg-purple-100 text-purple-700">{client.zodiacSign}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {client.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {client.phone}
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {client.address}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Birth Details</h3>
            <div className="space-y-2 text-sm">
              {client.dateOfBirth && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {format(parseISO(client.dateOfBirth), 'dd MMMM yyyy')}
                </div>
              )}
              {client.timeOfBirth && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {client.timeOfBirth}
                </div>
              )}
              {client.placeOfBirth && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {client.placeOfBirth}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
              {[['Sun', client.zodiacSign], ['Rising', client.risingSign], ['Moon', client.moonSign]].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-400">{label}</p>
                  <p className="font-medium text-gray-700">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {client.notes && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Consultations */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Consultations ({client.consultations?.length || 0})
              </h2>
              <button onClick={() => setShowConsultModal(true)} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {!client.consultations || client.consultations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No consultations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {client.consultations.map(c => (
                  <div key={c.id} className="p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{c.type}</span>
                          <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
                          {c.feePaid && <span className="badge bg-green-100 text-green-700">Paid</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(parseISO(c.date), 'dd MMM yyyy, hh:mm a')} · {c.duration} min
                        </p>
                      </div>
                      {c.fee > 0 && (
                        <span className="text-sm font-semibold text-gray-700">₹{c.fee.toLocaleString()}</span>
                      )}
                    </div>
                    {c.notes && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{c.notes}</p>}
                    {c.recommendations && (
                      <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                        <strong>Recommendations:</strong> {c.recommendations}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {showEditModal && (
        <Modal title="Edit Client" onClose={() => setShowEditModal(false)} size="xl">
          <ClientForm initial={client} onSubmit={handleEdit} onCancel={() => setShowEditModal(false)} loading={saving} />
        </Modal>
      )}

      {/* Add Consultation Modal */}
      {showConsultModal && (
        <Modal title="Add Consultation" onClose={() => setShowConsultModal(false)} size="lg">
          <form onSubmit={handleAddConsultation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date & Time *</label>
                <input className="input" type="datetime-local" value={consultForm.date}
                  onChange={e => setConsultForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={consultForm.type}
                  onChange={e => setConsultForm(f => ({ ...f, type: e.target.value }))}>
                  {CONSULTATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Duration (min)</label>
                <input className="input" type="number" min="15" value={consultForm.duration}
                  onChange={e => setConsultForm(f => ({ ...f, duration: parseInt(e.target.value) }))} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={consultForm.status}
                  onChange={e => setConsultForm(f => ({ ...f, status: e.target.value }))}>
                  {CONSULTATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Fee (₹)</label>
                <input className="input" type="number" min="0" value={consultForm.fee}
                  onChange={e => setConsultForm(f => ({ ...f, fee: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="feePaid" checked={consultForm.feePaid}
                  onChange={e => setConsultForm(f => ({ ...f, feePaid: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="feePaid" className="text-sm text-gray-700">Fee Paid</label>
              </div>
            </div>
            <div>
              <label className="label">Session Notes</label>
              <textarea className="input resize-none" rows={3} value={consultForm.notes}
                onChange={e => setConsultForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes from the session..." />
            </div>
            <div>
              <label className="label">Recommendations</label>
              <textarea className="input resize-none" rows={2} value={consultForm.recommendations}
                onChange={e => setConsultForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="Gemstone suggestions, remedies, rituals..." />
            </div>
            <div>
              <label className="label">Schedule Follow-up</label>
              <input className="input" type="date" value={consultForm.nextFollowupDate}
                onChange={e => setConsultForm(f => ({ ...f, nextFollowupDate: e.target.value }))} />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowConsultModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Add Consultation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
