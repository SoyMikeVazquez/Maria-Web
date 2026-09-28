'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Check, 
  ArrowRight, 
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import styles from './BookingScheduler.module.css';
const parseTimeToMinutes = (timeStr: string): number => {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  
  if (ampm) {
    const ampmUpper = ampm.toUpperCase();
    if (ampmUpper === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampmUpper === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes: number): string => {
  let hour = Math.floor(minutes / 60);
  const min = minutes % 60;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) {
    hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }
  const displayMin = min.toString().padStart(2, '0');
  return `${hour}:${displayMin} ${ampm}`;
};

const formatDuration = (mins: number, lang: 'en' | 'es'): string => {
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  
  if (remainingMins === 0) {
    if (hours === 1) {
      return lang === 'es' ? '1 hora' : '1 hour';
    }
    return lang === 'es' ? `${hours} horas` : `${hours} hours`;
  } else {
    if (hours === 1) {
      return lang === 'es' ? `1 hora ${remainingMins} min` : `1 hour ${remainingMins} min`;
    }
    return lang === 'es' ? `${hours} horas ${remainingMins} min` : `${hours} hours ${remainingMins} min`;
  }
};

interface Service {
  id: string;
  category: 'hair' | 'makeup_face' | 'lashes_brows' | 'spa' | 'nails';
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  price: number;
  durationMin: number;
  img?: string;
}

const SERVICES_DATA: Service[] = [
  // Hair
  {
    id: 'hair-1',
    category: 'hair',
    titleEn: 'Hairstyles and Blowouts',
    titleEs: 'Peinados y Secados',
    descEn: 'Let us bring your dream hair to life. Sleek, defined curls or voluminous waves.',
    descEs: 'Permítenos hacer realidad el cabello de tus sueños. Rizos definidos o ondas voluminosas.',
    price: 0,
    durationMin: 40,
  },
  {
    id: 'hair-2',
    category: 'hair',
    titleEn: 'Hair Bleaching',
    titleEs: 'Decoloración de Cabello',
    descEn: 'Stunning color change treated with the utmost care and precision to ensure healthy results.',
    descEs: 'Cambio de color espectacular tratado con el mayor cuidado y precisión para un cabello sano.',
    price: 0,
    durationMin: 55,
  },
  {
    id: 'hair-3',
    category: 'hair',
    titleEn: 'Bellami Hair Extensions',
    titleEs: 'Extensiones de Cabello Bellami',
    descEn: 'Certified luxury extensions. Premium hair blending seamlessly for length and volume.',
    descEs: 'Extensiones de lujo certificadas. Cabello premium integrado para longitud y volumen.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'hair-4',
    category: 'hair',
    titleEn: 'Smoothing Treatments',
    titleEs: 'Tratamientos de Alisado',
    descEn: 'Deep renewal and freshness leaving hair soft, shiny, silky, and easy to manage.',
    descEs: 'Renovación profunda que deja el cabello suave, brillante, sedoso y fácil de manejar.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'hair-women',
    category: 'hair',
    titleEn: "Women's Haircut",
    titleEs: 'Corte de Dama',
    descEn: 'Custom cut designed to enhance your profile, style, and presentation.',
    descEs: 'Corte personalizado diseñado para mejorar tu perfil, estilo y presentación.',
    price: 0,
    durationMin: 40,
  },
  {
    id: 'hair-men',
    category: 'hair',
    titleEn: "Men's Haircut",
    titleEs: 'Corte de Caballero',
    descEn: 'Custom cut designed to enhance your profile, style, and presentation.',
    descEs: 'Corte personalizado diseñado para mejorar tu perfil, estilo y presentación.',
    price: 0,
    durationMin: 40,
  },
  // Makeup & Face
  {
    id: 'makeup-1',
    category: 'makeup_face',
    titleEn: 'Professional Makeup',
    titleEs: 'Maquillaje Profesional',
    descEn: 'Premium makeup designs that will make you look stunning for any event.',
    descEs: 'Diseños de maquillaje premium que te harán lucir impresionante para cualquier evento.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'makeup-2',
    category: 'makeup_face',
    titleEn: 'Full Facial Service',
    titleEs: 'Servicio Facial Completo',
    descEn: 'Nourishing facial treatments using top-tier products to protect and refresh your skin.',
    descEs: 'Tratamientos faciales nutritivos con productos de primer nivel para proteger y refrescar la piel.',
    price: 0,
    durationMin: 30,
  },
  // Lashes & Brows
  {
    id: 'lashes-1',
    category: 'lashes_brows',
    titleEn: 'Eyelash Design',
    titleEs: 'Diseño de Pestañas',
    descEn: 'Beautiful eyelash designs framing your eyes for a bold, dramatic, or natural look.',
    descEs: 'Diseños hermosos que enmarcan tus ojos para un aspecto audaz, dramático o natural.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'lashes-2',
    category: 'lashes_brows',
    titleEn: 'Eyebrow Design',
    titleEs: 'Diseño de Cejas',
    descEn: 'Crafting the perfect brow shape to frame your face. Every detail counts.',
    descEs: 'Creación de la forma de ceja perfecta para enmarcar tu rostro. Cada detalle cuenta.',
    price: 0,
    durationMin: 30,
  },
  // Spa
  {
    id: 'spa-1',
    category: 'spa',
    titleEn: 'Relaxing Massage (Deep Tissue/Swedish)',
    titleEs: 'Masaje Relajante (Tejido Profundo/Sueco)',
    descEn: 'Unwind with our full body therapeutic massage designed to melt stress away.',
    descEs: 'Relájate con nuestro masaje terapéutico corporal diseñado para eliminar el estrés.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'spa-2',
    category: 'spa',
    titleEn: 'Rejuvenating Facial Treatment',
    titleEs: 'Tratamiento Facial Rejuvenecedor',
    descEn: 'Anti-aging therapies combined with deep cleansing and hydration.',
    descEs: 'Terapias antienvejecimiento combinadas con limpieza profunda e hidratación.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'spa-3',
    category: 'spa',
    titleEn: 'Aromatherapy & Holistic Care',
    titleEs: 'Aromaterapia y Cuidado Holístico',
    descEn: 'Essential oils paired with targeted pressure points to balance body and mind.',
    descEs: 'Aceites esenciales combinados con puntos de presión para equilibrar cuerpo y mente.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'spa-4',
    category: 'spa',
    titleEn: 'Aesthetic Treatment & Skincare',
    titleEs: 'Tratamiento Estético y Cuidado de la Piel',
    descEn: 'Advanced skin exfoliation and serums to restore natural vitality.',
    descEs: 'Exfoliación avanzada y sueros para restaurar la vitalidad natural de tu piel.',
    price: 0,
    durationMin: 30,
  },
  // Nail Spa
  {
    id: 'nail-mani-express',
    category: 'nails',
    titleEn: 'Manicure Express',
    titleEs: 'Manicure Express',
    descEn: 'Nail cleaning, trimming, shaping, cuticle care, and regular polish.',
    descEs: 'Limpieza de uñas, corte, limado, cuidado de cutícula y esmalte regular.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'nail-mani-sig',
    category: 'nails',
    titleEn: 'Signature Manicure',
    titleEs: 'Signature Manicure',
    descEn: 'All Express care + hand exfoliation, hydrating massage, and hot towel.',
    descEs: 'Todo lo anterior + exfoliación de manos, masaje hidratante y toalla caliente.',
    price: 0,
    durationMin: 45,
  },
  {
    id: 'nail-mani-gel',
    category: 'nails',
    titleEn: 'Gel Manicure',
    titleEs: 'Gel Manicure',
    descEn: 'Full manicure with long-lasting gel polish application.',
    descEs: 'Manicure completa con aplicación de gel polish de larga duración.',
    price: 0,
    durationMin: 45,
  },
  {
    id: 'nail-mani-luxury',
    category: 'nails',
    titleEn: 'Luxury Gel Manicure',
    titleEs: 'Luxury Gel Manicure',
    descEn: 'Gel manicure + exfoliation, hydrating mask, hot towels, and relaxing massage.',
    descEs: 'Gel manicure + exfoliación, mascarilla hidratante, toallas calientes y masaje relajante.',
    price: 0,
    durationMin: 60,
  },
  {
    id: 'nail-pedi-express',
    category: 'nails',
    titleEn: 'Pedicure Express',
    titleEs: 'Pedicure Express',
    descEn: 'Foot soak, nail trimming & shaping, cuticle care, and regular polish.',
    descEs: 'Remojo, corte y limado, cuidado de cutícula y esmalte regular.',
    price: 0,
    durationMin: 30,
  },
  {
    id: 'nail-pedi-sig',
    category: 'nails',
    titleEn: 'Signature Pedicure',
    titleEs: 'Signature Pedicure',
    descEn: 'Full pedicure + scrub exfoliation, relaxing massage, and hot towels.',
    descEs: 'Pedicure completa + exfoliación, masaje relajante y toallas calientes.',
    price: 0,
    durationMin: 45,
  },
  {
    id: 'nail-pedi-luxury',
    category: 'nails',
    titleEn: 'Luxury Spa Pedicure',
    titleEs: 'Luxury Spa Pedicure',
    descEn: 'Signature Pedicure + hydrating mask, hot stones, and extended massage.',
    descEs: 'Pedicure Signature + mascarilla hidratante, piedras calientes y masaje extendido.',
    price: 0,
    durationMin: 60,
  },
  {
    id: 'nail-pedi-royal',
    category: 'nails',
    titleEn: 'Maria Bonita Royal Pedicure',
    titleEs: 'Maria Bonita Royal Pedicure',
    descEn: 'Aromatic soak, deep exfoliation, nourishing mask, hot stones, hot towels, calf massage, drink.',
    descEs: 'Remojo aromático, exfoliación profunda, mascarilla nutritiva, piedras calientes, masaje y bebida.',
    price: 0,
    durationMin: 75,
  },
  {
    id: 'nail-ext-gelx',
    category: 'nails',
    titleEn: 'Gel X Full Set',
    titleEs: 'Gel X Full Set',
    descEn: 'Full set of Gel-X nail extensions for lightweight strength and elegance.',
    descEs: 'Set completo de extensiones Gel-X para ligereza, resistencia y elegancia.',
    price: 0,
    durationMin: 60,
  },
  {
    id: 'nail-ext-acrylic',
    category: 'nails',
    titleEn: 'Acrylic Full Set / Fill',
    titleEs: 'Acrylic Full Set / Relleno',
    descEn: 'Custom acrylic full set or maintenance refill for perfect nails.',
    descEs: 'Set completo de acrílico o mantenimiento de relleno para uñas perfectas.',
    price: 0,
    durationMin: 60,
  },
  {
    id: 'nail-pkg-beauty',
    category: 'nails',
    titleEn: 'Beauty Day Package',
    titleEs: 'Paquete Beauty Day',
    descEn: 'Gel Manicure + Signature Pedicure combo.',
    descEs: 'Combinación de Gel Manicure + Signature Pedicure.',
    price: 0,
    durationMin: 90,
  },
  {
    id: 'nail-pkg-ultimate',
    category: 'nails',
    titleEn: 'Ultimate Relaxation Package',
    titleEs: 'Paquete Ultimate Relaxation',
    descEn: 'Japanese Head Spa Zen (60 min) + Royal Pedicure.',
    descEs: 'Japanese Head Spa Zen (60 min) + Royal Pedicure.',
    price: 0,
    durationMin: 135,
  }
];

const getServicePriceText = (service: { price: number }, lang: 'en' | 'es') => {
  return lang === 'es' ? 'Con base a valoración' : 'Based on assessment';
};

interface Staff {
  id: string;
  nameEn: string;
  nameEs: string;
  initials: string;
}

const STAFF_DATA: Staff[] = [
  { id: 'any', nameEn: 'Any Staff Member', nameEs: 'Cualquier miembro del personal', initials: 'Cu' },
  { id: 'brenda', nameEn: 'Brenda', nameEs: 'Brenda', initials: 'Br' },
  { id: 'edith', nameEn: 'Edith', nameEs: 'Edith', initials: 'Ed' },
  { id: 'maria', nameEn: 'Maria', nameEs: 'María', initials: 'Ma' }
];

interface Booking {
  id: string;
  refCode: string;
  date: string;
  time: string;
  staffName: string;
  services: { title: string; price: number; durationMin: number }[];
  contact: { name: string; email: string; phone: string; notes?: string };
  totalPrice: number;
  totalDuration: number;
  createdAt: string;
  dateISO?: string;
}

interface BookingSchedulerProps {
  lang: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingScheduler({ lang: initialLang, isOpen, onClose }: BookingSchedulerProps) {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<'en' | 'es'>(initialLang);

  useEffect(() => {
    setLang(initialLang);
  }, [initialLang]);

  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');
  const [step, setStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Custom time states
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customHour, setCustomHour] = useState('10');
  const [customMinute, setCustomMinute] = useState('00');
  const [customAmpm, setCustomAmpm] = useState('AM');
  
  // Contact Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Bookings list stored in localStorage
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Calendar states
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Dynamic schedules and staff states
  const [staffSchedules, setStaffSchedules] = useState<any[]>([]);
  const [salonStaff, setSalonStaff] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dynamic staff and schedules
    const fetchData = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) return;
      
      try {
        const [schedulesRes, staffRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/staff_schedules?select=*`, {
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
          }),
          fetch(`${supabaseUrl}/rest/v1/salon_staff?select=*`, {
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
          })
        ]);
        
        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json();
          setStaffSchedules(schedulesData);
        }
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setSalonStaff(staffData);
        }
      } catch (err) {
        console.error("Error fetching dynamic data:", err);
      }
    };
    fetchData();
  }, []);

  // Sync custom time to selectedSlot when isCustomTime is active
  useEffect(() => {
    if (isCustomTime) {
      setSelectedSlot(`${customHour}:${customMinute} ${customAmpm}`);
    }
  }, [customHour, customMinute, customAmpm, isCustomTime]);

  const getExistingBookingsForDate = () => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return bookings.filter(b => {
      const dateMatch = b.date === dateStr;
      if (!dateMatch) return false;
      if (selectedStaff === 'any') return true;
      
      const staffObj = STAFF_DATA.find(s => s.id === selectedStaff);
      if (!staffObj) return true;
      const bStaffLower = (b.staffName || '').toLowerCase();
      const staffEnLower = staffObj.nameEn.toLowerCase();
      const staffEsLower = staffObj.nameEs.toLowerCase();
      return bStaffLower.includes(staffEnLower) || bStaffLower.includes(staffEsLower);
    });
  };

  const getTimelineBookings = () => {
    const list = getExistingBookingsForDate().map(b => ({
      id: b.id,
      time: b.time,
      durationMin: b.totalDuration,
      isMock: false
    }));
    
    // Add seeded mock bookings to show a beautiful occupied timeline for testing
    if (selectedDate) {
      const dateSeed = selectedDate.getDate() + selectedDate.getMonth() * 31;
      if (dateSeed % 2 === 0) {
        list.push({
          id: 'mock-1',
          time: '11:00 AM',
          durationMin: 60,
          isMock: true
        });
      }
      if (dateSeed % 3 === 0 || dateSeed % 5 === 0) {
        list.push({
          id: 'mock-2',
          time: '2:30 PM',
          durationMin: 90,
          isMock: true
        });
      }
      if (dateSeed % 7 === 0) {
        list.push({
          id: 'mock-3',
          time: '4:30 PM',
          durationMin: 60,
          isMock: true
        });
      }
    }
    
    return list;
  };

  const checkOverlapsAndBusinessHours = (slot: string) => {
    if (!selectedDate || !slot) return { valid: false, reason: '' };
    
    const startMin = parseTimeToMinutes(slot);
    const endMin = startMin + totalDuration;
    
    // Check 20-minute anticipation rule for today
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (isToday) {
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const minAllowedMin = currentMin + 20;
      if (startMin < minAllowedMin) {
        return {
          valid: false,
          reason: lang === 'es'
            ? `Por favor, agenda con al menos 20 minutos de anticipación. Hora mínima: ${formatMinutesToTime(minAllowedMin)}.`
            : `Please book at least 20 minutes in advance. Earliest time: ${formatMinutesToTime(minAllowedMin)}.`
        };
      }
    }
    
    const dayOfWeek = selectedDate.getDay();
    const isSunday = dayOfWeek === 0;
    const openingMin = 10 * 60; // 10:00 AM
    const closingMin = isSunday ? 16 * 60 : 19 * 60; // 4:00 PM or 7:00 PM
    
    if (startMin < openingMin || startMin >= closingMin) {
      return {
        valid: false,
        reason: lang === 'es' 
          ? 'La hora seleccionada está fuera del horario de atención (10:00 AM - ' + (isSunday ? '4:00 PM' : '7:00 PM') + ').' 
          : 'Selected time is outside business hours (10:00 AM - ' + (isSunday ? '4:00 PM' : '7:00 PM') + ').'
      };
    }
    
    if (endMin > closingMin) {
      return {
        valid: false,
        reason: lang === 'es'
          ? `La cita de ${formatDuration(totalDuration, lang)} termina a las ${formatMinutesToTime(endMin)}, después del cierre (${isSunday ? '4:00 PM' : '7:00 PM'}).`
          : `The ${formatDuration(totalDuration, lang)} appointment ends at ${formatMinutesToTime(endMin)}, which is after closing (${isSunday ? '4:00 PM' : '7:00 PM'}).`
      };
    }
    
    // Check dynamic staff schedules
    if (staffSchedules.length > 0 && salonStaff.length > 0) {
      // Find the required hour slots in 'HH:00' format
      const startHour = Math.floor(startMin / 60);
      const endHour = Math.ceil(endMin / 60) - (endMin % 60 === 0 ? 1 : 0);
      const requiredHours: string[] = [];
      for (let h = startHour; h <= endHour; h++) {
        requiredHours.push(`${h.toString().padStart(2, '0')}:00`);
      }

      const checkStaffAvailability = (staffName: string) => {
        // Find staff UUID from salonStaff
        const dbStaff = salonStaff.find(s => s.name.toLowerCase() === staffName.toLowerCase());
        if (!dbStaff) return false;
        
        const schedule = staffSchedules.find(s => s.staff_id === dbStaff.id && s.day_of_week === dayOfWeek);
        if (!schedule) return false;
        
        // Every required hour must be in the staff's time_slots
        return requiredHours.every(rh => schedule.time_slots.includes(rh));
      };

      if (selectedStaff === 'any') {
        // We need at least one staff from STAFF_DATA (excluding 'any') who is available
        const staffToCheck = STAFF_DATA.filter(s => s.id !== 'any');
        const availableStaff = staffToCheck.some(s => checkStaffAvailability(s.nameEs)); // Name matches salon_staff.name
        
        if (!availableStaff) {
          return {
            valid: false,
            reason: lang === 'es'
              ? 'Ningún estilista tiene disponibilidad en este horario según la agenda.'
              : 'No staff member has availability at this time according to the schedule.'
          };
        }
      } else {
        const staffObj = STAFF_DATA.find(s => s.id === selectedStaff);
        if (staffObj) {
          const isAvailable = checkStaffAvailability(staffObj.nameEs);
          if (!isAvailable) {
            return {
              valid: false,
              reason: lang === 'es'
                ? `Este horario no está marcado como disponible en la agenda de ${staffObj.nameEs}.`
                : `This time is not marked as available in ${staffObj.nameEn}'s schedule.`
            };
          }
        }
      }
    }
    
    const dayBookings = getTimelineBookings();
    for (const b of dayBookings) {
      const bStart = parseTimeToMinutes(b.time);
      const bEnd = bStart + b.durationMin;
      
      if (startMin < bEnd && bStart < endMin) {
        return {
          valid: false,
          reason: lang === 'es'
            ? `Se empalma con otra cita (Ocupado de ${b.time} a ${formatMinutesToTime(bEnd)}).`
            : `Overlaps with another booking (Busy from ${b.time} to ${formatMinutesToTime(bEnd)}).`
        };
      }
    }
    
    return { valid: true, reason: '' };
  };

  const handleSuggestedSlotClick = (slot: string) => {
    setIsCustomTime(false);
    setSelectedSlot(slot);
  };

  const isSlotValid = (slot: string) => {
    return checkOverlapsAndBusinessHours(slot).valid;
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('maria_bonita_bookings');
    if (stored) {
      try {
        setBookings(JSON.parse(stored));
      } catch (e) {
        console.error('Error reading bookings from localStorage', e);
      }
    }
  }, []);

  // Sync bookings to localStorage
  const saveBookings = (updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
    localStorage.setItem('maria_bonita_bookings', JSON.stringify(updatedBookings));
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.durationMin, 0);
  const totalPrice = selectedServices.reduce((acc, curr) => acc + curr.price, 0);

  // Filter services by category
  const filteredServices = categoryFilter === 'all' 
    ? SERVICES_DATA 
    : SERVICES_DATA.filter(s => s.category === categoryFilter);

  // Calendar generation helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate mock time slots based on opening hours and day of week
  const generateSlots = () => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const isSunday = dayOfWeek === 0;

    // Start & End hours
    const startHour = 10; // 10:00 AM
    const endHour = isSunday ? 16 : 19; // 4:00 PM or 7:00 PM

    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      slots.push(`${displayHour}:00 ${ampm}`);
      slots.push(`${displayHour}:30 ${ampm}`);
    }
    
    // Add the final slot
    if (isSunday) {
      slots.push('4:00 PM');
    } else {
      slots.push('7:00 PM');
    }

    // Seeded random status to make some hours taken/busy to simulate real booking
    const dateStr = selectedDate.toDateString();
    return slots.filter((slot) => {
      // Create a pseudo-random hash from date string and slot time
      let hash = 0;
      const combined = dateStr + slot;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      // Keep about 70% of slots open
      return Math.abs(hash % 10) < 7;
    });
  };

  const timeSlots = generateSlots();

  // Handle Calendar Cell Selection
  const handleDateClick = (dayNum: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), dayNum);
    if (clickedDate < today) return; // Disable past dates
    
    setSelectedDate(clickedDate);
    setSelectedSlot(null); // Reset selected slot when changing date
  };

  // Form submission handler
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError(lang === 'es' ? 'Por favor introduce tu nombre.' : 'Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError(lang === 'es' ? 'Por favor introduce un correo electrónico válido.' : 'Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setFormError(lang === 'es' ? 'Por favor introduce tu número de teléfono.' : 'Please enter your phone number.');
      return;
    }

    if (!selectedDate || !selectedSlot) return;

    // Create Booking Object
    const refCode = 'MB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const staffObj = STAFF_DATA.find(s => s.id === selectedStaff);
    const staffName = staffObj ? (lang === 'es' ? staffObj.nameEs : staffObj.nameEn) : '';

    // Reconstruct precise ISO timestamp for database
    let hours = 0;
    let minutes = 0;
    const match = selectedSlot.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
    const combinedDate = new Date(selectedDate.getTime());
    combinedDate.setHours(hours, minutes, 0, 0);
    const dateISO = combinedDate.toISOString();

    const newBooking: Booking = {
      id: Math.random().toString(36).substring(2, 9),
      refCode,
      date: selectedDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: selectedSlot,
      staffName,
      services: selectedServices.map(s => ({
        title: lang === 'es' ? s.titleEs : s.titleEn,
        price: s.price,
        durationMin: s.durationMin
      })),
      contact: { name, email, phone },
      totalPrice,
      totalDuration,
      createdAt: new Date().toISOString(),
      dateISO
    };

    // Trigger confirmation email, database sync, and WhatsApp alerts using Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fegqbewlxombdmonlxyr.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-email`;

    fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        refCode: newBooking.refCode,
        date: newBooking.date,
        time: newBooking.time,
        staffName: newBooking.staffName,
        services: newBooking.services,
        contact: newBooking.contact,
        totalPrice: newBooking.totalPrice,
        totalDuration: newBooking.totalDuration,
        dateISO,
        lang
      })
    })
    .then(res => res.json())
    .then(data => console.log('Booking process success:', data))
    .catch(err => console.error('Booking process error:', err));

    const updated = [newBooking, ...bookings];
    saveBookings(updated);
    setConfirmedBooking(newBooking);
    setStep(5); // Move to Success Screen (step 5)
  };

  const handleCancelBooking = (id: string) => {
    const confirmMsg = lang === 'es' 
      ? '¿Estás seguro de que deseas cancelar esta cita?' 
      : 'Are you sure you want to cancel this appointment?';
    
    if (window.confirm(confirmMsg)) {
      const updated = bookings.filter(b => b.id !== id);
      saveBookings(updated);
    }
  };

  const resetBookingFlow = () => {
    setStep(1);
    setSelectedServices([]);
    setSelectedStaff('any');
    setSelectedDate(null);
    setSelectedSlot(null);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setConfirmedBooking(null);
  };

  // Translations object helper
  const text = {
    title: lang === 'es' ? 'Agendador de Citas' : 'Appointment Scheduler',
    subtitle: lang === 'es' ? 'Reserva tus servicios en línea con facilidad' : 'Book your services online with ease',
    tabBook: lang === 'es' ? 'Nueva Cita' : 'New Appointment',
    tabMyBookings: lang === 'es' ? 'Mis Citas' : 'My Bookings',
    
    // Steps
    stepServices: lang === 'es' ? '1. Servicios' : '1. Services',
    stepStaff: lang === 'es' ? '2. Personal' : '2. Staff',
    stepDateTime: lang === 'es' ? '3. Fecha y Hora' : '3. Date & Time',
    stepContact: lang === 'es' ? '4. Datos' : '4. Details',
    stepConfirm: lang === 'es' ? '5. Listo' : '5. Done',

    selectStaffTitle: lang === 'es' ? 'Selecciona miembro del personal' : 'Select staff member',
    selectStaffSubtitle: lang === 'es' ? 'Elige a tu profesional preferido' : 'Choose your preferred professional',
    staffLabel: lang === 'es' ? 'Personal:' : 'Staff:',

    // Privacy Notice
    privacyNoticeTitle: lang === 'es' ? 'Importante:' : 'Important Notice:',
    privacyNoticeDesc: lang === 'es' 
      ? 'Tus datos de contacto no serán almacenados para fines publicitarios. Solo se utilizarán para enviarte tu comprobante, confirmar tu cita y recordatorios. No se enviará publicidad por correo ni por teléfono.'
      : 'Your contact details will not be stored for advertising purposes. They will only be used to send your receipt, confirm your appointment, and reminders. No promotional content will be sent.',
    
    // Categories
    catAll: lang === 'es' ? 'Todos' : 'All',
    catHair: lang === 'es' ? 'Cabello' : 'Hair',
    catMakeup: lang === 'es' ? 'Maquillaje/Rostro' : 'Makeup/Face',
    catLashes: lang === 'es' ? 'Pestañas/Cejas' : 'Lashes/Brows',
    catSpa: lang === 'es' ? 'Spa' : 'Spa',
    catNails: lang === 'es' ? 'Uñas / Nail Spa' : 'Nails / Nail Spa',

    // Floating bar
    selectedCount: lang === 'es' ? 'seleccionados' : 'selected',
    totalPriceText: lang === 'es' ? 'Total aproximado:' : 'Approx. Total:',
    continueBtn: lang === 'es' ? 'Continuar' : 'Continue',
    backBtn: lang === 'es' ? 'Atrás' : 'Back',
    confirmBookingBtn: lang === 'es' ? 'Confirmar Cita' : 'Confirm Appointment',
    selectServiceWarning: lang === 'es' ? 'Por favor selecciona al menos un servicio.' : 'Please select at least one service.',

    // Calendar & Slots
    selectDayTitle: lang === 'es' ? 'Selecciona una fecha' : 'Select a date',
    selectTimeTitle: lang === 'es' ? 'Horas disponibles' : 'Available times',
    noSlotsMsg: lang === 'es' ? 'No hay horarios disponibles para esta fecha. Intenta con otro día.' : 'No slots available for this date. Try another day.',
    monList: lang === 'es' 
      ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dayNames: lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    
    // Form
    personalInfoTitle: lang === 'es' ? 'Información de Contacto' : 'Contact Information',
    personalInfoSubtitle: lang === 'es' ? 'Por favor completa tus datos para la cita.' : 'Please complete your details for the appointment.',
    lblName: lang === 'es' ? 'Nombre completo' : 'Full Name',
    lblEmail: lang === 'es' ? 'Correo electrónico' : 'Email Address',
    lblPhone: lang === 'es' ? 'Teléfono de contacto' : 'Phone Number',
    lblNotes: lang === 'es' ? 'Notas adicionales (Opcional)' : 'Additional Notes (Optional)',
    placeholderNotes: lang === 'es' ? 'Indícanos si tienes alguna preferencia o requerimiento especial...' : 'Let us know if you have any preferences or special requirements...',

    // Success
    successTitle: lang === 'es' ? '¡Cita Reservada con Éxito!' : 'Appointment Booked Successfully!',
    successDesc: lang === 'es' 
      ? 'Tu cita ha sido agendada localmente en este navegador. Se ha guardado en la pestaña "Mis Citas" para tu control.' 
      : 'Your appointment has been successfully scheduled locally in this browser. It is saved in the "My Bookings" tab for your tracking.',
    summaryTitle: lang === 'es' ? 'Resumen de Cita' : 'Appointment Summary',
    summaryRef: lang === 'es' ? 'Referencia:' : 'Reference:',
    summaryDate: lang === 'es' ? 'Fecha:' : 'Date:',
    summaryTime: lang === 'es' ? 'Hora:' : 'Time:',
    summaryServices: lang === 'es' ? 'Servicios:' : 'Services:',
    summaryTotal: lang === 'es' ? 'Total:' : 'Total:',
    btnFinish: lang === 'es' ? 'Volver al Inicio' : 'Back to Start',
    successEmailCancelTitle: lang === 'es' ? '¿Necesitas cancelar o modificar?' : 'Need to cancel or reschedule?',
    successEmailCancelNotice: lang === 'es'
      ? 'Si deseas realizar algún cambio en tu cita, puedes hacerlo respondiendo directamente al correo de confirmación que te hemos enviado.'
      : 'If you wish to make any changes to your appointment, you can do so by replying directly to the confirmation email.',

    // Bookings Tab
    myBookingsTitle: lang === 'es' ? 'Tus Citas Programadas' : 'Your Booked Appointments',
    myBookingsSubtitle: lang === 'es' ? 'Citas guardadas en este dispositivo' : 'Appointments saved on this device',
    noBookings: lang === 'es' ? 'No tienes citas reservadas actualmente.' : 'You have no booked appointments currently.',
    noBookingsSub: lang === 'es' ? 'Agenda una nueva cita utilizando la pestaña "Nueva Cita".' : 'Schedule a new appointment using the "New Appointment" tab.',
    refCodeLabel: lang === 'es' ? 'Código:' : 'Code:',
    btnCancel: lang === 'es' ? 'Cancelar Cita' : 'Cancel Booking',
    myBookingsCancelNotice: lang === 'es'
      ? 'Nota: Cancelar una cita aquí solo la elimina de tu navegador. Para cancelarla en el salón de belleza formalmente, por favor responde a tu correo de confirmación o llámanos.'
      : 'Note: Cancelling an appointment here only removes it from your browser. To cancel with the beauty salon formally, please reply to your confirmation email or call us.'
  };

  // Safe SSR Render checking
  if (!isOpen) return null;
  if (!mounted) return null;

  // Calculate calendar month variables
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  const monthName = text.monList[month];

  // Build Calendar Cells
  const calendarCells = [];
  
  // Empty slots for previous month padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className={styles.disabledDay} />);
  }

  // Days of the month
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const isPast = cellDate < today;
    const isSelected = selectedDate && selectedDate.toDateString() === cellDate.toDateString();
    const isToday = today.toDateString() === cellDate.toDateString();

    calendarCells.push(
      <button
        key={`day-${day}`}
        onClick={() => !isPast && handleDateClick(day)}
        disabled={isPast}
        className={`${styles.dayCell} ${isPast ? styles.disabledDay : ''} ${isSelected ? styles.selectedDay : ''} ${isToday ? styles.todayCell : ''}`}
      >
        {day}
      </button>
    );
  }


  // Booking categorization logic
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const getBookingDate = (booking: Booking): Date | null => {
    if (booking.dateISO) {
      return new Date(booking.dateISO);
    }
    return null;
  };

  const validBookings = bookings.filter(b => {
    const bDate = getBookingDate(b);
    if (!bDate) return true;
    return bDate >= now;
  });

  const sortedBookings = [...validBookings].sort((a, b) => {
    const dateA = getBookingDate(a)?.getTime() || 0;
    const dateB = getBookingDate(b)?.getTime() || 0;
    return dateA - dateB;
  });

  const todayBookings = sortedBookings.filter(b => {
    const bDate = getBookingDate(b);
    if (!bDate) return false;
    return bDate >= todayStart && bDate < tomorrowStart;
  });

  const upcomingBookings = sortedBookings.filter(b => {
    const bDate = getBookingDate(b);
    if (!bDate) return true;
    return bDate >= tomorrowStart;
  }).slice(0, 10);

  const renderBookingCard = (booking: Booking) => (
    <div key={booking.id} className={styles.bookingCardItem}>
      <div className={styles.bookingDetails}>
        <div className={styles.bookingRefLine}>
          <span>{text.refCodeLabel}</span> <span>{booking.refCode}</span>
        </div>
        
        <div className={styles.bookingDateTime}>
          {booking.date} a las {booking.time}
        </div>

        <div className={styles.bookingServicesList}>
          {booking.services.map((s: any, idx: number) => (
            <span key={idx} className={styles.serviceBadge}>
              {s.title}
            </span>
          ))}
        </div>
        
        <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px', fontFamily: 'var(--font-montserrat)' }}>
          <strong>{lang === 'es' ? 'Cliente:' : 'Client:'}</strong> {booking.contact.name} ({booking.contact.phone})
        </div>
         <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px', fontFamily: 'var(--font-montserrat)' }}>
           <strong>{text.staffLabel}</strong> {booking.staffName || (lang === 'es' ? 'Cualquier estilista' : 'Any Staff')}
         </div>
        <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px', fontFamily: 'var(--font-montserrat)' }}>
          <strong>{lang === 'es' ? 'Duración:' : 'Duration:'}</strong> {formatDuration(booking.totalDuration, lang)}
        </div>
      </div>

      <div>
        <button 
          onClick={() => handleCancelBooking(booking.id)}
          className={styles.cancelBtn}
        >
          <Trash2 size={13} style={{ marginRight: '5px', display: 'inline', verticalAlign: 'middle' }} />
          {text.btnCancel}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose} data-lenis-prevent>
      <div className={styles.bookingContainer} onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        
        {/* Header Tab Navigator */}
        <div className={styles.bookingHeader}>
          <div className={styles.headerTop}>
            <div className={styles.titleArea}>
              <h2>{text.title}</h2>
              <p>{text.subtitle}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'book' ? styles.activeTab : ''}`}
                  onClick={() => {
                    setActiveTab('book');
                    resetBookingFlow();
                  }}
                >
                  {text.tabBook}
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'my-bookings' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('my-bookings')}
                >
                  {text.tabMyBookings} ({bookings.length})
                </button>
              </div>
              
              <button 
                onClick={() => setLang(prev => prev === 'es' ? 'en' : 'es')}
                className={styles.langToggleBtn}
                title={lang === 'es' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
                type="button"
              >
                {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
              </button>

              <button className={styles.closeBtn} onClick={onClose} aria-label="Close booking scheduler">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Stepper Progress bar (only shown in Booking flow) */}
          {activeTab === 'book' && (
            <div className={styles.stepper}>
              <div className={styles.stepperLine}></div>
              <div 
                className={styles.stepperProgress} 
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              ></div>
              
              <div 
                className={`${styles.stepNode} ${step >= 1 ? styles.activeStep : ''} ${step > 1 ? styles.completedStep : ''}`}
                onClick={() => step > 1 && setStep(1)}
              >
                {step > 1 ? <Check size={12} /> : '1'}
              </div>
              <div 
                className={`${styles.stepNode} ${step >= 2 ? styles.activeStep : ''} ${step > 2 ? styles.completedStep : ''}`}
                onClick={() => step > 2 && setStep(2)}
              >
                {step > 2 ? <Check size={12} /> : '2'}
              </div>
              <div 
                className={`${styles.stepNode} ${step >= 3 ? styles.activeStep : ''} ${step > 3 ? styles.completedStep : ''}`}
                onClick={() => step > 3 && setStep(3)}
              >
                {step > 3 ? <Check size={12} /> : '3'}
              </div>
              <div 
                className={`${styles.stepNode} ${step >= 4 ? styles.activeStep : ''} ${step > 4 ? styles.completedStep : ''}`}
                onClick={() => step > 4 && setStep(4)}
              >
                {step > 4 ? <Check size={12} /> : '4'}
              </div>
              <div className={`${styles.stepNode} ${step >= 5 ? styles.activeStep : ''}`}>
                {step === 5 ? <Sparkles size={12} /> : '5'}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Content Body */}
        <div className={styles.bookingBody}>
          
          {/* TAB 1: BOOKING FLOW */}
          {activeTab === 'book' && (
            <>
              {/* STEP 1: SERVICE SELECTION */}
              {step === 1 && (
                <div className={styles.stepWrapper}>
                  {/* Category Filter bar */}
                  <div className={styles.categoryFilter}>
                    <button 
                      className={`${styles.filterBtn} ${categoryFilter === 'all' ? styles.activeFilter : ''}`}
                      onClick={() => setCategoryFilter('all')}
                    >
                      {text.catAll}
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${categoryFilter === 'hair' ? styles.activeFilter : ''}`}
                      onClick={() => setCategoryFilter('hair')}
                    >
                      {text.catHair}
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${categoryFilter === 'makeup_face' ? styles.activeFilter : ''}`}
                      onClick={() => setCategoryFilter('makeup_face')}
                    >
                      {text.catMakeup}
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${categoryFilter === 'lashes_brows' ? styles.activeFilter : ''}`}
                      onClick={() => setCategoryFilter('lashes_brows')}
                    >
                      {text.catLashes}
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${categoryFilter === 'spa' ? styles.activeFilter : ''}`}
                      onClick={() => setCategoryFilter('spa')}
                    >
                      {text.catSpa}
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${categoryFilter === 'nails' ? styles.activeFilter : ''}`}
                      onClick={() => setCategoryFilter('nails')}
                    >
                      {text.catNails}
                    </button>
                  </div>

                  {/* Services List */}
                  <div className={styles.servicesGrid}>
                    {filteredServices.map(service => {
                      const isSelected = selectedServices.some(s => s.id === service.id);
                      return (
                        <div 
                          key={service.id} 
                          className={`${styles.serviceItem} ${isSelected ? styles.serviceSelected : ''}`}
                          onClick={() => handleServiceSelect(service)}
                        >
                          <div className={styles.serviceInfoArea}>
                            <div className={styles.serviceTitleRow}>
                              <h3 className={styles.serviceTitle}>
                                {lang === 'es' ? service.titleEs : service.titleEn}
                              </h3>
                              <span className={styles.serviceMeta}>
                                {getServicePriceText(service, lang)} | {service.durationMin} min
                              </span>
                            </div>
                            <p className={styles.serviceDesc}>
                              {lang === 'es' ? service.descEs : service.descEn}
                            </p>
                          </div>
                          
                          <div className={styles.selectionControl}>
                            <div className={styles.checkboxBtn}>
                              {isSelected && <Check size={14} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: STAFF MEMBER SELECTION */}
              {step === 2 && (
                <div className={styles.stepWrapper}>
                  <div style={{ borderBottom: '1px solid #eeeeee', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: '18px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {text.selectStaffTitle}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', color: '#666', marginTop: '4px' }}>
                      {text.selectStaffSubtitle}
                    </p>
                  </div>

                  <div className={styles.staffList}>
                    {STAFF_DATA.map(staff => {
                      const isSelected = selectedStaff === staff.id;
                      return (
                        <div 
                          key={staff.id} 
                          className={`${styles.staffItem} ${isSelected ? styles.staffSelected : ''}`}
                          onClick={() => setSelectedStaff(staff.id)}
                        >
                          <div className={styles.staffLeftArea}>
                            <div className={styles.staffAvatar}>
                              {staff.initials}
                            </div>
                            <span className={styles.staffName}>
                              {lang === 'es' ? staff.nameEs : staff.nameEn}
                            </span>
                          </div>
                          
                          <div className={styles.selectionControl}>
                            <div className={styles.radioBtn}>
                              {isSelected && <div className={styles.radioBtnInner} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.formActions}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={onClose} className={styles.cancelModalBtn} type="button">
                        {lang === 'es' ? 'Cancelar' : 'Cancel'}
                      </button>
                      <button onClick={() => setStep(1)} className={styles.backBtn}>
                        {text.backBtn}
                      </button>
                    </div>
                    <button onClick={() => setStep(3)} className={styles.actionBtn}>
                      {text.continueBtn} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & TIME SELECTOR */}
              {step === 3 && (
                <div className={styles.stepWrapper}>
                  <div className={styles.datetimeLayout}>
                    
                    {/* Column 1: Calendar */}
                    <div className={styles.calendarContainer}>
                      <div className={styles.calendarHeader}>
                        <h3 className={styles.monthTitle}>{`${monthName} ${year}`}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={handlePrevMonth} className={styles.calArrow}>
                            <ChevronLeft size={16} />
                          </button>
                          <button onClick={handleNextMonth} className={styles.calArrow}>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.weekdays}>
                        {text.dayNames.map((name, i) => (
                          <span key={i} className={styles.weekdayLabel}>{name}</span>
                        ))}
                      </div>
                      
                      <div className={styles.daysGrid}>
                        {calendarCells}
                      </div>
                    </div>

                    {/* Column 2: Suggested & Custom Time */}
                    <div className={styles.slotsContainer}>
                      <h3 className={styles.slotsHeader}>
                        {text.selectTimeTitle} {selectedDate && `(${selectedDate.getDate()} de ${monthName.toLowerCase()})`}
                      </h3>
                      
                      {selectedDate ? (
                        <>
                          {!isCustomTime ? (
                            timeSlots.length > 0 ? (
                              <div className={styles.slotsGrid}>
                                {timeSlots.map(slot => {
                                  const isValid = isSlotValid(slot);
                                  const isSelected = selectedSlot === slot;
                                  return (
                                    <button
                                      key={slot}
                                      type="button"
                                      onClick={() => isValid && handleSuggestedSlotClick(slot)}
                                      disabled={!isValid}
                                      className={`${styles.slotBtn} ${isSelected ? styles.selectedSlot : ''} ${!isValid ? styles.disabledSlot : ''}`}
                                      title={!isValid ? (lang === 'es' ? 'Horario ocupado' : 'Time occupied') : ''}
                                    >
                                      {slot}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className={styles.noSlotsText}>{text.noSlotsMsg}</p>
                            )
                          ) : (
                            <div className={styles.noSlotsText} style={{ padding: '20px 0' }}>
                              <p style={{ fontWeight: '500', color: 'var(--gold)', marginBottom: '5px' }}>
                                {lang === 'es' ? 'Hora personalizada activa' : 'Custom time active'}
                              </p>
                              <p style={{ fontSize: '12px' }}>
                                {lang === 'es' ? 'Ajusta los selectores de abajo.' : 'Adjust the dropdown selectors below.'}
                              </p>
                            </div>
                          )}

                          {/* Custom Time Selector Section */}
                          <div className={styles.customTimeSection}>
                            <div className={styles.customTimeHeader}>
                              <span className={styles.customTimeTitle}>
                                {lang === 'es' ? 'Hora Personalizada' : 'Custom Time'}
                              </span>
                              <button
                                type="button"
                                className={isCustomTime ? styles.customTimeToggleActive : styles.customTimeToggleBtn}
                                onClick={() => {
                                  const active = !isCustomTime;
                                  setIsCustomTime(active);
                                  if (active) {
                                    setSelectedSlot(`${customHour}:${customMinute} ${customAmpm}`);
                                  } else {
                                    setSelectedSlot(null);
                                  }
                                }}
                              >
                                {isCustomTime 
                                  ? (lang === 'es' ? 'Usar sugeridas' : 'Use suggested') 
                                  : (lang === 'es' ? 'Personalizar' : 'Customize')}
                              </button>
                            </div>
                            
                            {isCustomTime && (
                              <div className={styles.customTimeInputArea}>
                                <div className={styles.customTimeFields}>
                                  <div className={styles.selectFieldWrapper}>
                                    <span className={styles.selectFieldLabel}>{lang === 'es' ? 'Hora' : 'Hour'}</span>
                                    <select 
                                      value={customHour} 
                                      onChange={(e) => setCustomHour(e.target.value)}
                                      className={styles.customTimeSelect}
                                    >
                                      {['10', '11', '12', '1', '2', '3', '4', '5', '6', '7'].map(h => (
                                        <option key={h} value={h}>{h}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <span className={styles.timeColon}>:</span>
                                  <div className={styles.selectFieldWrapper}>
                                    <span className={styles.selectFieldLabel}>{lang === 'es' ? 'Minuto' : 'Minute'}</span>
                                    <select 
                                      value={customMinute} 
                                      onChange={(e) => setCustomMinute(e.target.value)}
                                      className={styles.customTimeSelect}
                                    >
                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className={styles.selectFieldWrapper}>
                                    <span className={styles.selectFieldLabel}>AM/PM</span>
                                    <select 
                                      value={customAmpm} 
                                      onChange={(e) => setCustomAmpm(e.target.value)}
                                      className={styles.customTimeSelect}
                                    >
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {selectedSlot && (
                              (() => {
                                const validation = checkOverlapsAndBusinessHours(selectedSlot);
                                if (!validation.valid) {
                                  return (
                                    <div className={styles.validationWarning}>
                                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                      <span>{validation.reason}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            )}
                          </div>
                        </>
                      ) : (
                        <div className={styles.noSlotsText} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <CalendarIcon size={36} strokeWidth={1} color="var(--gold)" />
                          <p>{text.selectDayTitle}</p>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Daily Timeline */}
                    <div className={styles.timelineContainer}>
                      <h3 className={styles.timelineHeader}>
                        {lang === 'es' ? 'Agenda del Día' : 'Day Agenda'}
                      </h3>
                      
                      {selectedDate ? (
                        <div className={styles.timelineScroll}>
                          <div className={styles.timelineRail}>
                            
                            {/* Grid hours & lines */}
                            {[
                              { label: '10 AM', mins: 600 },
                              { label: '11 AM', mins: 660 },
                              { label: '12 PM', mins: 720 },
                              { label: '1 PM', mins: 780 },
                              { label: '2 PM', mins: 840 },
                              { label: '3 PM', mins: 900 },
                              { label: '4 PM', mins: 960 },
                              { label: '5 PM', mins: 1020 },
                              { label: '6 PM', mins: 1080 },
                              { label: '7 PM', mins: 1140 }
                            ].map((h, i) => {
                              const topPos = h.mins - 600;
                              return (
                                <div key={i}>
                                  <div className={styles.timelineHourLabel} style={{ top: `${topPos}px` }}>
                                    {h.label}
                                  </div>
                                  <div className={styles.timelineHourGridLine} style={{ top: `${topPos}px` }} />
                                </div>
                              );
                            })}
                            
                            {/* Existing bookings blocks */}
                            {getTimelineBookings().map((b) => {
                              const bStart = parseTimeToMinutes(b.time);
                              const topVal = bStart - 600;
                              const heightVal = b.durationMin;
                              
                              if (bStart < 600 || bStart >= 1140) return null;
                              
                              return (
                                <div 
                                  key={b.id}
                                  className={`${styles.timelineBlock} ${styles.timelineBlockMock}`}
                                  style={{ top: `${topVal}px`, height: `${heightVal}px` }}
                                  title={lang === 'es' ? `Cita Ocupada (${b.durationMin} min)` : `Busy Appointment (${b.durationMin} min)`}
                                  >
                                    <span>{lang === 'es' ? 'Reservado' : 'Booked'} ({formatDuration(b.durationMin, lang)})</span>
                                  </div>
                                );
                              })}
                              
                              {/* Preview block for currently selected slot */}
                              {selectedSlot && (() => {
                                const startVal = parseTimeToMinutes(selectedSlot);
                                const topVal = startVal - 600;
                                const heightVal = totalDuration;
                                const validation = checkOverlapsAndBusinessHours(selectedSlot);
                                
                                if (startVal < 600 || startVal >= 1140) return null;
                                
                                return (
                                  <div 
                                    className={`${styles.timelineBlock} ${validation.valid ? styles.timelineBlockPreviewValid : styles.timelineBlockPreviewInvalid}`}
                                    style={{ top: `${topVal}px`, height: `${heightVal}px` }}
                                  >
                                    <span>
                                      {validation.valid 
                                        ? (lang === 'es' ? 'Tu Cita' : 'Your Appointment') 
                                        : (lang === 'es' ? 'Traslape' : 'Overlap')} ({formatDuration(totalDuration, lang)})
                                    </span>
                                  </div>
                                );
                            })()}
                            
                          </div>
                        </div>
                      ) : (
                        <div className={styles.noSlotsText} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
                          <Clock size={36} strokeWidth={1} color="var(--gold)" />
                          <p>{lang === 'es' ? 'Selecciona una fecha' : 'Select a date'}</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Actions buttons */}
                  <div className={styles.formActions}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={onClose} className={styles.cancelModalBtn} type="button">
                        {lang === 'es' ? 'Cancelar' : 'Cancel'}
                      </button>
                      <button onClick={() => setStep(2)} className={styles.backBtn}>
                        {text.backBtn}
                      </button>
                    </div>
                    <button 
                      onClick={() => setStep(4)} 
                      disabled={!selectedDate || !selectedSlot || !checkOverlapsAndBusinessHours(selectedSlot).valid} 
                      className={styles.actionBtn}
                    >
                      {text.continueBtn} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CONTACT FORM */}
              {step === 4 && (
                <div className={styles.stepWrapper}>
                  <form onSubmit={handleConfirmBooking} className={styles.formContainer}>
                    <div style={{ borderBottom: '1px solid #eeeeee', paddingBottom: '15px', marginBottom: '10px' }}>
                      <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: '18px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {text.personalInfoTitle}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {text.personalInfoSubtitle}
                      </p>
                    </div>

                    {formError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff5f5', border: '1px solid #fed7d7', padding: '12px 16px', borderRadius: '8px', color: '#c53030', fontSize: '13px' }}>
                        <AlertCircle size={16} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="name"><User size={12} style={{ marginRight: '5px' }} /> {text.lblName}</label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={styles.textInput}
                          placeholder={lang === 'es' ? 'ej. María Pérez' : 'e.g. Jane Doe'}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="phone"><Phone size={12} style={{ marginRight: '5px' }} /> {text.lblPhone}</label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={styles.textInput}
                          placeholder="612-345-4187"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="email"><Mail size={12} style={{ marginRight: '5px' }} /> {text.lblEmail}</label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.textInput}
                        placeholder="maria@example.com"
                        required
                      />
                    </div>

                    {/* Privacy Disclaimer Notice */}
                    <div className={styles.privacyNotice}>
                      <AlertCircle size={15} style={{ color: 'var(--gold, #9e8a30)', flexShrink: 0, marginTop: '2px' }} />
                      <p>
                        <strong>{text.privacyNoticeTitle}</strong> {text.privacyNoticeDesc}
                      </p>
                    </div>

                    <div className={styles.formActions}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} className={styles.cancelModalBtn} type="button">
                          {lang === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button type="button" onClick={() => setStep(3)} className={styles.backBtn}>
                          {text.backBtn}
                        </button>
                      </div>
                      <button type="submit" className={styles.actionBtn}>
                        {text.confirmBookingBtn} <Check size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 5: SUCCESS CONFIRMATION */}
              {step === 5 && confirmedBooking && (
                <div className={styles.stepWrapper}>
                  <div className={styles.successPanel}>
                    <div className={styles.successIconCircle}>
                      <Check size={40} />
                    </div>
                    
                    <h3>{text.successTitle}</h3>
                    <p>{text.successDesc}</p>

                    <div className={styles.bookingSummaryCard}>
                      <div className={styles.summaryCardTitle}>
                        <span>{text.summaryTitle}</span>
                        <span className={styles.summaryRefCode}>{confirmedBooking.refCode}</span>
                      </div>

                      <div className={styles.summaryRows}>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>{text.summaryDate}</span>
                          <span className={styles.summaryValue}>{confirmedBooking.date}</span>
                        </div>
                        
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>{text.summaryTime}</span>
                          <span className={styles.summaryValue}>{confirmedBooking.time}</span>
                        </div>

                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>{text.staffLabel}</span>
                          <span className={styles.summaryValue}>{confirmedBooking.staffName}</span>
                        </div>

                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>{text.summaryServices}</span>
                          <div className={styles.summaryValueList}>
                            {confirmedBooking.services.map((s, idx) => (
                              <span key={idx} className={styles.summaryValueItem}>
                                {s.title} ({lang === 'es' ? 'Con base a valoración' : 'Based on assessment'})
                              </span>
                            ))}
                          </div>
                        </div>

                         <div className={styles.summaryRow} style={{ borderTop: '1px solid #eeeeee', paddingTop: '12px', marginTop: '5px', fontWeight: 'bold' }}>
                           <span className={styles.summaryLabel}>{lang === 'es' ? 'Duración Total:' : 'Total Duration:'}</span>
                           <span className={styles.summaryValue} style={{ color: 'var(--gold)' }}>
                             {formatDuration(confirmedBooking.totalDuration, lang)}
                           </span>
                         </div>
                      </div>
                    </div>

                    <div className={styles.successCancelNotice}>
                      <strong>{text.successEmailCancelTitle}</strong>
                      {text.successEmailCancelNotice}
                    </div>

                    <button 
                      onClick={() => {
                        resetBookingFlow();
                        onClose();
                      }} 
                      className={styles.summaryDoneBtn}
                    >
                      {text.btnFinish}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: MY BOOKINGS TAB */}
          {activeTab === 'my-bookings' && (
            <div className={styles.stepWrapper}>
              <div style={{ borderBottom: '1px solid #eeeeee', paddingBottom: '15px', marginBottom: '25px' }}>
                <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: '18px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {text.myBookingsTitle}
                </h3>
                <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', color: '#666', marginTop: '4px' }}>
                  {text.myBookingsSubtitle}
                </p>
              </div>

              {todayBookings.length === 0 && upcomingBookings.length === 0 ? (
                <div className={styles.emptyBookings}>
                  <CalendarIcon size={48} strokeWidth={1} color="#cccccc" />
                  <p>{text.noBookings}</p>
                  <p style={{ fontSize: '12px', color: '#aaaaaa' }}>{text.noBookingsSub}</p>
                </div>
              ) : (
                <>
                  {todayBookings.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontFamily: 'var(--font-poppins)', fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>
                        {lang === 'es' ? 'Citas del día' : 'Today\'s Bookings'}
                      </h4>
                      <div className={styles.bookingsList}>
                        {todayBookings.map(renderBookingCard)}
                      </div>
                    </div>
                  )}

                  {upcomingBookings.length > 0 && (
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-poppins)', fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>
                        {lang === 'es' ? 'Próximas citas' : 'Upcoming Bookings'}
                      </h4>
                      <div className={styles.bookingsList}>
                        {upcomingBookings.map(renderBookingCard)}
                      </div>
                    </div>
                  )}

                  <div className={styles.myBookingsNotice}>
                    {text.myBookingsCancelNotice}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Sticky Selected Services Footer Bar (Only shown in Step 1 of Booking flow) */}
        {activeTab === 'book' && step === 1 && (
          <div className={styles.summaryFooter}>
            <div className={styles.summaryText}>
              <span className={styles.summaryTotalLabel}>
                {selectedServices.length} {text.selectedCount}
              </span>
              <span className={styles.summaryTotals}>
                {formatDuration(totalDuration, lang)}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                className={styles.cancelModalBtn}
                type="button"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={selectedServices.length === 0}
                className={styles.actionBtn}
              >
                {text.continueBtn} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
