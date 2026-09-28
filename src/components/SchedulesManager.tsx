'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, Clock, User, Send, Loader2, UserPlus } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Schedule {
  id?: string;
  staff_id: string;
  day_of_week: number;
  time_slots: string[];
}

interface SchedulesManagerProps {
  lang: 'es' | 'en';
  supabaseUrl: string;
  supabaseAnonKey: string;
  schedules: Schedule[];
  staffList: { id: string; nameEs: string; nameEn: string; email?: string }[];
  onSchedulesUpdated: () => void;
}

const HOURS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00'
];

const formatTime12Hour = (time24: string) => {
  const [hourStr, minStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minStr} ${ampm}`;
};

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SchedulesManager({
  lang,
  supabaseUrl,
  supabaseAnonKey,
  schedules,
  staffList,
  onSchedulesUpdated
}: SchedulesManagerProps) {
  // Mapping of staff_id -> day (0-6) -> array of selected times
  const [activeSlots, setActiveSlots] = useState<Record<string, Record<number, string[]>>>({});
  
  // Mouse drag state
  const [isDragging, setIsDragging] = useState(false);
  // When starting a drag, are we selecting (true) or deselecting (false)?
  const [dragMode, setDragMode] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [sendingEmail, setSendingEmail] = useState<Record<string, boolean>>({});
  
  // Refs to capture each staff's grid
  const gridRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    // Load emails from staffList prop
    const dbEmails: Record<string, string> = {};
    staffList.forEach(staff => {
      if (staff.email) dbEmails[staff.id] = staff.email;
    });
    setEmails(dbEmails);
  }, [staffList]);

  const handleEmailChange = (staffId: string, email: string) => {
    setEmails(prev => ({ ...prev, [staffId]: email }));
  };

  const handleEmailBlur = async (staffId: string, email: string) => {
    // Find if the email has actually changed from what we have in props
    const staff = staffList.find(s => s.id === staffId);
    if (staff && staff.email === email) return; // No change

    try {
      await fetch(`${supabaseUrl}/rest/v1/salon_staff?id=eq.${staffId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mail: email })
      });
      // Optionally could call onSchedulesUpdated() here to refresh, but it's okay to just leave it silent
    } catch (err) {
      console.error("Error auto-saving email:", err);
    }
  };

  const handleSendEmail = async (staffId: string, staffName: string) => {
    const email = emails[staffId];
    if (!email) {
      alert(lang === 'es' ? 'Por favor ingresa un correo electrónico.' : 'Please enter an email address.');
      return;
    }

    const gridElement = gridRefs.current[staffId];
    if (!gridElement) return;

    setSendingEmail(prev => ({ ...prev, [staffId]: true }));
    
    try {
      // Small timeout to ensure any hover states are cleared
      await new Promise(r => setTimeout(r, 100));
      
      const canvas = await html2canvas(gridElement, {
        scale: 2, // High resolution
        backgroundColor: '#ffffff'
      });
      
      const imageBase64 = canvas.toDataURL('image/png');

      const res = await fetch(`${supabaseUrl}/functions/v1/send-schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          email,
          staffName,
          lang,
          imageBase64
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to send email');

      alert(lang === 'es' ? '¡Horario enviado por correo exitosamente!' : 'Schedule sent successfully!');
    } catch (err: any) {
      console.error('Error sending schedule:', err);
      alert((lang === 'es' ? 'Error al enviar: ' : 'Error sending: ') + err.message);
    } finally {
      setSendingEmail(prev => ({ ...prev, [staffId]: false }));
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) return;
    setIsAddingStaff(true);
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/salon_staff`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ name: newStaffName.trim() })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      setNewStaffName('');
      onSchedulesUpdated(); // Trigger refetch of staffList in parent
    } catch (err: any) {
      console.error("Error adding staff:", err);
      alert((lang === 'es' ? 'Error al añadir personal: ' : 'Error adding staff: ') + err.message);
    } finally {
      setIsAddingStaff(false);
    }
  };

  // Load all schedules on mount or when schedules/staff change
  useEffect(() => {
    const newState: Record<string, Record<number, string[]>> = {};
    
    staffList.forEach(staff => {
      newState[staff.id] = {};
      const staffSchedules = schedules.filter(s => s.staff_id === staff.id);
      
      for (let i = 0; i < 7; i++) {
        const daySchedule = staffSchedules.find(s => s.day_of_week === i);
        newState[staff.id][i] = daySchedule ? daySchedule.time_slots : [];
      }
    });
    
    setActiveSlots(newState);
  }, [schedules, staffList]);

  const handleMouseDown = (staffId: string, day: number, time: string) => {
    setIsDragging(true);
    
    // Determine if we are turning on or off based on the initial cell clicked
    const currentlySelected = activeSlots[staffId]?.[day]?.includes(time);
    const newMode = !currentlySelected;
    setDragMode(newMode);
    
    toggleSlot(staffId, day, time, newMode);
  };

  const handleMouseEnter = (staffId: string, day: number, time: string) => {
    if (isDragging) {
      toggleSlot(staffId, day, time, dragMode);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSlot = (staffId: string, day: number, time: string, forceState: boolean) => {
    setActiveSlots(prev => {
      const staffSlots = prev[staffId] || {};
      const daySlots = staffSlots[day] || [];
      const hasSlot = daySlots.includes(time);
      
      let newDaySlots = [...daySlots];
      
      if (forceState && !hasSlot) {
        newDaySlots.push(time);
      } else if (!forceState && hasSlot) {
        newDaySlots = newDaySlots.filter(t => t !== time);
      } else {
        return prev; // No change
      }
      
      return {
        ...prev,
        [staffId]: {
          ...staffSlots,
          [day]: newDaySlots
        }
      };
    });
  };

  // Attach mouseup to window to catch releases outside the grid
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const upserts: any[] = [];
      
      staffList.forEach(staff => {
        for (let day = 0; day < 7; day++) {
          upserts.push({
            staff_id: staff.id,
            day_of_week: day,
            time_slots: activeSlots[staff.id]?.[day] || [],
            updated_at: new Date().toISOString()
          });
        }
      });

      // Upsert using Supabase
      const res = await fetch(`${supabaseUrl}/rest/v1/staff_schedules`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(upserts)
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      alert(lang === 'es' ? 'Horarios guardados correctamente.' : 'Schedules saved successfully.');
      onSchedulesUpdated(); // Re-fetch the schedules in parent
    } catch (err: any) {
      console.error("Error saving schedules:", err);
      alert((lang === 'es' ? 'Error al guardar: ' : 'Error saving: ') + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const days = lang === 'es' ? DAYS_ES : DAYS_EN;

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
            {lang === 'es' ? 'Gestión de Horarios' : 'Schedule Management'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '600px' }}>
            {lang === 'es' 
              ? 'Arrastra el ratón sobre la cuadrícula de cada estilista para marcar en verde los horarios en los que estará disponible.' 
              : 'Drag your mouse over each staff member\'s grid to mark the times they are available in green.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <input 
              type="text" 
              placeholder={lang === 'es' ? 'Nuevo miembro...' : 'New member...'}
              value={newStaffName}
              onChange={e => setNewStaffName(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '130px', color: '#334155' }}
            />
            <button 
              onClick={handleAddStaff}
              disabled={isAddingStaff || !newStaffName.trim()}
              style={{
                background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', 
                padding: '6px 10px', fontSize: '13px', fontWeight: 600, cursor: (isAddingStaff || !newStaffName.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isAddingStaff || !newStaffName.trim()) ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              {isAddingStaff ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {lang === 'es' ? 'Añadir' : 'Add'}
            </button>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: '#d4af37', color: '#fff', 
              border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1, transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}
          >
            <Save size={18} />
            {isSaving ? (lang === 'es' ? 'Guardando...' : 'Saving...') : (lang === 'es' ? 'Guardar Todos los Horarios' : 'Save All Schedules')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {staffList.map(staff => (
          <div key={staff.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '2px solid #f1f5f9' }}>
              <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '50%', color: '#166534' }}>
                <User size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                {lang === 'es' ? staff.nameEs : staff.nameEn}
              </h3>
            </div>
            
            <div 
              ref={(el) => {
                if (el) gridRefs.current[staff.id] = el;
              }}
              style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', userSelect: 'none' }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #e2e8f0', width: '80px', position: 'sticky', left: 0, zIndex: 2 }}>
                      <Clock size={16} color="#64748b" />
                    </th>
                    {days.map((day, i) => (
                      <th key={i} style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #e2e8f0', fontWeight: 600, color: '#334155', fontSize: '14px' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((time) => (
                    <tr key={time}>
                      <td style={{ padding: '6px', fontSize: '12px', color: '#64748b', fontWeight: 500, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #cbd5e1', position: 'sticky', left: 0, zIndex: 1 }}>
                        {formatTime12Hour(time)}
                      </td>
                      {days.map((_, dayIdx) => {
                        const isSelected = activeSlots[staff.id]?.[dayIdx]?.includes(time);
                        return (
                          <td 
                            key={`${staff.id}-${dayIdx}-${time}`}
                            onMouseDown={() => handleMouseDown(staff.id, dayIdx, time)}
                            onMouseEnter={() => handleMouseEnter(staff.id, dayIdx, time)}
                            style={{ 
                              borderBottom: '1px solid #e2e8f0',
                              borderRight: '1px solid #e2e8f0',
                              background: isSelected ? '#dcfce7' : '#fff',
                              cursor: 'crosshair',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <div style={{ width: '100%', height: '24px' }} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <input 
                type="email"
                placeholder={lang === 'es' ? 'Correo de la estilista...' : 'Staff email...'}
                value={emails[staff.id] || ''}
                onChange={(e) => handleEmailChange(staff.id, e.target.value)}
                onBlur={(e) => handleEmailBlur(staff.id, e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '14px',
                  width: '260px',
                  color: '#334155'
                }}
              />
              <button
                onClick={() => handleSendEmail(staff.id, lang === 'es' ? staff.nameEs : staff.nameEn)}
                disabled={sendingEmail[staff.id]}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#334155',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: sendingEmail[staff.id] ? 'not-allowed' : 'pointer',
                  opacity: sendingEmail[staff.id] ? 0.7 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => { if (!sendingEmail[staff.id]) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseOut={(e) => { if (!sendingEmail[staff.id]) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              >
                {sendingEmail[staff.id] ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sendingEmail[staff.id] 
                  ? (lang === 'es' ? 'Enviando...' : 'Sending...') 
                  : (lang === 'es' ? 'Enviar Horario' : 'Send Schedule')
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
