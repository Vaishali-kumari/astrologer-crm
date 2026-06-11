export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  zodiacSign: string;
  risingSign: string;
  moonSign: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  consultationCount?: number;
}

export interface Consultation {
  id: string;
  clientId: string;
  clientName?: string;
  date: string;
  type: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  fee: number;
  feePaid: boolean;
  notes: string;
  recommendations: string;
  nextFollowupDate: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface Followup {
  id: string;
  clientId: string;
  clientName?: string;
  consultationId: string | null;
  dueDate: string;
  note: string;
  done: boolean;
  createdAt: string;
}

export interface DashboardStats {
  stats: {
    totalClients: number;
    totalConsultations: number;
    thisMonthConsultations: number;
    pendingFollowups: number;
    overdueFollowups: number;
    thisMonthRevenue: number;
    totalRevenue: number;
  };
  upcomingConsultations: Consultation[];
  recentClients: Client[];
  pendingFollowups: Followup[];
}

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const CONSULTATION_TYPES = [
  'General', 'Natal Chart', 'Yearly Forecast', 'Compatibility',
  'Career', 'Health', 'Relationship', 'Gemstone Recommendation',
  'Vastu', 'Muhurta', 'Prashna'
];

export const CONSULTATION_STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'];
