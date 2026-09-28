'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './feedback.module.css';
import { Star, Send, MapPin, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [staff, setStaff] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPositive, setIsPositive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use a generic placeholder, can be updated by the owner later
  const googleMapsUrl = 'https://g.page/r/maria-bonita-salon/review';

  const staffMembers = ['María', 'Brenda', 'Edith', 'Otro'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      // We always send to API to track staff performance, even for 5-star reviews
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, staff }),
      });

      if (res.ok) {
        setSubmitted(true);
        if (rating >= 4) {
          setIsPositive(true);
        } else {
          setIsPositive(false);
        }
      } else {
        alert('Hubo un error al enviar tu comentario. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (comment.trim()) {
      navigator.clipboard.writeText(comment);
      setCopied(true);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDeco}></div>
        <div className={styles.bgDeco2}></div>
        <div className={styles.card}>
          <div className={styles.successMessage}>
            {isPositive ? (
              <>
                <Star size={48} fill="#d4af37" color="#d4af37" className={styles.successIcon} style={{ color: '#d4af37' }} />
                <h1 className={styles.title}>¡Gracias por tu preferencia!</h1>
                <p className={styles.subtitle}>
                  Nos alegra mucho saber que disfrutaste tu experiencia. Tu apoyo es invaluable para nosotros.<br /><br />
                  <strong>¡Ayúdanos compartiéndolo en Google Maps!</strong> Hemos guardado tu texto, solo dale clic a Publicar, luego a "Escribir reseña", y pega tu opinión.
                </p>
                {copied && <div style={{color: '#22c55e', fontSize: '13px', marginBottom: '10px'}}>¡Texto copiado al portapapeles! Listo para pegar.</div>}
                <a onClick={handleGoogleClick} href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.googleBtn}>
                  <MapPin size={20} color="#EA4335" />
                  Publicar en Google Maps
                </a>
              </>
            ) : (
              <>
                <CheckCircle2 size={48} className={styles.successIcon} />
                <h1 className={styles.title}>Gracias por tus comentarios</h1>
                <p className={styles.subtitle}>
                  Lamentamos que tu experiencia no haya sido perfecta. Apreciamos mucho que te tomes el tiempo de decírnoslo.<br /><br />
                  Hemos enviado tu mensaje a gerencia para tomar medidas inmediatamente y mejorar nuestro servicio.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgDeco}></div>
      <div className={styles.bgDeco2}></div>
      
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/maria.png" 
            alt="María Bonita" 
            width={120} 
            height={120} 
            style={{ objectFit: 'contain' }} 
            priority 
          />
        </div>
        
        <h1 className={styles.title}>¿Qué tal tu experiencia?</h1>
        <p className={styles.subtitle}>
          Tu opinión es muy importante para nosotros. Por favor califica tu visita del día de hoy.
        </p>

        <form onSubmit={handleSubmit} className={styles.feedbackForm}>
          
          <select 
            className={styles.textarea} 
            style={{ minHeight: '50px' }}
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            required
          >
            <option value="" disabled>¿Quién te atendió el día de hoy?</option>
            {staffMembers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <div className={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.starBtn} ${(hoverRating || rating) >= star ? styles.active : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={42} 
                  fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} 
                  strokeWidth={1.5} 
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <textarea
              className={styles.textarea}
              placeholder={rating >= 4 ? "¡Nos encantaría saber qué fue lo que más te gustó!" : "Por favor, cuéntanos qué podemos mejorar..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          )}

          {rating > 0 && (
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Enviando...' : (
                <>
                  <Send size={18} />
                  Enviar Calificación
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
