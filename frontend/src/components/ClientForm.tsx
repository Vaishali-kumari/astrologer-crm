import { useState, FormEvent } from 'react';
import { Client, ZODIAC_SIGNS } from '../types';

interface Props {
  initial?: Partial<Client>;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ClientForm({ initial = {}, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    dateOfBirth: initial.dateOfBirth || '',
    timeOfBirth: initial.timeOfBirth || '',
    placeOfBirth: initial.placeOfBirth || '',
    zodiacSign: initial.zodiacSign || '',
    risingSign: initial.risingSign || '',
    moonSign: initial.moonSign || '',
    address: initial.address || '',
    notes: initial.notes || ''
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Full Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Client's full name" />
        </div>

        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
        </div>

        <div>
          <label className="label">Phone</label>
          <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
        </div>

        <div>
          <label className="label">Date of Birth</label>
          <input className="input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
        </div>

        <div>
          <label className="label">Time of Birth</label>
          <input className="input" type="time" value={form.timeOfBirth} onChange={e => set('timeOfBirth', e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="label">Place of Birth</label>
          <input className="input" value={form.placeOfBirth} onChange={e => set('placeOfBirth', e.target.value)} placeholder="City, State, Country" />
        </div>

        <div>
          <label className="label">Sun Sign (Zodiac)</label>
          <select className="input" value={form.zodiacSign} onChange={e => set('zodiacSign', e.target.value)}>
            <option value="">Select zodiac sign</option>
            {ZODIAC_SIGNS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Rising Sign (Ascendant)</label>
          <select className="input" value={form.risingSign} onChange={e => set('risingSign', e.target.value)}>
            <option value="">Select rising sign</option>
            {ZODIAC_SIGNS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Moon Sign</label>
          <select className="input" value={form.moonSign} onChange={e => set('moonSign', e.target.value)}>
            <option value="">Select moon sign</option>
            {ZODIAC_SIGNS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Client's address" />
        </div>

        <div className="md:col-span-2">
          <label className="label">Notes</label>
          <textarea
            className="input resize-none"
            rows={3}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Additional notes about the client..."
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Client'}
        </button>
      </div>
    </form>
  );
}
