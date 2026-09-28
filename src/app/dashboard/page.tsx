'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Users,
  Calendar as CalendarIcon, 
  List, 
  TrendingUp, 
  LogOut, 
  Globe, 
  Lock, 
  Mail, 
  Search, 
  Trash2, 
  User, 
  Clock, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Phone, 
  Check, 
  X,
  ShieldAlert,
  Eye,
  Menu,
  Settings,
  AlertCircle,
  QrCode,
  Download,
  Star
} from 'lucide-react';
import styles from './dashboard.module.css';
import SchedulesManager from '../../components/SchedulesManager';

// Dynamic staff will be loaded from DB

interface Service {
  title: string;
  price: number;
  durationMin: number;
}

interface Booking {
  id: string;
  ref_code: string;
  date_str: string;
  time_str: string;
  datetime_timestamp: string;
  staff_name: string;
  services: Service[];
  client_name: string;
  client_email: string;
  client_phone: string;
  total_duration: number;
  created_at: string;
  morning_reminder_sent: boolean;
  hour_reminder_sent: boolean;
}

interface StaffReview {
  id: string;
  staff_name: string;
  author_name?: string;
  status: string;
  created_at: string;
}

const STAFF_LIST = ['Brenda', 'Edith', 'María', 'Cualquier miembro del personal', 'Any Staff Member'];

// Dashboard Localized Translations
const t = {
  es: {
    loginTitle: 'Acceso Administrativo',
    loginSubtitle: 'Panel de Control de María Bonita',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    loginBtn: 'Ingresar',
    emailError: 'Este panel está restringido al correo oficial del salón.',
    passwordError: 'Contraseña incorrecta. Por favor intenta de nuevo.',
    fillFields: 'Por favor, llena todos los campos.',
    
    sidebarTitle: 'María Bonita',
    sidebarSubtitle: 'Beauty Salon',
    tabOverview: 'Indicadores',
    tabCalendar: 'Calendario',
    tabList: 'Lista de Citas',
    tabTraffic: 'Tráfico Web',
    logout: 'Cerrar Sesión',
    
    welcome: 'Bienvenida, María',
    subtitle: 'Aquí tienes un resumen de la actividad del salón.',
    loading: 'Cargando citas...',
    noBookings: 'No se encontraron citas agendadas.',
    
    // Overview
    totalBookings: 'Total de Citas',
    estRevenue: 'Esquema de Precios',
    busiestStaff: 'Estilista Más Ocupada',
    topService: 'Servicio Más Solicitado',
    servicesPopularity: 'Popularidad de Servicios',
    staffLoad: 'Distribución por Estilista',
    noVaries: 'Varía',
    
    // Calendar
    selectDay: 'Detalles del día',
    noAppointmentsDay: 'No hay citas para esta fecha.',
    appointmentsCount: 'citas',
    appointmentCount: 'cita',
    weekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    
    // List
    searchPlaceholder: 'Buscar por cliente, correo, teléfono o código...',
    filterStaff: 'Todas las Estilistas',
    colRef: 'Ref',
    colClient: 'Cliente',
    colDate: 'Fecha y Hora',
    colServices: 'Servicios',
    colStaff: 'Estilista',
    colReminders: 'Recordatorios',
    colActions: 'Acciones',
    valRemindersSent: 'Enviados',
    valRemindersPending: 'Pendiente',
    
    // Modals & Details
    detailTitle: 'Detalle de la Cita',
    detailCustomer: 'Información del Cliente',
    detailServices: 'Servicios Reservados',
    detailBooking: 'Detalles de Reserva',
    lblPhone: 'Teléfono:',
    lblEmail: 'Email:',
    lblDuration: 'Duración total:',
    lblTotal: 'Total:',
    lblCreated: 'Agendada el:',
    btnCancelAppointment: 'Cancelar Cita',
    btnDismiss: 'Cerrar',
    confirmCancel: '¿Estás completamente seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer y se eliminará de Supabase.',
    cancelSuccess: 'La cita ha sido cancelada exitosamente.',
    cancelError: 'Hubo un error al intentar cancelar la cita en Supabase.',

    // Traffic Tab & Sections
    sectionSalon: 'Actividad del Salón (Supabase)',
    sectionVisitas: 'Visitas al Sitio Web (Google Analytics)',
    sectionGoogle: 'Rendimiento en Google (Search Console)',
    trafficTitle: 'Visitas y Búsquedas en Google',
    metricUniqueUsers: 'Visitantes Únicos',
    metricPageViews: 'Vistas de Página',
    metricGoogleClicks: 'Clics en Búsqueda',
    metricGoogleImpressions: 'Impresiones',
    metricGoogleCtr: 'CTR Google',
    metricGooglePosition: 'Posición Google',
    topQueries: 'Búsquedas Principales (Palabras Clave)',
    topPages: 'Páginas Más Populares',
    queriesColKeyword: 'Búsqueda / Consulta',
    queriesColClicks: 'Clics',
    queriesColImpressions: 'Imp.',
    queriesColCtr: 'CTR',
    queriesColPosition: 'Posición',
    pagesColPath: 'Página',
    pagesColViews: 'Vistas',
    deviceType: 'Dispositivos de Entrada',
    setupRequired: 'Configuración de Analytics Pendiente',
    setupRequiredDesc: 'Para visualizar el tráfico web en tiempo real, es necesario configurar tu ID de Propiedad de Google Analytics en las variables de entorno del servidor.',
    setupSteps: [
      'Abre el archivo .env.local en la raíz de tu proyecto.',
      'Añade la línea: GA_PROPERTY_ID=tu_id_de_9_digitos (reemplaza con tu ID real de Analytics).',
      'Reinicia tu servidor local ejecutando npm run dev de nuevo.'
    ],
    datePreset7: 'Últimos 7 días',
    datePreset30: 'Últimos 30 días',
    datePreset90: 'Últimos 90 días',
    datePresetCustom: 'Personalizado',
    dateStartLabel: 'Desde:',
    dateEndLabel: 'Hasta:',
    dateUpdateBtn: 'Aplicar'
  },
  en: {
    loginTitle: 'Administrative Login',
    loginSubtitle: 'María Bonita Control Panel',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    loginBtn: 'Login',
    emailError: 'This panel is restricted to the salon\'s official email.',
    passwordError: 'Incorrect password. Please try again.',
    fillFields: 'Please fill in all fields.',
    
    sidebarTitle: 'María Bonita',
    sidebarSubtitle: 'Beauty Salon',
    tabOverview: 'Overview',
    tabCalendar: 'Calendar',
    tabList: 'Appointments List',
    tabTraffic: 'Web Traffic',
    logout: 'Logout',
    
    welcome: 'Welcome, Maria',
    subtitle: 'Here is the summary of the salon activity.',
    loading: 'Loading appointments...',
    noBookings: 'No scheduled appointments found.',
    
    // Overview
    totalBookings: 'Total Bookings',
    estRevenue: 'Pricing Scheme',
    busiestStaff: 'Busiest Staff',
    topService: 'Top Requested Service',
    servicesPopularity: 'Services Popularity',
    staffLoad: 'Staff Load Distribution',
    noVaries: 'Varies',
    
    // Calendar
    selectDay: 'Day Details',
    noAppointmentsDay: 'No appointments for this date.',
    appointmentsCount: 'appointments',
    appointmentCount: 'appointment',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    
    // List
    searchPlaceholder: 'Search by client, email, phone, or reference code...',
    filterStaff: 'All Staff Members',
    colRef: 'Ref',
    colClient: 'Client',
    colDate: 'Date & Time',
    colServices: 'Services',
    colStaff: 'Staff',
    colReminders: 'Reminders',
    colActions: 'Actions',
    valRemindersSent: 'Sent',
    valRemindersPending: 'Pending',
    
    // Modals & Details
    detailTitle: 'Appointment Details',
    detailCustomer: 'Customer Information',
    detailServices: 'Reserved Services',
    detailBooking: 'Booking Details',
    lblPhone: 'Phone:',
    lblEmail: 'Email:',
    lblDuration: 'Total duration:',
    lblTotal: 'Total:',
    lblCreated: 'Booked on:',
    btnCancelAppointment: 'Cancel Appointment',
    btnDismiss: 'Close',
    confirmCancel: 'Are you absolutely sure you want to cancel this appointment? This action cannot be undone and will delete it from Supabase.',
    cancelSuccess: 'The appointment has been successfully cancelled.',
    cancelError: 'There was an error trying to cancel the appointment in Supabase.',

    // Traffic Tab & Sections
    sectionSalon: 'Salon Activity (Supabase)',
    sectionVisitas: 'Website Visitors (Google Analytics)',
    sectionGoogle: 'Google Search Engine (Search Console)',
    trafficTitle: 'Google Analytics & Search Performance',
    metricUniqueUsers: 'Active Visitors',
    metricPageViews: 'Page Views',
    metricGoogleClicks: 'Search Clicks',
    metricGoogleImpressions: 'Impressions',
    metricGoogleCtr: 'Google CTR',
    metricGooglePosition: 'Google Rank',
    topQueries: 'Top Search Keywords',
    topPages: 'Most Visited Pages',
    queriesColKeyword: 'Search Query',
    queriesColClicks: 'Clicks',
    queriesColImpressions: 'Imp.',
    queriesColCtr: 'CTR',
    queriesColPosition: 'Position',
    pagesColPath: 'Page Path',
    pagesColViews: 'Views',
    deviceType: 'Visitor Devices',
    setupRequired: 'Analytics Setup Required',
    setupRequiredDesc: 'To display real-time traffic statistics, you must configure your Google Analytics Property ID in the environment variables.',
    setupSteps: [
      'Open the .env.local file in the project root.',
      'Add the line: GA_PROPERTY_ID=your_9_digit_id (replace with your actual Analytics ID).',
      'Restart your development server by running npm run dev again.'
    ],
    datePreset7: 'Last 7 days',
    datePreset30: 'Last 30 days',
    datePreset90: 'Last 90 days',
    datePresetCustom: 'Custom Range',
    dateStartLabel: 'From:',
    dateEndLabel: 'To:',
    dateUpdateBtn: 'Apply'
  }
};

// Helper to generate a smooth Bezier path for rounded charts
const getBezierPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  
  let path = `M ${points[0].x} ${points[0].y}`;
  const K = 0.15; // smoothing factor
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    
    const prev = points[i - 1] || p0;
    const next = points[i + 2] || p1;
    
    const cp1x = p0.x + K * (p1.x - prev.x);
    const cp1y = p0.y + K * (p1.y - prev.y);
    
    const cp2x = p1.x - K * (next.x - p0.x);
    const cp2y = p1.y - K * (next.y - p0.y);
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return path;
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<'es' | 'en'>('es');
  
  // Auth States
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Navigation & Data States
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'table' | 'qr' | 'reviews' | 'schedules'>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffReviews, setStaffReviews] = useState<StaffReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [reviewsFilter, setReviewsFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');

  // Schedule States
  const [schedules, setSchedules] = useState<any[]>([]);
  const [salonStaff, setSalonStaff] = useState<{id: string, nameEs: string, nameEn: string, email?: string}[]>([]);
  const [selectedScheduleStaff, setSelectedScheduleStaff] = useState<string>('maria');
  const [isSavingSchedules, setIsSavingSchedules] = useState(false);

  const filteredStaffReviews = useMemo(() => {
    return staffReviews.filter(r => {
      if (reviewsFilter === 'all') return true;
      const reviewDate = new Date(r.created_at);
      const now = new Date();
      if (reviewsFilter === 'today') {
        return reviewDate.toDateString() === now.toDateString();
      }
      if (reviewsFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return reviewDate >= oneWeekAgo;
      }
      if (reviewsFilter === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return reviewDate >= oneMonthAgo;
      }
      return true;
    });
  }, [staffReviews, reviewsFilter]);

  // Traffic Integration States
  const [trafficData, setTrafficData] = useState<any>(null);
  const [searchData, setSearchData] = useState<any>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficError, setTrafficError] = useState<string | null>(null);
  const [configMissing, setConfigMissing] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredSearchIdx, setHoveredSearchIdx] = useState<number | null>(null);

  // Date Range Picker States
  const [dateRangePreset, setDateRangePreset] = useState<'7days' | '30days' | '90days' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const text = t[lang];

  // Hydration prevention
  useEffect(() => {
    setMounted(true);
    const savedSession = localStorage.getItem('maria_dashboard_auth');
    if (savedSession === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch Traffic Data from APIs
  const fetchTrafficData = async (preset?: string, start?: string, end?: string) => {
    setTrafficLoading(true);
    setTrafficError(null);
    setConfigMissing(false);

    // Calculate dates
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    const activePreset = preset || dateRangePreset;
    let startDate = '';
    let endDate = end || formatDate(today);

    if (activePreset === '7days') {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      startDate = formatDate(d);
    } else if (activePreset === '30days') {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      startDate = formatDate(d);
    } else if (activePreset === '90days') {
      const d = new Date();
      d.setDate(today.getDate() - 90);
      startDate = formatDate(d);
    } else {
      // custom
      startDate = start || customStartDate;
      endDate = end || customEndDate;
    }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fegqbewlxombdmonlxyr.supabase.co';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      try {
        const [analyticsRes, searchRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/analytics`, { 
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ startDate, endDate })
        }),
        fetch(`${supabaseUrl}/functions/v1/search-console`, { 
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ startDate, endDate })
        })
      ]);

      const analytics = await analyticsRes.json();
      const search = await searchRes.json();

      if (!analytics.success && analytics.code === 'CONFIG_MISSING') {
        setConfigMissing(true);
        setTrafficLoading(false);
        return;
      }

      if (analytics.success) {
        setTrafficData(analytics);
      } else {
        setTrafficError(analytics.error || 'Failed to fetch analytics');
      }

      if (search.success) {
        setSearchData(search);
      } else if (search.code !== 'CONFIG_MISSING') {
        console.warn('Failed to fetch search console:', search.error);
      }
    } catch (err) {
      console.error('Error fetching traffic/search data:', err);
      setTrafficError(lang === 'es' ? 'Error de red al cargar estadísticas' : 'Network error fetching traffic stats');
    } finally {
      setTrafficLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === 'overview') {
      if (dateRangePreset !== 'custom') {
        fetchTrafficData(dateRangePreset);
      }
    }
  }, [isLoggedIn, activeTab, dateRangePreset]);

  // Fetch Bookings from Supabase
  const fetchBookings = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase variables not configured.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/bookings?select=*&order=datetime_timestamp.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        console.error("Failed to fetch bookings:", await res.text());
      }
    } catch (err) {
      console.error("Network error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/staff_reviews?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffReviews(data);
      }
    } catch (err) {
      console.error("Network error fetching reviews:", err);
    }
  };

  const fetchSchedules = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/staff_schedules?select=*`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error("Network error fetching schedules:", err);
    }
  };

  const fetchSalonStaff = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/salon_staff?select=*&order=created_at.asc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Map to our expected format
        const formatted = data.map((d: any) => ({
          id: d.id,
          nameEs: d.name,
          nameEn: d.name,
          email: d.mail || ''
        }));
        setSalonStaff(formatted);
      }
    } catch (err) {
      console.error("Network error fetching salon staff:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchBookings();
      fetchReviews();
      fetchSchedules();
      fetchSalonStaff();
    }
  }, [isLoggedIn]);

  if (!mounted) return null;

  // Handle Login Form
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!email.trim()) {
      setLoginError(text.fillFields);
      return;
    }

    // 1. Restrict email to mariabarrientossalon@gmail.com
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'mariabarrientossalon@gmail.com') {
      setLoginError(text.emailError);
      return;
    }

    // Success login
    setIsLoggedIn(true);
    localStorage.setItem('maria_dashboard_auth', 'true');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('maria_dashboard_auth');
    setEmail('');
  };

  // Handle Cancel Appointment in Supabase
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm(text.confirmCancel)) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (res.ok) {
        alert(text.cancelSuccess);
        setSelectedBooking(null);
        // Refresh local listings
        fetchBookings();
      } else {
        const errorMsg = await res.text();
        console.error("Failed to delete booking:", errorMsg);
        alert(`${text.cancelError} Details: ${errorMsg}`);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(text.cancelError);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    if (!window.confirm(lang === 'es' ? '¿Aprobar esta reseña manualmente?' : 'Manually approve this review?')) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/staff_reviews?id=eq.${reviewId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (res.ok) {
        setStaffReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r));
      } else {
        const errorMsg = await res.text();
        console.error("Failed to approve review:", errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (err) {
      console.error("Error approving review:", err);
    }
  };

  // ----------------------------------------
  // STATISTICS CALCULATIONS (OVERVIEW TAB)
  // ----------------------------------------
  const totalCount = bookings.length;
  
  // Busiest Staff Member
  const staffCounts: Record<string, number> = {};
  bookings.forEach(b => {
    const sName = b.staff_name || 'Unassigned';
    staffCounts[sName] = (staffCounts[sName] || 0) + 1;
  });
  let busiestStaff = '-';
  let maxStaffCount = 0;
  Object.entries(staffCounts).forEach(([staff, count]) => {
    if (count > maxStaffCount) {
      maxStaffCount = count;
      busiestStaff = staff;
    }
  });

  // Most Popular Service
  const serviceCounts: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.services && Array.isArray(b.services)) {
      b.services.forEach(s => {
        serviceCounts[s.title] = (serviceCounts[s.title] || 0) + 1;
      });
    }
  });
  let topService = '-';
  let maxServiceCount = 0;
  Object.entries(serviceCounts).forEach(([svc, count]) => {
    if (count > maxServiceCount) {
      maxServiceCount = count;
      topService = svc;
    }
  });

  // Estimated Revenue (Only items with price > 0)
  let totalRevenue = 0;
  bookings.forEach(b => {
    if (b.services && Array.isArray(b.services)) {
      b.services.forEach(s => {
        totalRevenue += s.price || 0;
      });
    }
  });

  // Services distribution sorting
  const sortedServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Staff load distribution sorting
  const sortedStaff = Object.entries(staffCounts)
    .sort((a, b) => b[1] - a[1]);

  // ----------------------------------------
  // CALENDAR GENERATION (CALENDAR TAB)
  // ----------------------------------------
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const cYear = currentMonth.getFullYear();
  const cMonth = currentMonth.getMonth();
  const daysCount = getDaysInMonth(cYear, cMonth);
  const startOffset = getFirstDayOfMonth(cYear, cMonth);

  const calendarDaysList: { date: Date | null; isCurrentMonth: boolean }[] = [];

  // Previous month padding cells
  for (let i = 0; i < startOffset; i++) {
    calendarDaysList.push({ date: null, isCurrentMonth: false });
  }

  // Current month day cells
  for (let day = 1; day <= daysCount; day++) {
    calendarDaysList.push({
      date: new Date(cYear, cMonth, day),
      isCurrentMonth: true
    });
  }

  // Get appointments for a specific day
  const getBookingsForDay = (date: Date) => {
    return bookings.filter(b => {
      try {
        const bDate = new Date(b.datetime_timestamp);
        return bDate.getFullYear() === date.getFullYear() &&
               bDate.getMonth() === date.getMonth() &&
               bDate.getDate() === date.getDate();
      } catch (err) {
        return false;
      }
    });
  };

  // Selected Day appointments listed on the right sidebar
  const selectedDayBookings = selectedDate ? getBookingsForDay(selectedDate) : [];

  // ----------------------------------------
  // BOOKINGS TABLE FILTERING (LIST TAB)
  // ----------------------------------------
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.client_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.client_phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.ref_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.date_str || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    if (staffFilter === 'all') return matchesSearch;
    
    // Fuzzy matching for staff
    const bStaffLower = (b.staff_name || '').toLowerCase();
    const filterLower = staffFilter.toLowerCase();
    return matchesSearch && bStaffLower.includes(filterLower);
  });

  // Format helper for duration
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    if (rem === 0) return lang === 'es' ? `${hours} h` : `${hours} h`;
    return `${hours}h ${rem}m`;
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* 1. LOGIN SCREEN CONTAINER */}
      {!isLoggedIn ? (
        <div className={styles.loginOverlay}>
          <div className={styles.loginCard}>
            <div className={styles.loginLogoWrapper}>
              <Image 
                src="/maria.png" 
                alt="María Bonita" 
                width={180} 
                height={180} 
                style={{ objectFit: 'contain' }} 
                priority 
              />
            </div>
            <h2 className={styles.loginTitle}>{text.loginTitle}</h2>
            <p className={styles.loginSubtitle}>{text.loginSubtitle}</p>
            
            {loginError && <div className={styles.loginError}>{loginError}</div>}
            
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{text.emailLabel}</label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === 'es' ? 'correo@ejemplo.com' : 'admin@example.com'}
                    className={styles.loginInput}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.loginBtn}>
                <Sparkles size={16} />
                {text.loginBtn}
              </button>
            </form>
            
            {/* Quick Language Toggle in Login */}
            <button 
              onClick={() => setLang(prev => prev === 'es' ? 'en' : 'es')}
              className={styles.langBtn}
              style={{ marginTop: '25px' }}
            >
              {lang === 'es' ? '🇺🇸 Switch to English' : '🇪🇸 Cambiar a Español'}
            </button>
          </div>
        </div>
      ) : (
        
        // 2. MAIN DASHBOARD INTERFACE
        <>
          <div className={`${styles.mobileMenuOverlay} ${isSidebarOpen ? styles.active : ''}`} onClick={() => setIsSidebarOpen(false)} />
          {/* SIDEBAR NAVIGATION */}
          <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
            <div className={styles.sidebarHeader}>
              <Image 
                src="/maria.png" 
                alt="María Bonita" 
                width={120} 
                height={120} 
                style={{ objectFit: 'contain', marginBottom: '15px' }} 
                priority 
              />
              <h2 className={styles.sidebarBrand}>{text.sidebarTitle}</h2>
              <span className={styles.sidebarSub}>{text.sidebarSubtitle}</span>
            </div>
            
            <nav className={styles.sidebarMenu}>
              <button 
                className={`${styles.sidebarBtn} ${activeTab === 'overview' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <TrendingUp size={18} />
                {text.tabOverview}
              </button>
              
              <button 
                className={`${styles.sidebarBtn} ${activeTab === 'calendar' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                <CalendarIcon size={18} />
                {text.tabCalendar}
              </button>
              
              <button 
                className={`${styles.sidebarBtn} ${activeTab === 'table' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('table')}
              >
                <List size={18} />
                {text.tabList}
              </button>

              <button 
                className={`${styles.sidebarBtn} ${activeTab === 'qr' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('qr')}
              >
                <QrCode size={18} />
                Código QR
              </button>

              <button 
                className={`${styles.sidebarBtn} ${activeTab === 'reviews' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <Star size={18} />
                {lang === 'es' ? 'Reseñas y Comisiones' : 'Reviews & Commissions'}
              </button>

              <button 
                className={`${styles.sidebarBtn} ${activeTab === 'schedules' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('schedules')}
              >
                <Clock size={18} />
                {lang === 'es' ? 'Horarios' : 'Schedules'}
              </button>
            </nav>
            
            <div className={styles.sidebarFooter}>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={16} />
                {text.logout}
              </button>
            </div>
          </aside>
          
          {/* MAIN CONTENT PORTION */}
          <div className={styles.contentWrapper}>
            <header className={styles.mainHeader}>
              <div className={styles.headerTitleArea}>
                <button className={styles.mobileMenuBtn} onClick={() => setIsSidebarOpen(true)}>
                  <Menu size={24} />
                </button>
                <div>
                  <h1>{text.welcome}</h1>
                  <p>{text.subtitle}</p>
                </div>
              </div>
              
              <div className={styles.headerControls}>
                {/* Language Switch */}
                <button 
                  onClick={() => setLang(prev => prev === 'es' ? 'en' : 'es')}
                  className={styles.langBtn}
                >
                  {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
                </button>
                
                {/* Admin user label */}
                <div className={styles.adminInfo}>
                  <div className={styles.adminAvatar}>M</div>
                  <span>mariabarrientossalon@gmail.com</span>
                </div>
              </div>
            </header>
            
            <main className={styles.mainContent}>
              {loading && (
                <div className={styles.emptyState}>
                  <div style={{ border: '3px solid #e5d9b6', borderTopColor: '#9e8a30', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
                  <p>{text.loading}</p>
                  <style jsx global>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}</style>
                </div>
              )}

              {!loading && (
                <>
                  {/* TAB 1: OVERVIEW & STATISTICS */}
                  {activeTab === 'overview' && (
                    <div>
                      {/* Section 1: Salon Activity */}
                      <div className={styles.sectionHeading} style={{ marginTop: 0 }}>
                        <Sparkles size={18} />
                        {text.sectionSalon}
                      </div>

                      {/* Metric Cards Row */}
                      <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                          <div className={styles.statLeft}>
                            <span className={styles.statLabel}>{text.totalBookings}</span>
                            <span className={styles.statValue}>{totalCount}</span>
                          </div>
                          <div className={styles.statIconContainer}>
                            <List size={22} />
                          </div>
                        </div>

                        <div className={styles.statCard}>
                          <div className={styles.statLeft}>
                            <span className={styles.statLabel}>{text.estRevenue}</span>
                            <span className={styles.statValue} style={{ fontSize: '18px' }}>
                              {lang === 'es' ? 'Previa Valoración' : 'By Assessment'}
                            </span>
                          </div>
                          <div className={styles.statIconContainer}>
                            <Sparkles size={22} />
                          </div>
                        </div>

                        <div className={styles.statCard}>
                          <div className={styles.statLeft}>
                            <span className={styles.statLabel}>{text.busiestStaff}</span>
                            <span className={styles.statValue} style={{ fontSize: busiestStaff.length > 12 ? '18px' : '24px' }}>
                              {busiestStaff}
                            </span>
                          </div>
                          <div className={styles.statIconContainer}>
                            <User size={22} />
                          </div>
                        </div>

                        <div className={styles.statCard}>
                          <div className={styles.statLeft}>
                            <span className={styles.statLabel}>{text.topService}</span>
                            <span className={styles.statValue} style={{ fontSize: '15px', color: '#9e8a30', lineHeight: 1.2, marginTop: '8px' }}>
                              {topService}
                            </span>
                          </div>
                          <div className={styles.statIconContainer}>
                            <Sparkles size={22} />
                          </div>
                        </div>
                      </div>

                      {/* Charts and Distributions */}
                      <div className={styles.chartsLayout} style={{ marginBottom: '40px' }}>
                        {/* Service demand ranking */}
                        <div className={styles.chartCard}>
                          <h2>{text.servicesPopularity}</h2>
                          {sortedServices.length === 0 ? (
                            <div className={styles.emptyState} style={{ padding: '20px' }}>
                              <p>{text.noBookings}</p>
                            </div>
                          ) : (
                            <div className={styles.rankingList}>
                              {sortedServices.map(([svcName, count]) => {
                                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                                return (
                                  <div key={svcName} className={styles.rankingItem}>
                                    <div className={styles.rankingHeader}>
                                      <span className={styles.rankingName}>{svcName}</span>
                                      <span className={styles.rankingCount}>{count} ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className={styles.progressBarOuter}>
                                      <div 
                                        className={styles.progressBarInner} 
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Staff work distribution */}
                        <div className={styles.chartCard}>
                          <h2>{text.staffLoad}</h2>
                          {sortedStaff.length === 0 ? (
                            <div className={styles.emptyState} style={{ padding: '20px' }}>
                              <p>{text.noBookings}</p>
                            </div>
                          ) : (
                            <div className={styles.rankingList}>
                              {sortedStaff.map(([stName, count]) => {
                                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                                return (
                                  <div key={stName} className={styles.rankingItem}>
                                    <div className={styles.rankingHeader}>
                                      <span className={styles.rankingName}>{stName}</span>
                                      <span className={styles.rankingCount}>{count}</span>
                                    </div>
                                    <div className={styles.progressBarOuter}>
                                      <div 
                                        className={styles.progressBarInner} 
                                        style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #111111 0%, #9e8a30 100%)' }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 2: Website Visitors (Google Analytics 4) */}
                      <div className={styles.sectionHeading}>
                        <Globe size={18} />
                        {text.sectionVisitas}
                      </div>

                      {!configMissing && !trafficError && (
                        <div className={styles.analyticsControlBar} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafaf9', border: '1px solid #e5d9b6', borderRadius: '12px', padding: '12px 20px', marginBottom: '25px', gap: '15px' }}>
                          <div className={styles.presetButtons} style={{ display: 'flex', backgroundColor: '#f1f0ea', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                            <button 
                              className={`${styles.presetBtn} ${dateRangePreset === '7days' ? styles.presetBtnActive : ''}`}
                              style={{
                                background: dateRangePreset === '7days' ? '#ffffff' : 'transparent',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: dateRangePreset === '7days' ? '600' : '500',
                                color: dateRangePreset === '7days' ? '#1a73e8' : '#666666',
                                cursor: 'pointer',
                                boxShadow: dateRangePreset === '7days' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'
                              }}
                              onClick={() => setDateRangePreset('7days')}
                            >
                              {text.datePreset7}
                            </button>
                            <button 
                              className={`${styles.presetBtn} ${dateRangePreset === '30days' ? styles.presetBtnActive : ''}`}
                              style={{
                                background: dateRangePreset === '30days' ? '#ffffff' : 'transparent',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: dateRangePreset === '30days' ? '600' : '500',
                                color: dateRangePreset === '30days' ? '#1a73e8' : '#666666',
                                cursor: 'pointer',
                                boxShadow: dateRangePreset === '30days' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'
                              }}
                              onClick={() => setDateRangePreset('30days')}
                            >
                              {text.datePreset30}
                            </button>
                            <button 
                              className={`${styles.presetBtn} ${dateRangePreset === '90days' ? styles.presetBtnActive : ''}`}
                              style={{
                                background: dateRangePreset === '90days' ? '#ffffff' : 'transparent',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: dateRangePreset === '90days' ? '600' : '500',
                                color: dateRangePreset === '90days' ? '#1a73e8' : '#666666',
                                cursor: 'pointer',
                                boxShadow: dateRangePreset === '90days' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'
                              }}
                              onClick={() => setDateRangePreset('90days')}
                            >
                              {text.datePreset90}
                            </button>
                            <button 
                              className={`${styles.presetBtn} ${dateRangePreset === 'custom' ? styles.presetBtnActive : ''}`}
                              style={{
                                background: dateRangePreset === 'custom' ? '#ffffff' : 'transparent',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: dateRangePreset === 'custom' ? '600' : '500',
                                color: dateRangePreset === 'custom' ? '#1a73e8' : '#666666',
                                cursor: 'pointer',
                                boxShadow: dateRangePreset === 'custom' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'
                              }}
                              onClick={() => setDateRangePreset('custom')}
                            >
                              {text.datePresetCustom}
                            </button>
                          </div>

                          {dateRangePreset === 'custom' && (
                            <div className={styles.customDateForm} style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                              <div className={styles.dateField} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666666', fontWeight: 500 }}>{text.dateStartLabel}</label>
                                <input 
                                  type="date" 
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  className={styles.dateInput}
                                  style={{ border: '1px solid #e5d9b6', borderRadius: '6px', padding: '5px 8px', fontSize: '13px', backgroundColor: '#ffffff', color: '#111111', fontFamily: 'inherit' }}
                                />
                              </div>
                              <div className={styles.dateField} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666666', fontWeight: 500 }}>{text.dateEndLabel}</label>
                                <input 
                                  type="date" 
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  className={styles.dateInput}
                                  style={{ border: '1px solid #e5d9b6', borderRadius: '6px', padding: '5px 8px', fontSize: '13px', backgroundColor: '#ffffff', color: '#111111', fontFamily: 'inherit' }}
                                />
                              </div>
                              <button 
                                onClick={() => fetchTrafficData('custom', customStartDate, customEndDate)}
                                className={styles.applyDateBtn}
                                style={{ backgroundColor: '#111111', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                              >
                                {text.dateUpdateBtn}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {configMissing ? (
                        <div className={styles.setupAlert}>
                          <div className={styles.setupAlertTitle}>
                            <ShieldAlert size={20} />
                            {text.setupRequired}
                          </div>
                          <div className={styles.setupAlertContent}>
                            <p>{text.setupRequiredDesc}</p>
                            <ol className={styles.setupAlertSteps}>
                              {text.setupSteps.map((step: string, sIdx: number) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ) : trafficLoading ? (
                        <div className={styles.emptyState}>
                          <div style={{ border: '3px solid #e5d9b6', borderTopColor: '#9e8a30', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
                          <p>{lang === 'es' ? 'Cargando estadísticas de visitas...' : 'Loading visitor statistics...'}</p>
                        </div>
                      ) : trafficError ? (
                        <div className={styles.emptyState} style={{ color: '#ef4444' }}>
                          <ShieldAlert size={28} />
                          <p>{trafficError}</p>
                          <button 
                            onClick={() => fetchTrafficData()}
                            className={styles.langBtn} 
                            style={{ marginTop: '15px' }}
                          >
                            {lang === 'es' ? 'Reintentar' : 'Retry'}
                          </button>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const dailyViews = trafficData?.daily || [];
                            const isViewsHovered = hoveredIdx !== null && dailyViews[hoveredIdx];
                            const displayActiveUsers = isViewsHovered ? dailyViews[hoveredIdx].activeUsers : (trafficData?.totals?.activeUsers || 0);
                            const displayPageViews = isViewsHovered ? dailyViews[hoveredIdx].pageViews : (trafficData?.totals?.pageViews || 0);
                            const hoveredViewsDate = isViewsHovered ? new Date(dailyViews[hoveredIdx].date + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }) : '';

                            return (
                              <div className={styles.trafficGrid}>
                                <div className={styles.statCard}>
                                  <div className={styles.statLeft}>
                                    <span className={styles.statLabel}>
                                      {text.metricUniqueUsers}
                                      {isViewsHovered && <span className={styles.hoverDateIndicator} style={{ fontSize: '11px', color: '#888888', fontWeight: 'normal' }}> — {hoveredViewsDate}</span>}
                                    </span>
                                    <span className={styles.statValue}>
                                      {displayActiveUsers}
                                    </span>
                                  </div>
                                  <div className={styles.statIconContainer}>
                                    <User size={20} />
                                  </div>
                                </div>

                                <div className={styles.statCard}>
                                  <div className={styles.statLeft}>
                                    <span className={styles.statLabel}>
                                      {text.metricPageViews}
                                      {isViewsHovered && <span className={styles.hoverDateIndicator} style={{ fontSize: '11px', color: '#888888', fontWeight: 'normal' }}> — {hoveredViewsDate}</span>}
                                    </span>
                                    <span className={styles.statValue}>
                                      {displayPageViews}
                                    </span>
                                  </div>
                                  <div className={styles.statIconContainer}>
                                    <Eye size={20} />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {(() => {
                            const paddingLeft = 50;
                            const paddingRight = 30;
                            const paddingTop = 20;
                            const paddingBottom = 40;
                            const chartWidth = 900;
                            const chartHeight = 260;

                            const innerWidth = chartWidth - paddingLeft - paddingRight;
                            const innerHeight = chartHeight - paddingTop - paddingBottom;

                            const dailyViews = trafficData?.daily || [];
                            const maxViews = Math.max(...dailyViews.map((d: any) => d.pageViews), 10);

                            const getX = (index: number) => paddingLeft + (index * (innerWidth / Math.max(dailyViews.length - 1, 1)));
                            const getYViews = (val: number) => chartHeight - paddingBottom - ((val / maxViews) * innerHeight);

                            let viewsPath = "";
                            let viewsAreaPath = "";

                            if (dailyViews.length > 0) {
                              const pointsViews = dailyViews.map((d: any, idx: number) => ({ x: getX(idx), y: getYViews(d.pageViews) }));
                              viewsPath = getBezierPath(pointsViews);
                              viewsAreaPath = `${viewsPath} L ${getX(dailyViews.length - 1)},${chartHeight - paddingBottom} L ${getX(0)},${chartHeight - paddingBottom} Z`;
                            }

                            const gridLines = [0, 0.25, 0.5, 0.75, 1];

                            return (
                              <div className={styles.trafficChartCard}>
                                <div className={styles.chartHeader}>
                                  <h2>{lang === 'es' ? 'Vistas de Página Diarias' : 'Daily Page Views'}</h2>
                                  <div className={styles.chartLegend}>
                                    <div className={styles.legendItem}>
                                      <div className={styles.legendColor} style={{ backgroundColor: '#111111' }} />
                                      <span>{text.metricPageViews}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.chartHoverInfo}>
                                  {hoveredIdx !== null && dailyViews[hoveredIdx] ? (
                                    <div className={styles.hoverInfoContent}>
                                      <span className={styles.hoverValue}>
                                        {dailyViews[hoveredIdx].pageViews.toLocaleString()} {lang === 'es' ? 'vistas' : 'views'}
                                      </span>
                                      <span className={styles.hoverDivider}>•</span>
                                      <span className={styles.hoverValue} style={{ color: '#666666' }}>
                                        {dailyViews[hoveredIdx].activeUsers.toLocaleString()} {lang === 'es' ? 'visitantes' : 'visitors'}
                                      </span>
                                      <span className={styles.hoverDivider}>•</span>
                                      <span className={styles.hoverDate}>
                                        {new Date(dailyViews[hoveredIdx].date + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className={styles.hoverInfoPlaceholder}>&nbsp;</div>
                                  )}
                                </div>

                                <div className={styles.chartContainer}>
                                  {dailyViews.length === 0 ? (
                                    <div className={styles.emptyState}>
                                      <p>{lang === 'es' ? 'No hay suficientes datos para graficar.' : 'Not enough data to plot.'}</p>
                                    </div>
                                  ) : (
                                    <>
                                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{ display: 'block', minHeight: '260px' }} className={styles.chartSvg}>
                                        <defs>
                                          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#111111" stopOpacity="0.08" />
                                            <stop offset="100%" stopColor="#111111" stopOpacity="0.00" />
                                          </linearGradient>
                                        </defs>

                                        {gridLines.map((ratio) => {
                                          const y = paddingTop + ratio * innerHeight;
                                          const valueViews = Math.round(maxViews * (1 - ratio));
                                          return (
                                            <g key={`views-grid-${ratio}`}>
                                              <line
                                                x1={paddingLeft}
                                                y1={y}
                                                x2={chartWidth - paddingRight}
                                                y2={y}
                                                stroke="#f1f0ea"
                                                strokeWidth={1}
                                                className={styles.chartGridLine}
                                              />
                                              <text
                                                x={paddingLeft - 8}
                                                y={y + 4}
                                                textAnchor="end"
                                                className={styles.chartAxisText}
                                                style={{ fill: '#666666', fontWeight: 'bold', fontSize: '10px' }}
                                              >
                                                {valueViews}
                                              </text>
                                            </g>
                                          );
                                        })}

                                        {dailyViews.map((d: any, idx: number) => {
                                          if (idx % 5 !== 0 && idx !== dailyViews.length - 1) return null;
                                          const x = getX(idx);
                                          const dateObj = new Date(d.date + 'T00:00:00');
                                          const dayStr = dateObj.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' });
                                          return (
                                            <text
                                              key={`views-x-label-${idx}`}
                                              x={x}
                                              y={chartHeight - paddingBottom + 18}
                                              textAnchor="middle"
                                              className={styles.chartAxisText}
                                              style={{ fill: '#888888', fontSize: '10px' }}
                                            >
                                              {dayStr}
                                            </text>
                                          );
                                        })}

                                        <path d={viewsAreaPath} fill="url(#viewsGrad)" className={styles.chartAreaViews} />
                                        <path d={viewsPath} fill="none" stroke="#111111" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={styles.chartLineViews} />

                                        {hoveredIdx !== null && (
                                          <line
                                            x1={getX(hoveredIdx)}
                                            y1={paddingTop}
                                            x2={getX(hoveredIdx)}
                                            y2={chartHeight - paddingBottom}
                                            stroke="#e5d9b6"
                                            strokeWidth={1.5}
                                            strokeDasharray="4,4"
                                          />
                                        )}

                                        {dailyViews.map((d: any, idx: number) => (
                                          <circle
                                            key={`views-dot-${idx}`}
                                            cx={getX(idx)}
                                            cy={getYViews(d.pageViews)}
                                            r={hoveredIdx === idx ? 4.5 : 1.5}
                                            fill="#ffffff"
                                            stroke="#111111"
                                            strokeWidth={1.5}
                                            style={{ cursor: 'pointer' }}
                                            className={`${styles.chartDot} ${styles.chartDotViews}`}
                                          />
                                        ))}

                                        {dailyViews.map((d: any, idx: number) => {
                                          const xStart = idx === 0 ? paddingLeft : getX(idx) - (innerWidth / (dailyViews.length - 1)) / 2;
                                          const xWidth = innerWidth / (dailyViews.length - 1);
                                          return (
                                            <rect
                                              key={`views-hover-slice-${idx}`}
                                              x={xStart}
                                              y={paddingTop}
                                              width={xWidth}
                                              height={innerHeight}
                                              fill="transparent"
                                              style={{ cursor: 'pointer' }}
                                              onMouseEnter={() => setHoveredIdx(idx)}
                                              onMouseLeave={() => setHoveredIdx(null)}
                                            />
                                          );
                                        })}
                                      </svg>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Tables Grid */}
                          <div className={styles.trafficDetailsGrid} style={{ marginBottom: '40px' }}>
                            <div className={styles.chartCard} style={{ flexGrow: 1 }}>
                              <h2>{text.topPages}</h2>
                              {!trafficData?.pages || trafficData.pages.length === 0 ? (
                                <div className={styles.emptyState} style={{ padding: '20px' }}>
                                  <p>{lang === 'es' ? 'No hay páginas registradas.' : 'No pages recorded.'}</p>
                                </div>
                              ) : (
                                <div className={styles.rankingList}>
                                  {trafficData.pages.slice(0, 5).map((p: any, idx: number) => {
                                    const maxPageViews = Math.max(...trafficData.pages.map((o: any) => o.views), 1);
                                    const percentage = (p.views / maxPageViews) * 100;
                                    return (
                                      <div key={idx} className={styles.rankingItem}>
                                        <div className={styles.rankingHeader}>
                                          <span className={styles.rankingName} style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                            {p.path === '/' ? '/' : p.path}
                                          </span>
                                          <span className={styles.rankingCount}>{p.views}</span>
                                        </div>
                                        <div className={styles.progressBarOuter}>
                                          <div 
                                            className={styles.progressBarInner} 
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <div className={styles.chartCard}>
                              <h2>{text.deviceType}</h2>
                              {!trafficData?.devices || trafficData.devices.length === 0 ? (
                                <div className={styles.emptyState} style={{ padding: '10px' }}>
                                  <p>{lang === 'es' ? 'Sin datos de dispositivos.' : 'No device data.'}</p>
                                </div>
                              ) : (
                                <div className={styles.deviceBreakdownGrid}>
                                  {trafficData.devices.map((d: any, idx: number) => {
                                    const totalDeviceUsers = trafficData.devices.reduce((sum: number, item: any) => sum + item.users, 0) || 1;
                                    const pct = Math.round((d.users / totalDeviceUsers) * 100);
                                    return (
                                      <div key={idx} className={styles.deviceCard}>
                                        <span className={styles.deviceValue}>{pct}%</span>
                                        <span className={styles.deviceLabel}>
                                          {d.device === 'desktop' ? (lang === 'es' ? 'Escritorio' : 'Desktop') : 
                                           d.device === 'mobile' ? (lang === 'es' ? 'Móvil' : 'Mobile') : 
                                           d.device === 'tablet' ? 'Tablet' : d.device}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Section 3: Google Search Console */}
                      <div className={styles.sectionHeading}>
                        <TrendingUp size={18} />
                        {text.sectionGoogle}
                      </div>

                      {configMissing ? (
                        <div className={styles.setupAlert}>
                          <div className={styles.setupAlertTitle}>
                            <ShieldAlert size={20} />
                            {text.setupRequired}
                          </div>
                          <div className={styles.setupAlertContent}>
                            <p>{text.setupRequiredDesc}</p>
                          </div>
                        </div>
                      ) : trafficLoading ? (
                        <div className={styles.emptyState}>
                          <div style={{ border: '3px solid #e5d9b6', borderTopColor: '#9e8a30', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
                          <p>{lang === 'es' ? 'Cargando rendimiento de búsqueda...' : 'Loading search performance...'}</p>
                        </div>
                      ) : trafficError ? (
                        <div className={styles.emptyState} style={{ color: '#ef4444' }}>
                          <ShieldAlert size={28} />
                          <p>{trafficError}</p>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const dailySearch = searchData?.daily || [];
                            const isSearchHovered = hoveredSearchIdx !== null && dailySearch[hoveredSearchIdx];
                            const displayClicks = isSearchHovered ? dailySearch[hoveredSearchIdx].clicks : (searchData?.totals?.clicks || 0);
                            const displayImpressions = isSearchHovered ? dailySearch[hoveredSearchIdx].impressions : (searchData?.totals?.impressions || 0);
                            const displayCtr = isSearchHovered ? dailySearch[hoveredSearchIdx].ctr : (searchData?.totals?.ctr || 0);
                            const displayPosition = isSearchHovered ? dailySearch[hoveredSearchIdx].position : (searchData?.totals?.position || 0);
                            const hoveredSearchDate = isSearchHovered ? new Date(dailySearch[hoveredSearchIdx].date + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }) : '';

                            return (
                              <div className={styles.trafficGrid}>
                                <div className={styles.statCard}>
                                  <div className={styles.statLeft}>
                                    <span className={styles.statLabel}>
                                      {text.metricGoogleClicks}
                                      {isSearchHovered && <span className={styles.hoverDateIndicator} style={{ fontSize: '11px', color: '#888888', fontWeight: 'normal' }}> — {hoveredSearchDate}</span>}
                                    </span>
                                    <span className={styles.statValue}>
                                      {displayClicks}
                                    </span>
                                  </div>
                                  <div className={styles.statIconContainer}>
                                    <TrendingUp size={20} />
                                  </div>
                                </div>

                                <div className={styles.statCard}>
                                  <div className={styles.statLeft}>
                                    <span className={styles.statLabel}>
                                      {text.metricGoogleImpressions}
                                      {isSearchHovered && <span className={styles.hoverDateIndicator} style={{ fontSize: '11px', color: '#888888', fontWeight: 'normal' }}> — {hoveredSearchDate}</span>}
                                    </span>
                                    <span className={styles.statValue}>
                                      {displayImpressions}
                                    </span>
                                  </div>
                                  <div className={styles.statIconContainer}>
                                    <List size={20} />
                                  </div>
                                </div>

                                <div className={styles.statCard}>
                                  <div className={styles.statLeft}>
                                    <span className={styles.statLabel}>
                                      {text.metricGoogleCtr}
                                      {isSearchHovered && <span className={styles.hoverDateIndicator} style={{ fontSize: '11px', color: '#888888', fontWeight: 'normal' }}> — {hoveredSearchDate}</span>}
                                    </span>
                                    <span className={styles.statValue}>
                                      {displayCtr}%
                                    </span>
                                  </div>
                                  <div className={styles.statIconContainer}>
                                    <Sparkles size={20} />
                                  </div>
                                </div>

                                <div className={styles.statCard}>
                                  <div className={styles.statLeft}>
                                    <span className={styles.statLabel}>
                                      {text.metricGooglePosition}
                                      {isSearchHovered && <span className={styles.hoverDateIndicator} style={{ fontSize: '11px', color: '#888888', fontWeight: 'normal' }}> — {hoveredSearchDate}</span>}
                                    </span>
                                    <span className={styles.statValue}>
                                      {displayPosition}
                                    </span>
                                  </div>
                                  <div className={styles.statIconContainer}>
                                    <Clock size={20} />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Chart 2: Google Search Performance Chart (Dual-Axis Clicks & Impressions) */}
                          {(() => {
                            const paddingLeft = 50;
                            const paddingRight = 50;
                            const paddingTop = 20;
                            const paddingBottom = 40;
                            const chartWidth = 900;
                            const chartHeight = 260;

                            const innerWidth = chartWidth - paddingLeft - paddingRight;
                            const innerHeight = chartHeight - paddingTop - paddingBottom;

                            const dailySearch = searchData?.daily || [];
                            const maxClicks = Math.max(...dailySearch.map((d: any) => d.clicks), 10);
                            const maxImpressions = Math.max(...dailySearch.map((d: any) => d.impressions), 50);

                            const getX = (index: number) => paddingLeft + (index * (innerWidth / Math.max(dailySearch.length - 1, 1)));
                            const getYClicks = (val: number) => chartHeight - paddingBottom - ((val / maxClicks) * innerHeight);
                            const getYImpressions = (val: number) => chartHeight - paddingBottom - ((val / maxImpressions) * innerHeight);

                            let clicksPath = "";
                            let clicksAreaPath = "";
                            let impressionsPath = "";

                            if (dailySearch.length > 0) {
                              const pointsClicks = dailySearch.map((d: any, idx: number) => ({ x: getX(idx), y: getYClicks(d.clicks) }));
                              clicksPath = getBezierPath(pointsClicks);
                              clicksAreaPath = `${clicksPath} L ${getX(dailySearch.length - 1)},${chartHeight - paddingBottom} L ${getX(0)},${chartHeight - paddingBottom} Z`;

                              const pointsImps = dailySearch.map((d: any, idx: number) => ({ x: getX(idx), y: getYImpressions(d.impressions) }));
                              impressionsPath = getBezierPath(pointsImps);
                            }

                            const gridLines = [0, 0.25, 0.5, 0.75, 1];

                            return (
                              <div className={styles.trafficChartCard}>
                                <div className={styles.chartHeader}>
                                  <h2>{lang === 'es' ? 'Rendimiento en Búsquedas Diarias' : 'Daily Search Performance'}</h2>
                                  <div className={styles.chartLegend}>
                                    <div className={styles.legendItem}>
                                      <div className={styles.legendColor} style={{ backgroundColor: '#111111' }} />
                                      <span>{text.metricGoogleClicks}</span>
                                    </div>
                                    <div className={styles.legendItem}>
                                      <div className={styles.legendColor} style={{ backgroundColor: '#888888', border: '1px dashed #888888' }} />
                                      <span>{text.metricGoogleImpressions}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.chartHoverInfo}>
                                  {hoveredSearchIdx !== null && dailySearch[hoveredSearchIdx] ? (
                                    <div className={styles.hoverInfoContent}>
                                      <span className={styles.hoverValue} style={{ color: '#111111' }}>
                                        {dailySearch[hoveredSearchIdx].clicks} {lang === 'es' ? 'clics' : 'clicks'}
                                      </span>
                                      <span className={styles.hoverDivider}>•</span>
                                      <span className={styles.hoverValue} style={{ color: '#666666' }}>
                                        {dailySearch[hoveredSearchIdx].impressions} {lang === 'es' ? 'impresiones' : 'impressions'}
                                      </span>
                                      <span className={styles.hoverDivider}>•</span>
                                      <span className={styles.hoverValue} style={{ color: '#888888' }}>
                                        {dailySearch[hoveredSearchIdx].ctr.toFixed(1)}% CTR
                                      </span>
                                      <span className={styles.hoverDivider}>•</span>
                                      <span className={styles.hoverDate}>
                                        {new Date(dailySearch[hoveredSearchIdx].date + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className={styles.hoverInfoPlaceholder}>&nbsp;</div>
                                  )}
                                </div>

                                <div className={styles.chartContainer}>
                                  {dailySearch.length === 0 ? (
                                    <div className={styles.emptyState}>
                                      <p>{lang === 'es' ? 'No hay suficientes datos para graficar.' : 'Not enough data to plot.'}</p>
                                    </div>
                                  ) : (
                                    <>
                                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{ display: 'block', minHeight: '260px' }} className={styles.chartSvg}>
                                        <defs>
                                          <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#111111" stopOpacity="0.05" />
                                            <stop offset="100%" stopColor="#111111" stopOpacity="0.00" />
                                          </linearGradient>
                                        </defs>

                                        {gridLines.map((ratio) => {
                                          const y = paddingTop + ratio * innerHeight;
                                          const valueClicks = Math.round(maxClicks * (1 - ratio));
                                          const valueImps = Math.round(maxImpressions * (1 - ratio));
                                          return (
                                            <g key={`search-grid-${ratio}`}>
                                              <line
                                                x1={paddingLeft}
                                                y1={y}
                                                x2={chartWidth - paddingRight}
                                                y2={y}
                                                stroke="#f1f0ea"
                                                strokeWidth={1}
                                                className={styles.chartGridLine}
                                              />
                                              <text
                                                x={paddingLeft - 8}
                                                y={y + 4}
                                                textAnchor="end"
                                                className={styles.chartAxisText}
                                                style={{ fill: '#666666', fontWeight: 'bold', fontSize: '10px' }}
                                              >
                                                {valueClicks}
                                              </text>
                                              <text
                                                x={chartWidth - paddingRight + 8}
                                                y={y + 4}
                                                textAnchor="start"
                                                className={styles.chartAxisText}
                                                style={{ fill: '#888888', fontWeight: 'bold', fontSize: '10px' }}
                                              >
                                                {valueImps}
                                              </text>
                                            </g>
                                          );
                                        })}

                                        {dailySearch.map((d: any, idx: number) => {
                                          if (idx % 5 !== 0 && idx !== dailySearch.length - 1) return null;
                                          const x = getX(idx);
                                          const dateObj = new Date(d.date + 'T00:00:00');
                                          const dayStr = dateObj.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' });
                                          return (
                                            <text
                                              key={`search-x-label-${idx}`}
                                              x={x}
                                              y={chartHeight - paddingBottom + 18}
                                              textAnchor="middle"
                                              className={styles.chartAxisText}
                                              style={{ fill: '#888888', fontSize: '10px' }}
                                            >
                                              {dayStr}
                                            </text>
                                          );
                                        })}

                                        <path d={clicksAreaPath} fill="url(#clicksGrad)" className={styles.chartAreaClicks} />
                                        <path d={clicksPath} fill="none" stroke="#111111" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={styles.chartLineClicks} />
                                        <path d={impressionsPath} fill="none" stroke="#888888" strokeWidth={1} strokeDasharray="3,3" />

                                        {hoveredSearchIdx !== null && (
                                          <line
                                            x1={getX(hoveredSearchIdx)}
                                            y1={paddingTop}
                                            x2={getX(hoveredSearchIdx)}
                                            y2={chartHeight - paddingBottom}
                                            stroke="#e5d9b6"
                                            strokeWidth={1.5}
                                            strokeDasharray="4,4"
                                          />
                                        )}

                                        {dailySearch.map((d: any, idx: number) => (
                                          <circle
                                            key={`clicks-dot-${idx}`}
                                            cx={getX(idx)}
                                            cy={getYClicks(d.clicks)}
                                            r={hoveredSearchIdx === idx ? 4.5 : 1.5}
                                            fill="#ffffff"
                                            stroke="#111111"
                                            strokeWidth={1.5}
                                            style={{ cursor: 'pointer' }}
                                            className={`${styles.chartDot} ${styles.chartDotClicks}`}
                                          />
                                        ))}

                                        {dailySearch.map((d: any, idx: number) => {
                                          const xStart = idx === 0 ? paddingLeft : getX(idx) - (innerWidth / (dailySearch.length - 1)) / 2;
                                          const xWidth = innerWidth / (dailySearch.length - 1);
                                          return (
                                            <rect
                                              key={`search-hover-slice-${idx}`}
                                              x={xStart}
                                              y={paddingTop}
                                              width={xWidth}
                                              height={innerHeight}
                                              fill="transparent"
                                              style={{ cursor: 'pointer' }}
                                              onMouseEnter={() => setHoveredSearchIdx(idx)}
                                              onMouseLeave={() => setHoveredSearchIdx(null)}
                                            />
                                          );
                                        })}
                                      </svg>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Top Queries Table */}
                          <div className={styles.trafficDetailsGrid}>
                            <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
                              <h2>{text.topQueries}</h2>
                              {!searchData?.queries || searchData.queries.length === 0 ? (
                                <div className={styles.emptyState} style={{ padding: '20px' }}>
                                  <p>{lang === 'es' ? 'No hay búsquedas registradas.' : 'No queries recorded.'}</p>
                                </div>
                              ) : (
                                <div className={styles.tableWrapper}>
                                  <table className={styles.bookingsTable} style={{ fontSize: '13px' }}>
                                    <thead>
                                      <tr>
                                        <th>{text.queriesColKeyword}</th>
                                        <th style={{ textAlign: 'right' }}>{text.queriesColClicks}</th>
                                        <th style={{ textAlign: 'right' }}>{text.queriesColImpressions}</th>
                                        <th style={{ textAlign: 'right' }}>{text.queriesColCtr}</th>
                                        <th style={{ textAlign: 'right' }}>{text.queriesColPosition}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {searchData.queries.map((q: any, idx: number) => (
                                        <tr key={idx} style={{ cursor: 'default' }}>
                                          <td style={{ fontWeight: '600' }}>{q.keyword}</td>
                                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#4285f4' }}>{q.clicks}</td>
                                          <td style={{ textAlign: 'right', color: '#666' }}>{q.impressions}</td>
                                          <td style={{ textAlign: 'right', color: '#666' }}>{q.ctr.toFixed(1)}%</td>
                                          <td style={{ textAlign: 'right', color: '#666' }}>{q.position}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* TAB 2: INTERACTIVE CALENDAR */}
                  {activeTab === 'calendar' && (
                    <div className={styles.calendarLayout}>
                      {/* Left: Monthly Calendar grid */}
                      <div className={styles.calendarCard}>
                        <div className={styles.calendarNav}>
                          <h2 className={styles.calendarMonthName}>
                            {text.months[cMonth]} {cYear}
                          </h2>
                          <div className={styles.monthNavBtns}>
                            <button onClick={handlePrevMonth} className={styles.navArrowBtn}><ChevronLeft size={16} /></button>
                            <button onClick={handleNextMonth} className={styles.navArrowBtn}><ChevronRight size={16} /></button>
                          </div>
                        </div>

                        {/* Weekday labels */}
                        <div className={styles.weekdaysHeader}>
                          {text.weekdays.map(d => (
                            <div key={d} className={styles.weekdayLabel}>{d}</div>
                          ))}
                        </div>

                        {/* Grid Days */}
                        <div className={styles.daysGrid}>
                          {calendarDaysList.map((dayItem, idx) => {
                            if (!dayItem.date) {
                              return <div key={`empty-${idx}`} className={styles.disabledDay} />;
                            }

                            const isSelected = selectedDate && selectedDate.toDateString() === dayItem.date.toDateString();
                            const isToday = new Date().toDateString() === dayItem.date.toDateString();
                            const dayBookings = getBookingsForDay(dayItem.date);

                            return (
                              <div
                                key={`day-${idx}`}
                                className={`${styles.dayCell} ${isSelected ? styles.selectedDayCell : ''} ${isToday ? styles.todayCell : ''}`}
                                onClick={() => setSelectedDate(dayItem.date as Date)}
                              >
                                <span className={styles.dayNumber}>{dayItem.date.getDate()}</span>
                                
                                {/* Indicators for appointments on this day */}
                                {dayBookings.length > 0 && (
                                  <div className={styles.dayIndicators}>
                                    {dayBookings.length <= 3 ? (
                                      dayBookings.map((_, dotIdx) => (
                                        <div key={dotIdx} className={styles.indicatorDot} />
                                      ))
                                    ) : (
                                      <span className={styles.indicatorDotCount}>+{dayBookings.length}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Sidebar: Selected Day Details list */}
                      <div className={styles.dayPanel}>
                        <h2 className={styles.dayPanelTitle}>{text.selectDay}</h2>
                        <p className={styles.dayPanelSubtitle}>
                          {selectedDate ? selectedDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : ''}
                        </p>

                        <div className={styles.appointmentsTimelineList}>
                          {selectedDayBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                              <CalendarIcon size={28} />
                              <p>{text.noAppointmentsDay}</p>
                            </div>
                          ) : (
                            selectedDayBookings.map(b => {
                              // Estimated sum
                              const priceSum = b.services?.reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;
                              return (
                                <div 
                                  key={b.id} 
                                  className={styles.timelineCard}
                                  onClick={() => setSelectedBooking(b)}
                                >
                                  <div>
                                    <div className={styles.timelineTime}>{b.time_str}</div>
                                    <div className={styles.timelineClient}>{b.client_name}</div>
                                    <div className={styles.timelineStaff}>
                                      <User size={11} /> {b.staff_name}
                                    </div>
                                  </div>
                                  
                                  <div style={{ textAlign: 'right' }}>
                                    <div className={styles.timelinePrice}>
                                      {lang === 'es' ? 'Valoración' : 'Assessment'}
                                    </div>
                                    <div className={styles.timelineDuration}>
                                      {formatDuration(b.total_duration)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: BOOKINGS TABLE & SEARCH */}
                  {activeTab === 'table' && (
                    <div className={styles.tableCard}>
                      <div className={styles.tableFilters}>
                        <div className={styles.searchBox}>
                          <Search size={16} className={styles.searchIcon} />
                          <input 
                            type="text"
                            placeholder={text.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                          />
                        </div>
                        
                        <select 
                          value={staffFilter}
                          onChange={(e) => setStaffFilter(e.target.value)}
                          className={styles.filterSelect}
                        >
                          <option value="all">{text.filterStaff}</option>
                          <option value="brenda">Brenda</option>
                          <option value="edith">Edith</option>
                          <option value="maria">María</option>
                          <option value="miembro">Cualquier Miembro / Any Staff</option>
                        </select>
                      </div>

                      {/* Bookings Data Table */}
                      <div className={styles.tableWrapper}>
                        {filteredBookings.length === 0 ? (
                          <div className={styles.emptyState}>
                            <List size={28} />
                            <p>{text.noBookings}</p>
                          </div>
                        ) : (
                          <table className={styles.bookingsTable}>
                            <thead>
                              <tr>
                                <th>{text.colRef}</th>
                                <th>{text.colClient}</th>
                                <th>{text.colDate}</th>
                                <th>{text.colServices}</th>
                                <th>{text.colStaff}</th>
                                <th>{text.colReminders}</th>
                                <th>{text.colActions}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBookings.map(b => {
                                return (
                                  <tr key={b.id} onClick={() => setSelectedBooking(b)}>
                                    <td><span className={styles.refCodeBadge}>{b.ref_code}</span></td>
                                    <td>
                                      <div style={{ fontWeight: 'bold', color: '#111' }}>{b.client_name}</div>
                                      <div style={{ fontSize: '11px', color: '#666' }}>{b.client_phone}</div>
                                    </td>
                                    <td>
                                      <div>{b.date_str}</div>
                                      <div style={{ fontSize: '12px', color: '#9e8a30', fontWeight: '600', marginTop: '2px' }}>
                                        {b.time_str}
                                      </div>
                                    </td>
                                    <td>
                                      <div className={styles.servicePills}>
                                        {b.services?.map((s, sIdx) => (
                                          <span key={sIdx} className={styles.servicePill}>{s.title}</span>
                                        ))}
                                      </div>
                                    </td>
                                    <td>{b.staff_name}</td>
                                    <td>
                                      {b.morning_reminder_sent || b.hour_reminder_sent ? (
                                        <span className={styles.reminderSentBadge}>
                                          <Check size={11} /> {text.valRemindersSent}
                                        </span>
                                      ) : (
                                        <span className={styles.reminderPendingBadge}>
                                          {text.valRemindersPending}
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      <div className={styles.actionCell} onClick={(e) => e.stopPropagation()}>
                                        <button 
                                          onClick={() => handleCancelBooking(b.id)}
                                          className={styles.cancelActionBtn}
                                          title={text.btnCancelAppointment}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'qr' && (
                <div className={styles.mainContent}>
                  <div className={styles.qrCard}>
                    <h2 className={styles.qrTitle}>Sistema de Reseñas</h2>
                    <p className={styles.qrSubtitle}>
                      Pide a tus clientas que escaneen este código al terminar su servicio. 
                      Si la experiencia fue excelente, se les enviará a calificar en Google Maps. 
                      Si hubo algún problema, el comentario nos llegará de manera privada.
                    </p>
                    
                    <div className={styles.qrImageContainer}>
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://mariabonitabeautysalon.com/feedback" 
                        alt="Código QR de Reseñas" 
                      />
                    </div>

                    <a 
                      href="https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=https://mariabonitabeautysalon.com/feedback" 
                      download="MariaBonita_QR.png"
                      target="_blank"
                      className={styles.downloadBtn}
                      rel="noreferrer"
                    >
                      <Download size={18} />
                      Descargar QR para Imprimir
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 5: REVIEWS & COMMISSIONS */}
              {activeTab === 'reviews' && (
                <div className={styles.reviewsContainer}>
                  <div className={styles.sectionHeading} style={{ marginTop: 0, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={18} />
                      {lang === 'es' ? 'Reseñas y Comisiones' : 'Reviews & Commissions'}
                    </div>
                    <div className={styles.filterGroup} style={{ margin: 0 }}>
                      <select 
                        className={styles.filterSelect}
                        value={reviewsFilter}
                        onChange={(e) => setReviewsFilter(e.target.value as any)}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '14px', 
                          fontWeight: 'bold', 
                          minWidth: '160px', 
                          backgroundColor: '#f5cd51', 
                          color: '#0b0906', 
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="all">{lang === 'es' ? 'Histórico Total' : 'All Time'}</option>
                        <option value="today">{lang === 'es' ? 'Hoy' : 'Today'}</option>
                        <option value="week">{lang === 'es' ? 'Últimos 7 días' : 'Last 7 Days'}</option>
                        <option value="month">{lang === 'es' ? 'Último mes' : 'Last Month'}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.statsGrid}>
                    {(() => {
                      const approvedReviews = filteredStaffReviews.filter(r => r.status === 'approved');
                      const pendingReviews = filteredStaffReviews.filter(r => r.status === 'pending');
                      const approvedCount = approvedReviews.length;
                      const pendingCount = pendingReviews.length;
                      
                      const staffReviewCounts: Record<string, { approved: number, pending: number }> = {};
                      filteredStaffReviews.forEach(r => {
                        const sName = r.staff_name || 'Desconocido';
                        if (!staffReviewCounts[sName]) {
                          staffReviewCounts[sName] = { approved: 0, pending: 0 };
                        }
                        if (r.status === 'approved') staffReviewCounts[sName].approved++;
                        if (r.status === 'pending') staffReviewCounts[sName].pending++;
                      });

                      const today = new Date().toISOString().split('T')[0];
                      const todayReviews = filteredStaffReviews.filter(r => r.created_at.startsWith(today)).length;
                      
                      return (
                        <>
                          <div className={styles.statCard}>
                            <div className={styles.statLeft}>
                              <span className={styles.statLabel}>{lang === 'es' ? 'Reseñas Pendientes' : 'Pending Reviews'}</span>
                              <span className={styles.statValue} style={{ color: '#f59e0b' }}>{pendingCount}</span>
                            </div>
                            <div className={styles.statIconContainer}>
                              <AlertCircle size={22} color="#f59e0b" />
                            </div>
                          </div>
                          
                          <div className={styles.statCard}>
                            <div className={styles.statLeft}>
                              <span className={styles.statLabel}>{lang === 'es' ? 'Reseñas Aprobadas' : 'Approved Reviews'}</span>
                              <span className={styles.statValue}>{approvedCount}</span>
                            </div>
                            <div className={styles.statIconContainer}>
                              <Star size={22} />
                            </div>
                          </div>

                          <div className={styles.statCard}>
                            <div className={styles.statLeft}>
                              <span className={styles.statLabel}>{lang === 'es' ? 'Comisiones Generadas' : 'Total Commissions'}</span>
                              <span className={styles.statValue} style={{ color: '#2e7d32' }}>${approvedCount * 2}</span>
                            </div>
                            <div className={styles.statIconContainer}>
                              <DollarSign size={22} />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className={styles.chartCard} style={{ marginTop: '30px' }}>
                    <h2>{lang === 'es' ? 'Desglose por Estilista' : 'Staff Breakdown'}</h2>
                    {filteredStaffReviews.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p>{lang === 'es' ? 'No hay reseñas registradas para este periodo.' : 'No reviews recorded for this period.'}</p>
                      </div>
                    ) : (
                      <div className={styles.rankingList}>
                        {(() => {
                          const staffReviewCounts: Record<string, { approved: number, pending: number }> = {};
                          filteredStaffReviews.forEach(r => {
                            const sName = r.staff_name || 'Desconocido';
                            if (!staffReviewCounts[sName]) {
                              staffReviewCounts[sName] = { approved: 0, pending: 0 };
                            }
                            if (r.status === 'approved') staffReviewCounts[sName].approved++;
                            if (r.status === 'pending') staffReviewCounts[sName].pending++;
                          });
                          
                          const sortedStaffReviews = Object.entries(staffReviewCounts).sort((a, b) => b[1].approved - a[1].approved);
                          
                          return sortedStaffReviews.map(([sName, counts]) => {
                            const staffSpecificReviews = filteredStaffReviews.filter(r => (r.staff_name || 'Desconocido') === sName);
                            
                            return (
                              <div key={sName} className={styles.rankingItem} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', flexDirection: 'column', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: staffSpecificReviews.length > 0 ? '16px' : '0' }}>
                                  <div className={styles.rankingHeader} style={{ flex: 1 }}>
                                    <span className={styles.rankingName} style={{ fontSize: '1.1rem', fontWeight: 500 }}>{sName}</span>
                                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                      <span style={{ color: '#f59e0b', marginRight: '10px' }}>{counts.pending} en espera</span>
                                      <span>{counts.approved} aprobadas</span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '18px', color: '#2e7d32', fontWeight: 700 }}>+ ${counts.approved * 2}</span>
                                    <div style={{ fontSize: '12px', color: '#999' }}>Comisión Real</div>
                                  </div>
                                </div>

                                {staffSpecificReviews.length > 0 && (
                                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {staffSpecificReviews.map((review, idx) => (
                                      <div key={review.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingBottom: idx !== staffSpecificReviews.length - 1 ? '8px' : '0', borderBottom: idx !== staffSpecificReviews.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                        <div>
                                          <div style={{ fontWeight: 600, color: '#334155' }}>
                                            {review.author_name ? review.author_name : (lang === 'es' ? 'Cliente Anónimo' : 'Anonymous Client')}
                                          </div>
                                          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                                            {new Date(review.created_at).toLocaleDateString()} {new Date(review.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </div>
                                        </div>
                                        <div>
                                          {review.status === 'approved' ? (
                                            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                              {lang === 'es' ? 'Aprobada (+$2)' : 'Approved (+$2)'}
                                            </span>
                                          ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                                {lang === 'es' ? 'En espera' : 'Pending'}
                                              </span>
                                              <button 
                                                onClick={() => handleApproveReview(review.id)}
                                                style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                title={lang === 'es' ? 'Aprobar manualmente' : 'Manually approve'}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                                              >
                                                <Check size={12} color="#16a34a" /> {lang === 'es' ? 'Aprobar' : 'Approve'}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SCHEDULES */}
              {activeTab === 'schedules' && (
                <div style={{ marginTop: '20px' }}>
                  <SchedulesManager 
                    lang={lang}
                    supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
                    supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}
                    schedules={schedules}
                    staffList={salonStaff}
                    onSchedulesUpdated={() => { fetchSchedules(); fetchSalonStaff(); }}
                  />
                </div>
              )}
            </main>
          </div>
          
          {/* APPOINTMENT DETAILED MODAL */}
          {selectedBooking && (
            <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalHeaderTitle}>
                    <h2>{text.detailTitle}</h2>
                    <p>{selectedBooking.ref_code}</p>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className={styles.modalCloseBtn}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className={styles.modalBody}>
                  {/* Customer Block */}
                  <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>{text.detailCustomer}</div>
                    <div className={styles.detailClientCard}>
                      <div className={styles.clientCardRow}>
                        <User size={16} className={styles.clientCardIcon} />
                        <strong>{selectedBooking.client_name}</strong>
                      </div>
                      <div className={styles.clientCardRow}>
                        <Phone size={16} className={styles.clientCardIcon} />
                        <span>{selectedBooking.client_phone}</span>
                      </div>
                      <div className={styles.clientCardRow}>
                        <Mail size={16} className={styles.clientCardIcon} />
                        <span>{selectedBooking.client_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Metadata Block */}
                  <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>{text.detailBooking}</div>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{lang === 'es' ? 'Fecha:' : 'Date:'}</span>
                        <span className={styles.detailValue}>{selectedBooking.date_str}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{lang === 'es' ? 'Hora:' : 'Time:'}</span>
                        <span className={styles.detailValue} style={{ color: '#9e8a30' }}>{selectedBooking.time_str}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{lang === 'es' ? 'Estilista:' : 'Staff:'}</span>
                        <span className={styles.detailValue}>{selectedBooking.staff_name}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{text.lblDuration}</span>
                        <span className={styles.detailValue}>{formatDuration(selectedBooking.total_duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Services Block */}
                  <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>{text.detailServices}</div>
                    <div className={styles.modalServicesList}>
                      {selectedBooking.services?.map((s, idx) => (
                        <div key={idx} className={styles.modalServiceItem}>
                          <div>
                            <strong>{s.title}</strong>
                            <div className={styles.modalServiceMeta}>{s.durationMin} min</div>
                          </div>
                          <span style={{ fontWeight: 'bold' }}>
                            {lang === 'es' ? 'Valoración' : 'Assessment'}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.modalTotalRow}>
                      <span>{lang === 'es' ? 'Precio:' : 'Pricing:'}</span>
                      <span>
                        {lang === 'es' ? 'Bajo valoración' : 'Based on assessment'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Created timestamp */}
                  <div style={{ fontSize: '11px', color: '#888888', marginTop: '10px', textAlign: 'center' }}>
                    {text.lblCreated} {new Date(selectedBooking.created_at || '').toLocaleString()}
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button 
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className={styles.modalCancelBtn}
                  >
                    <Trash2 size={14} />
                    {text.btnCancelAppointment}
                  </button>
                  
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className={styles.modalDismissBtn}
                  >
                    {text.btnDismiss}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
