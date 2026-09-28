'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ArrowLeft, 
  Share2, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import styles from './video_headspa.module.css';

const VIDEO_ID = 'hHvbO5poVPU';
const POSTER_IMAGE = `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`;
const WHATSAPP_URL = 'https://wa.me/16126361374?text=Hola%2C%20acabo%20de%20ver%20el%20video%20del%20Japanese%20Head%20Spa%20y%20me%20gustar%C3%ADa%20agendar%20una%20cita.';
const PHONE_NUMBER = '+1 612-345-4187';

export default function VideoHeadSpaPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(55); // Estimated ~55s for Short
  const [showHud, setShowHud] = useState(true);
  const [centralIcon, setCentralIcon] = useState<'play' | 'pause' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rippleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Send command to YouTube iframe via postMessage
  const postYTCommand = useCallback((command: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command,
          args: args,
        }),
        '*'
      );
    }
  }, []);

  // Show toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Reset HUD auto-hide timer
  const resetHudTimer = useCallback(() => {
    setShowHud(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    if (hasStarted && isPlaying) {
      hudTimeoutRef.current = setTimeout(() => {
        setShowHud(false);
      }, 3500);
    }
  }, [hasStarted, isPlaying]);

  // Flash central icon on play/pause tap
  const triggerCentralFeedback = (type: 'play' | 'pause') => {
    setCentralIcon(type);
    if (rippleTimeoutRef.current) clearTimeout(rippleTimeoutRef.current);
    rippleTimeoutRef.current = setTimeout(() => {
      setCentralIcon(null);
    }, 700);
  };

  // Handle start playing from poster
  const handleStartPlay = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsMuted(false);
    
    // Command YouTube to play with sound
    postYTCommand('unMute');
    postYTCommand('playVideo');
    resetHudTimer();
  };

  // Toggle Play / Pause
  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!hasStarted) {
      handleStartPlay();
      return;
    }

    if (isPlaying) {
      postYTCommand('pauseVideo');
      setIsPlaying(false);
      triggerCentralFeedback('pause');
      setShowHud(true);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    } else {
      postYTCommand('playVideo');
      setIsPlaying(true);
      triggerCentralFeedback('play');
      resetHudTimer();
    }
  };

  // Toggle Mute
  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isMuted) {
      postYTCommand('unMute');
      setIsMuted(false);
      triggerToast('Audio activado');
    } else {
      postYTCommand('mute');
      setIsMuted(true);
      triggerToast('Audio silenciado');
    }
    resetHudTimer();
  };

  // Replay from beginning
  const handleReplay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    postYTCommand('seekTo', [0, true]);
    postYTCommand('playVideo');
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    triggerCentralFeedback('play');
    resetHudTimer();
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    postYTCommand('seekTo', [targetTime, true]);
    setProgress(ratio * 100);
    setCurrentTime(targetTime);
    if (!isPlaying) {
      postYTCommand('playVideo');
      setIsPlaying(true);
    }
    resetHudTimer();
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: 'María Bonita - Ritual Japanese Head Spa',
      text: 'Mira el ritual exclusivo de Japanese Head Spa en María Bonita Salon.',
      url: window.location.href,
    };

    if (navigator.share && typeof navigator.canShare === 'function') {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User dismissed or share failed, fallback to copy
        copyUrl();
      }
    } else {
      copyUrl();
    }
  };

  const copyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('¡Enlace copiado al portapapeles!');
    }
  };

  // Listen for YouTube postMessage updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(data.info.currentTime);
            if (duration > 0) {
              setProgress((data.info.currentTime / duration) * 100);
            }
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (typeof data.info.playerState === 'number') {
            // 1 = playing, 2 = paused, 0 = ended
            if (data.info.playerState === 1) setIsPlaying(true);
            if (data.info.playerState === 2) setIsPlaying(false);
            if (data.info.playerState === 0) {
              setIsPlaying(false);
              setProgress(100);
            }
          }
        }
      } catch (e) {
        // Non-JSON message from YT iframe
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [duration]);

  // Fallback timer for smooth progress tracking during active play
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && hasStarted) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.5;
          if (next >= duration) {
            return 0;
          }
          setProgress((next / duration) * 100);
          return next;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, hasStarted, duration]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Ambient background glows */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      {/* Header bar */}
      <header className={styles.headerNav}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Volver al Salón</span>
        </Link>
        <div className={styles.brandPill}>
          <Sparkles size={13} color="#d4af37" />
          <span>María Bonita</span>
        </div>
      </header>

      {/* Titles Section */}
      <section className={styles.titleSection}>
        <div className={styles.tagline}>
          <span>Santuario de Bienestar Capilar</span>
        </div>
        <h1 className={styles.mainTitle}>RITUAL JAPANESE HEAD SPA</h1>
        <p className={styles.subtitle}>
          Sumérgete en la experiencia de relajación, hidroterapia circular y cuidado holístico para tu mente y cuero cabelludo.
        </p>
      </section>

      {/* Main Luxury Video Player */}
      <div 
        ref={playerContainerRef}
        className={styles.playerContainer}
        onClick={() => resetHudTimer()}
        onMouseMove={() => resetHudTimer()}
      >
        {/* Soft aura glow behind frame */}
        <div className={styles.playerAura} />

        {/* Video Iframe with slight scaling to clip native YouTube branding */}
        <div className={styles.iframeWrapper}>
          <iframe
            ref={iframeRef}
            className={styles.videoIframe}
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&loop=1&playlist=${VIDEO_ID}&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`}
            title="María Bonita Japanese Head Spa Ritual"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Tap catcher to intercept video clicks for custom play/pause */}
        {hasStarted && (
          <div 
            className={styles.touchCatcher} 
            onClick={handleTogglePlay} 
          />
        )}

        {/* Central Feedback Ripple */}
        <div className={`${styles.centralRipple} ${centralIcon ? styles.centralRippleActive : ''}`}>
          {centralIcon === 'play' && <Play size={28} fill="#d4af37" />}
          {centralIcon === 'pause' && <Pause size={28} fill="#d4af37" />}
        </div>

        {/* Custom Luxury Poster Cover (Visible until user taps to play) */}
        {!hasStarted && (
          <div 
            className={styles.posterCover}
            style={{ backgroundImage: `url(${POSTER_IMAGE})` }}
            onClick={handleStartPlay}
          >
            <div className={styles.posterScrim} />

            <div className={styles.posterTop}>
              <span className={styles.posterLogo}>MARÍA BONITA</span>
              <span className={styles.posterBadge}>EXPERIENCIA VIP</span>
            </div>

            <div className={styles.posterCenter}>
              <div className={styles.playButtonPulse}>
                <div className={styles.playRing1} />
                <div className={styles.playRing2} />
                <Play size={34} fill="#0b0d10" style={{ marginLeft: '4px' }} />
              </div>
              <div className={styles.playPrompt}>Ver Experiencia Head Spa</div>
              <span className={styles.playHint}>Toca para reproducir con audio</span>
            </div>

            <div className={styles.posterBottom}>
              <p className={styles.posterDescription}>
                Hidroterapia de cascada, diagnóstico con microcámara y masaje craneal Shiatsu.
              </p>
            </div>
          </div>
        )}

        {/* Custom Overlay HUD while playing */}
        {hasStarted && (
          <div className={`${styles.playerHUD} ${!showHud ? styles.hudHidden : ''}`}>
            {/* Top HUD */}
            <div className={styles.hudHeader}>
              <div className={styles.hudTitleBadge}>
                <Sparkles size={12} color="#d4af37" />
                <span>Head Spa Ritual</span>
              </div>
              <button 
                className={styles.hudAudioBtn} 
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Activar audio' : 'Silenciar'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Bottom HUD Controls */}
            <div className={styles.hudFooter}>
              {/* Scrubbable Golden Progress Bar */}
              <div 
                className={styles.progressBarTrack} 
                onClick={handleSeek}
              >
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} 
                />
              </div>

              {/* Action Buttons Row */}
              <div className={styles.hudActionsRow}>
                <div className={styles.hudLeftControls}>
                  <button 
                    className={styles.hudControlBtn} 
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  </button>

                  <button 
                    className={styles.hudControlBtn} 
                    onClick={handleReplay}
                    aria-label="Reiniciar video"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <span className={styles.hudTime}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button 
                  className={styles.hudControlBtn} 
                  onClick={handleToggleFullscreen}
                  aria-label="Pantalla completa"
                >
                  {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons & Details for QR Code Visitors */}
      <section className={styles.actionsContainer}>
        {/* WhatsApp Direct Appointment Booking CTA */}
        <a 
          href={WHATSAPP_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.whatsappBtn}
        >
          <MessageCircle size={20} />
          <span>Agendar Cita por WhatsApp</span>
        </a>

        {/* Secondary Buttons (Call & Share) */}
        <div className={styles.buttonRow}>
          <a href={`tel:${PHONE_NUMBER}`} className={styles.secondaryBtn}>
            <Phone size={16} color="#d4af37" />
            <span>Llamar al Salón</span>
          </a>

          <button onClick={handleShare} className={styles.secondaryBtn}>
            <Share2 size={16} color="#d4af37" />
            <span>Compartir Video</span>
          </button>
        </div>

        {/* Highlights Card */}
        <div className={styles.highlightsCard}>
          <h3 className={styles.cardTitle}>
            <Sparkles size={16} color="#d4af37" />
            <span>¿Qué incluye nuestro ritual?</span>
          </h3>

          <div className={styles.stepsGrid}>
            <div className={styles.stepItem}>
              <div className={styles.stepIconBadge}>01</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>Diagnóstico con Microcámara</div>
                <div className={styles.stepDesc}>Evaluación visual en alta resolución de tu cuero cabelludo y folículos.</div>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepIconBadge}>02</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>Arco de Hidroterapia de Cascada</div>
                <div className={styles.stepDesc}>Circulación continua de agua tibia que calma el sistema nervioso.</div>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepIconBadge}>03</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>Masaje Shiatsu & Estimulación</div>
                <div className={styles.stepDesc}>Digitopuntura en cabeza, cuello y hombros para liberar tensiones.</div>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepIconBadge}>04</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>Vapor Botánico & Mascarilla Orgánica</div>
                <div className={styles.stepDesc}>Apertura de poros y nutrición profunda con aceites esenciales naturales.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Salon Details */}
        <div className={styles.salonCard}>
          <div className={styles.salonAddress}>
            <MapPin size={15} color="#d4af37" />
            <span>María Bonita Salon & Spa • Minneapolis, MN</span>
          </div>
          <div className={styles.salonHours}>
            <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
            <span>Lunes a Sábado con Cita Previa</span>
          </div>
        </div>

        {/* Link to Full Main Website */}
        <Link href="/" className={styles.secondaryBtn} style={{ marginTop: '6px' }}>
          <span>Explorar Catálogo Completo de Servicios</span>
          <ExternalLink size={15} />
        </Link>
      </section>

      {/* Floating Toast Alert */}
      <div className={`${styles.toast} ${showToast ? styles.toastVisible : ''}`}>
        <Check size={16} style={{ display: 'inline', marginRight: '6px' }} />
        {toastMessage}
      </div>
    </div>
  );
}
