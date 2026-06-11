import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import { Consultation, CONSULTATION_TYPES, CONSULTATION_STATUSES } from '../types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-yellow-100 text-yellow-700'
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const fetchConsultations = () => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    if (upcomingOnly) params.upcoming = 'true';
    api.get('/consultations', { params })
      .then(res => setConsultations(res.data))
      .catch(() => toast.error('Failed to load consultations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConsultations(); }, [statusFilter, typeFilter, upcomingOnly]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/consultations/${id}`, { status });
      toast.success('Status updated');
      fetchConsultations();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleTogglePayment = async (c: Consultation) => {
    try {
      await api.put(`/consultations/${c.id}`, { feePaid: !c.feePaid });
      toast.success(c.feePaid ? 'Payment marked unpaid' : 'Payment marked as paid');
      fetchConsultations();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  const totalRevenue = consultations.filter(c => c.feePaid).reduce((s, c) => s + c.fee, 0);
  const pendingRevenue = consultations.filter(c => !c.feePaid && c.status !== 'cancelled').reduce((s, c) => s + c.fee, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
        <p className="text-gray-500 text-sm mt-1">{consultations.length} records</p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Collected Revenue</p>
            <p className="text-xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending Payment</p>
            <p className="text-xl font-bold text-gray-900">₹{pendingRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {CONSULTATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {CONSULTATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <input type="checkbox" checked={upcomingOnly} onChange={e => setUpcomingOnly(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded" />
          Upcoming only
        </label>
      </div>

      {/* Consultations list */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : consultations.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400">No consultations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/clients/${c.clientId}`} className="font-semibold text-gray-900 hover:text-primary-600">
                      {c.clientName}
                    </Link>
                    <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
                    <span className="badge bg-gray-100 text-gray-700">{c.type}</span>
                    {c.feePaid && <span className="badge bg-green-100 text-green-700">Paid</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(parseISO(c.date), 'dd MMM yyyy, hh:mm a')}
                    </span>
                    <span>{c.duration} min</span>
                    {c.fee > 0 && <span className="font-medium text-gray-700">₹{c.fee.toLocaleString()}</span>}
                  </div>
                  {c.notes && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.notes}</p>}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  {c.fee > 0 && (
                    <button
                      onClick={() => handleTogglePayment(c)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        c.feePaid
                          ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c.feePaid ? <CheckCircle className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                    </button>
                  )}
                  {c.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'completed')}
                      title="Mark complete"
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-green-50 hover:border-green-300 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
