import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, User } from 'lucide-react';
import api from '../api/axios';
import { Client, ZODIAC_SIGNS } from '../types';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zodiacFilter, setZodiacFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchClients = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (zodiacFilter) params.zodiac = zodiacFilter;
    api.get('/clients', { params })
      .then(res => setClients(res.data))
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, [search, zodiacFilter]);

  const handleCreate = async (data: Partial<Client>) => {
    setSaving(true);
    try {
      await api.post('/clients', data);
      toast.success('Client added successfully');
      setShowModal(false);
      fetchClients();
    } catch {
      toast.error('Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} clients total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input pl-9"
            placeholder="Search clients by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            className="input pl-9 pr-4 w-48"
            value={zodiacFilter}
            onChange={e => setZodiacFilter(e.target.value)}
          >
            <option value="">All Zodiac Signs</option>
            {ZODIAC_SIGNS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>

      {/* Client Grid */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-16">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No clients found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first client to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto mt-4">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <Link key={client.id} to={`/clients/${client.id}`} className="card hover:shadow-md hover:border-primary-200 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-cosmic-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                  {client.email && <p className="text-sm text-gray-500 truncate">{client.email}</p>}
                  {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {client.zodiacSign && (
                      <span className="badge bg-purple-100 text-purple-700">{client.zodiacSign}</span>
                    )}
                    {client.dateOfBirth && (
                      <span className="badge bg-blue-100 text-blue-700">
                        {new Date(client.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {(client.consultationCount ?? 0) > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{client.consultationCount} consultation{(client.consultationCount ?? 0) !== 1 ? 's' : ''}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add New Client" onClose={() => setShowModal(false)} size="xl">
          <ClientForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} loading={saving} />
        </Modal>
      )}
    </div>
  );
}
