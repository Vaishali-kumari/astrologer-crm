import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarDays, Bell, IndianRupee, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import api from '../api/axios';
import { DashboardStats } from '../types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-yellow-100 text-yellow-700'
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-gray-400">Loading dashboard...</div>;
  if (!data) return null;

  const { stats, upcomingConsultations, recentClients, pendingFollowups } = data;

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'text-purple-600 bg-purple-100' },
    { label: 'Consultations This Month', value: stats.thisMonthConsultations, icon: CalendarDays, color: 'text-blue-600 bg-blue-100' },
    { label: 'Pending Follow-ups', value: stats.pendingFollowups, icon: Bell, color: 'text-orange-600 bg-orange-100', warn: stats.overdueFollowups > 0 },
    { label: 'Revenue This Month', value: `₹${stats.thisMonthRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600 bg-green-100' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Overdue Follow-ups', value: stats.overdueFollowups, icon: AlertCircle, color: 'text-red-600 bg-red-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your astrology practice</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Consultations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Consultations</h2>
            <Link to="/consultations" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {upcomingConsultations.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming consultations</p>
          ) : (
            <div className="space-y-3">
              {upcomingConsultations.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{c.clientName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(c.date), 'dd MMM, hh:mm a')} · {c.type}
                    </p>
                  </div>
                  <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Follow-ups */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Follow-ups</h2>
            <Link to="/followups" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {pendingFollowups.length === 0 ? (
            <p className="text-gray-400 text-sm">No pending follow-ups</p>
          ) : (
            <div className="space-y-3">
              {pendingFollowups.map(f => {
                const isOverdue = f.dueDate < new Date().toISOString().split('T')[0];
                return (
                  <div key={f.id} className={`flex items-center justify-between p-3 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{f.clientName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{f.note}</p>
                    </div>
                    <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {format(parseISO(f.dueDate), 'dd MMM')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Clients</h2>
            <Link to="/clients" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {recentClients.length === 0 ? (
            <p className="text-gray-400 text-sm">No clients yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentClients.map(c => (
                <Link key={c.id} to={`/clients/${c.id}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-cosmic-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.zodiacSign || 'No sign set'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
