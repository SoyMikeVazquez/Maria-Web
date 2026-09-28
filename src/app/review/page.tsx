'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, MapPin } from 'lucide-react';
import styles from './review.module.css';

const STAFF_LIST = ['Brenda', 'Edith', 'María'];
const GOOGLE_MAPS_LINK = 'https://maps.app.goo.gl/bkZduzBWvXRQVaSv5';

export default function ReviewPage() {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedStaff) {
      setError('Por favor selecciona a la persona que te atendió.');
      return;
    }

    setLoading(true);
    setError('');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Error de configuración. Por favor intenta más tarde.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/staff_reviews`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ 
          staff_name: selectedStaff,
          author_name: clientName.trim() || null
        })
      });

      if (!res.ok) {
        throw new Error('No se pudo registrar la reseña');
      }

      // Success, redirect to Google Maps
      window.location.href = GOOGLE_MAPS_LINK;
      
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError('Hubo un error al registrar tu selección. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Image 
          src="/maria.png" 
          alt="María Bonita" 
          width={140} 
          height={140} 
          className={styles.logo}
          priority
        />
        
        <h1 className={styles.title}>Déjanos tu reseña</h1>
        <p className={styles.subtitle}>
          Tu opinión es muy importante para nosotros. Selecciona a la persona que te atendió para dejar tu calificación en Google.
        </p>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.staffGrid}>
          {STAFF_LIST.map((staff) => (
            <div 
              key={staff} 
              className={`${styles.staffCard} ${selectedStaff === staff ? styles.selected : ''}`}
              onClick={() => setSelectedStaff(staff)}
            >
              <div className={styles.avatarWrapper}>
                <User size={24} />
              </div>
              <span className={styles.staffName}>{staff}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'left', width: '100%' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
            Tu nombre (opcional)
          </label>
          <input 
            type="text" 
            placeholder="Ej. Ana García"
            className={styles.nameInput}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={loading}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>Nos ayuda a identificar tu reseña y premiar a tu estilista.</p>
        </div>

        <button 
          className={styles.submitBtn} 
          onClick={handleSubmit}
          disabled={loading || !selectedStaff}
        >
          {loading ? (
            <div className={styles.loadingSpinner} />
          ) : (
            <>
              <MapPin size={20} />
              Ir a Google Maps
            </>
          )}
        </button>
      </div>
    </div>
  );
}
