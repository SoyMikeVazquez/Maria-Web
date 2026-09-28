'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Sparkles,
    Globe,
    Volume2,
    VolumeX,
    Check,
    ChevronRight,
    Droplets,
    Scissors,
    ShieldCheck,
    Zap,
    Heart,
    Compass,
    HelpCircle,
    Clock,
    Waves
} from 'lucide-react';
import { translations } from './translations';
import dynamic from 'next/dynamic';

const SpaScene3D = dynamic(() => import('@/components/SpaScene3D'), { ssr: false });
const BookingScheduler = dynamic(() => import('@/components/BookingScheduler'), { ssr: false });
import styles from './copia.module.css';
import salonStyles from './page.module.css';

// --- Web Audio Synthesizer for Gaming Sound Effects (Zero External Asset Overhead) ---
class GameSoundFX {
    private ctx: AudioContext | null = null;
    public enabled: boolean = true;

    private getContext() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    // Soft UI Hover Click
    playHover() {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch {
        }
    }

    // Relaxing Realm Selection Sound
    playSelect(isSpa: boolean) {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            // Relaxing sound design
            // Spa: ethereal, watery, deep ambient chord
            // Salon: elegant, warm, welcoming chord
            const notes = isSpa ? [261.63, 329.63, 392.00, 523.25] : [349.23, 440.00, 523.25, 698.46];

            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine'; // Sine is always most relaxing
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0, now);

                if (isSpa) {
                    // Spa: very slow, breathing-like swell
                    gain.gain.linearRampToValueAtTime(0.06, now + 0.5 + idx * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5 + idx * 0.2);
                    osc.start(now);
                    osc.stop(now + 2.5 + idx * 0.2);
                } else {
                    // Salon: elegant harp/chime like but soft
                    gain.gain.linearRampToValueAtTime(0.08, now + 0.1 + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + idx * 0.1);
                    osc.start(now + idx * 0.05);
                    osc.stop(now + 1.5 + idx * 0.1);
                }

                osc.connect(gain);
                gain.connect(ctx.destination);
            });
        } catch {
            // Audio context error handle
        }
    }
}

const sfx = new GameSoundFX();

// Social Icons
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.617a8.171 8.171 0 0 0 3.77 1.233V6.686z" />
    </svg>
);

// Services Data for Salon
const services = [
    {
        title: "HAIRSTYLES AND BLOWOUTS",
        desc: "Let us bring your dream hair to life. Whether you desire sleek, defined curls or voluminous waves, we are ready to make it happen.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/697949cd67c65db623ac0133_30.jpg"
    },
    {
        title: "HAIR BLEACHING",
        desc: "We all need a change from time to time, and a new color is the perfect way to start. We treat your hair with the utmost care and precision during this delicate process to ensure stunning, healthy results.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/697949cd597a8a073b9a7a4e_29.jpg"
    },
    {
        title: "BELLAMI HAIR EXTENSIONS CERTIFIED",
        desc: "Dreaming of spectacularly long, beautiful hair? Our high-quality extensions are the perfect solution. Let us help you select the best type and style to blend seamlessly with your natural look.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/697949cde3965edaa0d284ce_31.jpg"
    },
    {
        title: "SMOOTHING TREATMENTS",
        desc: "Silky, healthy hair is not only beautiful but easier to manage. Our smoothing treatments provide deep renewal and freshness, leaving your hair soft, shiny, and revitalized.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/697949cd7adf4486b8af6949_32.jpg"
    },
    {
        title: "HAIRCUTS",
        desc: "Short? Long! Rounded or layered. We'll study your profile and enhance your style, as well as presentation.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/697949cd4d8fe6a9b2d72dbc_33.jpg"
    },
    {
        title: "PROFESSIONAL MAKEUP",
        desc: "You'll look so stunning, you'll turn heads everywhere you go.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/697949cdde876533e712dd4c_35.jpg"
    },
    {
        title: "EYELASH DESIGN",
        desc: "Whether you want a bold, dramatic look or something soft and natural, our eyelash designs frame your eyes perfectly to achieve the expression you desire.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/697949cdeb2ce9c772a61ed9_34.jpg"
    },
    {
        title: "EYEBROW DESIGN",
        desc: "Your eyebrows speak volumes about your personality. Let us craft the perfect shape to frame your face; every detail counts.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/69794d3663577f35e69cd0bd_Dise%C3%B1o%20sin%20t%C3%ADtulo.jpg"
    },
    {
        title: "FULL FACIAL SERVICE",
        desc: "We use only top-tier products designed to protect and nourish your hair and lashes.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/65bd72fa24b5a3b84f5e9f8b_Dise%C3%B1o%20sin%20t%C3%ADtulo%20(31).jpg"
    }
];

const blogPosts = [
    {
        title: "Todo lo que necesitas saber de las extensiones de cabello",
        snippet: "Alguna vez te has preguntado cómo algunas celebridades logran cambiar su aspecto de la noche a la mañana.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/65249ef06ae5ef842923f3eb_Todo%20lo%20que%20nececitas%20saber%20de%20extensiones%20Maria%20Bonita%20Photos.jpg",
        link: "https://mariabonitabeautysalon.com/todo-lo-que-necesitas-sabes-de-las-extensiones-de-cabello/"
    },
    {
        title: "Decoloración de cabello: conoce todo acerca de la decoloración",
        snippet: "La decoloración capilar, ya sea en cabello natural o teñido, es uno de los servicios más populares en los salones.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/65249fd36ae5ef842924e440_Decoloracion%20capilar%20Maria%20Bonita.jpg",
        link: "https://mariabonitabeautysalon.com/decoloracion-de-cabello-conoce-todo-acerca-de-la-decoloracion/"
    },
    {
        title: "Consigue una barba más atractiva con estos estilos",
        snippet: "El pionero de todos los estilos de barba, la barba completa es una amalgama de patillas completas.",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/6524a0201124ac5d65306f01_Barbas%20Maria%20Bonita%20Minnepolis.jpg",
        link: "https://mariabonitabeautysalon.com/consigue-una-barba-mas-atractiva-con-estos-estilos/"
    },
    {
        title: "Decolorar cabello rojo: lo que necesitas saber",
        snippet: "¡Despierta tu lado atrevido con la decoloración de cabello rojo y déjate envolver por la intensidad y el encanto de este tono audaz!",
        img: "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/6524a0bdafb54a2e3c233ec6_Decoloracion%20de%20cabello%20rojo%20Maria%20Bonita%20Salon%20Minnepolis.jpg",
        link: "https://mariabonitabeautysalon.com/decolorar-cabello-rojo-lo-que-necesitas-saber/"
    }
];

export default function CopiaPage() {
    // Experience Mode: 'salon' | 'spa' | null (gated initial state)
    const [activeMode, setActiveMode] = useState<'salon' | 'spa' | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [lang, setLang] = useState<'en' | 'es'>('es');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string | null>(null);
    const [selectedNailImage, setSelectedNailImage] = useState<string | null>(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Run observer whenever activeMode changes so elements are found after mounting
    useEffect(() => {
        if (!activeMode) return;

        // Scroll Reveal Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            },
            { threshold: 0.05 }
        );

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach((el) => observer.observe(el));

        return () => {
            revealElements.forEach((el) => observer.unobserve(el));
        };
    }, [activeMode]);
    // Diagnostic tool state
    const [diagScalp, setDiagScalp] = useState<string | null>(null);
    const [diagStress, setDiagStress] = useState<string | null>(null);

    // Sliders for salon mode
    const [aboutIndex, setAboutIndex] = useState(0);
    const [assistIndex, setAssistIndex] = useState(0);
    const [spaIndex, setSpaIndex] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const t = translations[lang];

    const aboutImages = [
        "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/6978e3758633e24c739d19eb_Gemini_Generated_Image_clm6hgclm6hgclm6.jpg",
        "https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/6978e377d9dbb24edb7cd475_pexels-olia-danilevich-4723182-2.jpg"
    ];

    const assistImages = [
        "/maria_melissa.jpeg"
    ];

    const melissaImages = [
        "/melissa/Unknown-2.jpg",
        "/melissa/Unknown-5.jpg",
        "/melissa/dss.jpg",
        "/melissa/ss.jpg"
    ];

    // Dynamic particle canvas backdrop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Particle system
        interface Particle {
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;
            alpha: number;
            dAlpha: number;
        }

        const particles: Particle[] = [];
        const particleCount = 45;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.5 + 0.8,
                vx: (Math.random() - 0.5) * 0.4,
                vy: activeMode === 'spa' ? -Math.random() * 0.6 - 0.2 : (Math.random() - 0.5) * 0.5,
                alpha: Math.random() * 0.5 + 0.2,
                dAlpha: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha += p.dAlpha;

                if (p.alpha <= 0.1 || p.alpha >= 0.8) p.dAlpha *= -1;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                if (activeMode === 'spa') {
                    ctx.fillStyle = `rgba(45, 212, 191, ${p.alpha})`;
                } else {
                    ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
                }
                ctx.fill();
            });

            animId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
        };
    }, [activeMode]);

    // Mode change handler
    const handleModeSwitch = (mode: 'salon' | 'spa') => {
        sfx.playSelect(mode === 'spa');
        setActiveMode(mode);
        setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 120);
    };

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        sfx.enabled = next;
        if (next) sfx.playHover();
    };

    const handleBookService = (serviceName?: string) => {
        sfx.playHover();
        if (serviceName) setSelectedServiceForBooking(serviceName);
        setIsBookingOpen(true);
    };

    const nextAbout = () => setAboutIndex((prev) => (prev + 1) % aboutImages.length);
    const prevAbout = () => setAboutIndex((prev) => (prev - 1 + aboutImages.length) % aboutImages.length);

    const nextAssist = () => setAssistIndex((prev) => (prev + 1) % assistImages.length);
    const prevAssist = () => setAssistIndex((prev) => (prev - 1 + assistImages.length) % assistImages.length);

    const nextSpa = () => setSpaIndex((prev) => (prev + 1) % t.spa.slides.length);
    const prevSpa = () => setSpaIndex((prev) => (prev - 1 + t.spa.slides.length) % t.spa.slides.length);

    // 7-step ritual definitions
    const ritualSteps = lang === 'es' ? [
        {
            num: "01",
            duration: "10 MIN",
            title: "Diagnóstico Capilar & Escaneo Microcópico",
            desc: "Evaluamos a fondo tu cuero cabelludo con cámara de alta definición para identificar nivel de sebo, hidratación y folículos.",
            sensory: "🔬 Diagnóstico Científico Personalizado"
        },
        {
            num: "02",
            duration: "15 MIN",
            title: "Sauna de Vapor Botánico & Desintoxicación",
            desc: "Micro-niebla de vapor tibio enriquecida con aceites esenciales botánicos que abre los poros y suaviza impurezas acumuladas.",
            sensory: "🌿 Aromaterapia & Vapor Tibio Relajante"
        },
        {
            num: "03",
            duration: "15 MIN",
            title: "Exfoliación Profunda & Peeling de Cuero Cabelludo",
            desc: "Limpieza exfoliante purificante que remueve residuos químicos, siliconas y células muertas, devolviendo oxigenación pura.",
            sensory: "✨ Sensación de Frescura & Ligereza Total"
        },
        {
            num: "04",
            duration: "20 MIN",
            title: "Hidroterapia Circular Water Halo (ASMR Cascada)",
            desc: "El icónico anillo de lluvia japonés con flujo constante de agua a temperatura perfecta que envuelve tus sentidos y calma la mente.",
            sensory: "🌊 Sonido ASMR de Cascada & Masaje Acuático"
        },
        {
            num: "05",
            duration: "15 MIN",
            title: "Masaje Shiatsu en Cuero Cabelludo, Cuello y Hombros",
            desc: "Presiones en puntos clave de acupuntura japonesa para liberar tensión cervical, migrañas y estrés acumulado.",
            sensory: "💆 Acupresión Liberadora de Estrés"
        },
        {
            num: "06",
            duration: "10 MIN",
            title: "Facial Express de Hidratación & Mascarilla Glow",
            desc: "Mientras actúan los nutrientes capilares, consentimos tu rostro con limpieza suave, mascarilla hidratante y masaje facial.",
            sensory: "🌸 Piel Renovada, Fresca y Luminosa"
        },
        {
            num: "07",
            duration: "10 MIN",
            title: "Infusión Nutritiva & Brushing de Seda",
            desc: "Sellado de cutícula con tónico fortalecedor y secado suave con brillo sedoso e hidratación duradera.",
            sensory: "💎 Cabello Radiante, Fuerte y Suave"
        }
    ] : [
        {
            num: "01",
            duration: "10 MIN",
            title: "Microscopic Scalp & Follicle Diagnostic",
            desc: "High-definition trichoscopy camera scan to examine sebum levels, follicle health, and specific scalp needs.",
            sensory: "🔬 Personalized Scientific Analysis"
        },
        {
            num: "02",
            duration: "15 MIN",
            title: "Botanical Herbal Steam Sauna",
            desc: "Warm micro-mist sauna infused with organic essential oils to open pores and soften stubborn product buildup.",
            sensory: "🌿 Soothing Aromatherapy & Steam"
        },
        {
            num: "03",
            duration: "15 MIN",
            title: "Deep Exfoliating Scalp Peeling",
            desc: "Gentle purifying detox that removes product buildup, pollutants, and dead skin cells to restore pure oxygenation.",
            sensory: "✨ Instant Freshness & Weightlessness"
        },
        {
            num: "04",
            duration: "20 MIN",
            title: "Circular Water Halo Hydrotherapy (ASMR Waterfall)",
            desc: "The signature Japanese water halo ring delivering rhythmic, continuous warm water cascades over the crown.",
            sensory: "🌊 ASMR Waterfall Sounds & Hydro-Massage"
        },
        {
            num: "05",
            duration: "15 MIN",
            title: "Shiatsu Acupressure for Scalp, Neck & Shoulders",
            desc: "Targeted Japanese acupressure techniques to release tension, soothe headaches, and calm the nervous system.",
            sensory: "💆 Deep Tension & Stress Release"
        },
        {
            num: "06",
            duration: "10 MIN",
            title: "Express Glow Facial & Botanical Mask",
            desc: "While scalp nutrients absorb, we nourish your face with a hydrating cleansing, antioxidant mask, and light facial massage.",
            sensory: "🌸 Glowing, Hydrated & Dewy Skin"
        },
        {
            num: "07",
            duration: "10 MIN",
            title: "Nutrient Seal Infusion & Silk Blow-Dry",
            desc: "Cuticle sealing with botanical scalp toner followed by a gentle blow-dry for radiant, weightless shine.",
            sensory: "💎 Ultra-Soft, Silky & Revitalized Hair"
        }
    ];


    // Head Spa FAQs
    const spaFaqs = lang === 'es' ? [
        {
            q: "¿En qué se diferencia el Head Spa de un lavado de cabello convencional?",
            a: "El Head Spa japonés es una terapia holística para la salud del cuero cabelludo y el sistema nervioso. Incluye diagnóstico microscópico, vapor botánico, exfoliación profunda de folículos, hidroterapia circular continua 'Water Halo' y masaje acupresor Shiatsu que alivia dolores de cabeza y estrés crónico."
        },
        {
            q: "¿Es adecuado si tengo extensiones o cabello decolorado?",
            a: "¡Totalmente! Personalizamos cada producto y técnica para proteger tus extensiones y tratar suavemente cabellos procesados químicamente, nutriendo la fibra capilar desde la raíz."
        },
        {
            q: "¿Con qué frecuencia se recomienda realizar un Head Spa?",
            a: "Para mantener una salud óptima del cuero cabelludo y prevenir la caída o acumulación de sebo, recomendamos una sesión cada 3 a 4 semanas. Sin embargo, una sola sesión brinda alivio y relajación inmediata."
        },
        {
            q: "¿Qué debo traer a mi cita de Head Spa?",
            a: "Solo tus ganas de relajarte. Nosotros proveemos batas cómodas, toallas premium de algodón y productos orgánicos de alta gama. Puedes venir con cualquier peinado o producto, ya que iniciaremos con un diagnóstico y limpieza completa."
        }
    ] : [
        {
            q: "How is a Japanese Head Spa different from a regular salon hair wash?",
            a: "A Japanese Head Spa is a holistic clinical and relaxation therapy for your scalp and nervous system. It combines microscopic analysis, herbal steam sauna, deep follicular peeling, continuous circular 'Water Halo' hydrotherapy, and Shiatsu acupressure that melts away neck tension and stress."
        },
        {
            q: "Can I get a Head Spa if I have hair extensions or color-treated hair?",
            a: "Absolutely! We adapt our botanical serums and pressure techniques to be 100% safe for extensions and bleached/color-treated hair, infusing moisture without compromising bonding."
        },
        {
            q: "How often should I book a Head Spa treatment?",
            a: "For optimal scalp health and stress management, we recommend visiting every 3 to 4 weeks. However, even a single visit delivers instant mental relief, follicular cleansing, and silky hair."
        },
        {
            q: "What should I bring or wear to my Head Spa session?",
            a: "Just yourself! We provide plush luxury robes, cozy blankets, and top-tier organic scalp care. You don't need to wash or prepare your hair beforehand; we begin with our full diagnosis."
        }
    ];

    return (
        <div className={`${styles.copiaContainer} ${activeMode === 'spa' ? styles.spaTheme : styles.salonTheme}`}>
            {/* Dynamic Particle Canvas */}
            <canvas ref={canvasRef} className={styles.canvasBackground} />

            {/* Radiant Glow Lights */}
            <div className={`${styles.heroGlowOrb1} ${activeMode === 'spa' ? styles.spaOrb : styles.salonOrb}`} />

            {/* ====================================================================
          STICKY TOP HUD & NAVIGATION
          ==================================================================== */}
            {activeMode !== 'salon' && (
                <header className={`${styles.stickyNav} ${activeMode === 'spa' ? styles.spaNav : styles.salonNav}`}>
                    <div className={styles.navLeft}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <a href="https://www.instagram.com/maria_bonitabeautysalon/" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.8, color: '#fff' }}>
                                <InstagramIcon size={16} />
                            </a>
                            <a href="https://www.facebook.com/barrientostony/" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.8, color: '#fff' }}>
                                <FacebookIcon size={16} />
                            </a>
                            <a href="https://www.tiktok.com/@mariabonitabeautysalon_" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.8, color: '#fff' }}>
                                <TikTokIcon size={16} />
                            </a>
                        </div>
                    </div>

                    {/* HUD Controls (Language, Quick Booking) */}
                    <div className={styles.navRight}>

                        <button
                            onClick={() => {
                                sfx.playHover();
                                setLang(lang === 'en' ? 'es' : 'en');
                            }}
                            className={styles.hudButton}
                        >
                            <Globe size={15} />
                            <span>{lang.toUpperCase()}</span>
                        </button>

                        <button
                            onClick={() => handleBookService()}
                            className={styles.hudButton}
                            style={{
                                background: activeMode === 'spa' ? 'linear-gradient(135deg, #2dd4bf, #0f766e)' : 'linear-gradient(135deg, #d4af37, #9e8a30)',
                                color: '#000',
                                fontWeight: 800,
                                border: 'none'
                            }}
                        >
                            <Sparkles size={14} />
                            <span>{lang === 'es' ? 'RESERVAR' : 'BOOK NOW'}</span>
                        </button>
                    </div>
                </header>
            )}

            {/* ====================================================================
          HERO: GAMER-STYLE REALM SELECTOR (DUAL EXPERIENCE SELECTOR)
          ==================================================================== */}
            <section className={styles.gameHero}>
                <div className={styles.heroHeaderHUD}>
                    <div className={styles.heroMissionTag}>
                        <Zap size={13} color={activeMode === 'spa' ? '#2dd4bf' : '#d4af37'} />
                        <span>{lang === 'es' ? 'DOS EXPERIENCIAS EN UN MISMO LUGAR' : 'CHOOSE YOUR REALM'}</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        MARÍA BONITA EXPERIENCE
                    </h1>
                </div>

                {/* Dual Portal Cards */}
                <div className={styles.selectorContainer}>
                    {/* Card 1: Salon Mode */}
                    <div
                        className={`${styles.realmCard} ${styles.salonCardHover} ${activeMode === 'salon' ? styles.salonCardActive : ''}`}
                        onClick={() => handleModeSwitch('salon')}
                        onMouseEnter={() => sfx.playHover()}
                    >
                        <Image
                            src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/68080649ea5bed18dbac3d86_m666.jpg"
                            alt="Salon"
                            fill
                            priority
                            className={`${styles.cardBgImage}`}
                            style={{ objectFit: 'cover' }}
                        />
                        <div className={styles.cardGradient} />
                        <div className={styles.cardScanline} />

                        <div className={styles.cardContent}>
                            <div className={styles.cardHeaderRow}>
                                <span className={styles.cardSlotNumber}>REALM [ 01 ]</span>
                                <span className={`${styles.cardClassBadge} ${styles.salonClassBadge}`}>
                                    {lang === 'es' ? 'ALTA COSTURA CAPILAR' : 'HAIR COUTURE'}
                                </span>
                            </div>

                            <h2 className={styles.cardTitle}>
                                {lang === 'es' ? 'BEAUTY SALON' : 'BEAUTY SALON'}
                            </h2>
                            <p className={styles.cardDesc}>
                                {lang === 'es'
                                    ? 'Diseño de color, decoloración magistral, extensiones certificadas Bellami, cortes y peinados de pasarela.'
                                    : 'Master color transformation, Bellami hair extensions, balayage, smoothing and couture styling.'}
                            </p>

                            {/* Gamer Stats */}
                            <div className={styles.cardStatsGrid}>
                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>{lang === 'es' ? 'TRANSFORMACIÓN' : 'TRANSFORMATION'}</span>
                                    <div className={styles.statBarContainer}>
                                        <div className={styles.statBarFillSalon} style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>{lang === 'es' ? 'SALUD CAPILAR' : 'HAIR HEALTH'}</span>
                                    <div className={styles.statBarContainer}>
                                        <div className={styles.statBarFillSalon} style={{ width: '95%' }} />
                                    </div>
                                </div>
                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>{lang === 'es' ? 'GLAMOUR' : 'GLAMOUR'}</span>
                                    <div className={styles.statBarContainer}>
                                        <div className={styles.statBarFillSalon} style={{ width: '100%' }} />
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`${styles.cardActionBtn} ${styles.salonActionBtn}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleModeSwitch('salon');
                                }}
                            >
                                <Scissors size={16} />
                                <span>{activeMode === 'salon' ? (lang === 'es' ? 'EXPLORANDO SALÓN' : 'CURRENTLY EXPLORING') : (lang === 'es' ? 'ENTRAR AL SALÓN' : 'ENTER SALON')}</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Japanese Head Spa Mode */}
                    <div
                        className={`${styles.realmCard} ${styles.spaCardHover} ${activeMode === 'spa' ? styles.spaCardActive : ''}`}
                        onClick={() => handleModeSwitch('spa')}
                        onMouseEnter={() => sfx.playHover()}
                    >
                        <Image
                            src="/spa/spa.jpeg"
                            alt="Japanese Head Spa"
                            fill
                            priority
                            className={`${styles.cardBgImage}`}
                            style={{ objectFit: 'cover' }}
                        />
                        <div className={styles.cardGradient} />
                        <div className={styles.cardScanline} />

                        <div className={styles.cardContent}>
                            <div className={styles.cardHeaderRow}>
                                <span className={styles.cardSlotNumber}>REALM [ 02 ]</span>
                                <span className={`${styles.cardClassBadge} ${styles.spaClassBadge}`}>
                                    {lang === 'es' ? 'SANTUARIO HOLÍSTICO' : 'ZEN SANCTUARY'}
                                </span>
                            </div>

                            <h2 className={styles.cardTitle}>
                                {lang === 'es' ? 'JAPANESE HEAD SPA' : 'JAPANESE HEAD SPA'}
                            </h2>
                            <p className={styles.cardDesc}>
                                {lang === 'es'
                                    ? 'Terapia capilar japonesa, hidroterapia Water Halo, sauna de vapor botánico, masaje Shiatsu y desintoxicación.'
                                    : 'Japanese scalp therapy, ASMR Water Halo hydrotherapy, herbal steam mist, Shiatsu acupressure & express facial.'}
                            </p>

                            {/* Gamer Stats */}
                            <div className={styles.cardStatsGrid}>
                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>{lang === 'es' ? 'RELAJACIÓN ZEN' : 'DEEP ZEN'}</span>
                                    <div className={styles.statBarContainer}>
                                        <div className={styles.statBarFillSpa} style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>{lang === 'es' ? 'DETOX CUERO CABELLUDO' : 'SCALP DETOX'}</span>
                                    <div className={styles.statBarContainer}>
                                        <div className={styles.statBarFillSpa} style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>{lang === 'es' ? 'WATER HALO ASMR' : 'WATER HALO'}</span>
                                    <div className={styles.statBarContainer}>
                                        <div className={styles.statBarFillSpa} style={{ width: '98%' }} />
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`${styles.cardActionBtn} ${styles.spaActionBtn}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleModeSwitch('spa');
                                }}
                            >
                                <Droplets size={16} />
                                <span>{activeMode === 'spa' ? (lang === 'es' ? 'EXPLORANDO HEAD SPA' : 'CURRENTLY EXPLORING') : (lang === 'es' ? 'ENTRAR AL HEAD SPA' : 'ENTER HEAD SPA')}</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====================================================================
          MODE CONTENT: HEAD SPA DEDICATED OR SALON EXPERIENCE
          ==================================================================== */}
            {activeMode && (
                <div id="experience-content" ref={contentRef} style={{ width: '100%', scrollMarginTop: '80px' }}>
                    {activeMode === 'spa' && (
                        <main className={styles.headSpaExperience}>

                                {/* Head Spa Hero Banner (Copied from Salon Hero) */}
                                <main id="home" className={salonStyles.hero} style={{ minHeight: '80vh' }}>
                                    <div className={salonStyles.backgroundImage} style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/spa_hero.jpeg')" }}></div>



                                <div className={salonStyles.heroContent}>
                                    <div className={salonStyles.marqueeContainerTop}>
                                        <div className={salonStyles.marqueeContentReverse}>
                                            <span className={salonStyles.mainHeading}>{lang === 'es' ? 'SANTUARIO DE BIENESTAR JAPONÉS' : 'JAPANESE WELLNESS SANCTUARY'}</span>
                                            <span className={salonStyles.mainHeading}>{lang === 'es' ? 'SANTUARIO DE BIENESTAR JAPONÉS' : 'JAPANESE WELLNESS SANCTUARY'}</span>
                                            <span className={salonStyles.mainHeading}>{lang === 'es' ? 'SANTUARIO DE BIENESTAR JAPONÉS' : 'JAPANESE WELLNESS SANCTUARY'}</span>
                                        </div>
                                    </div>

                                    <div className={salonStyles.marqueeContainer}>
                                        <div className={salonStyles.marqueeContent}>
                                            <span className={salonStyles.marqueeText}>{lang === 'es' ? 'EL ARTE SAGRADO DEL HEAD SPA ' : 'THE SACRED ART OF HEAD SPA '}</span>
                                            <span className={salonStyles.marqueeText}>{lang === 'es' ? 'EL ARTE SAGRADO DEL HEAD SPA ' : 'THE SACRED ART OF HEAD SPA '}</span>
                                        </div>
                                    </div>

                                    <button onClick={() => handleBookService('Head Spa')} className={salonStyles.ctaButton}>
                                        {lang === 'es' ? 'AGENDAR HEAD SPA' : 'BOOK HEAD SPA'}
                                    </button>
                                </div>
                            </main>

                            {/* 3D Spa Highlight Section */}
                            <section id="spa" className={`${salonStyles.spaSection} reveal`}>
                                <div className={salonStyles.spaSubtitle}>{t.spa.subtitle}</div>
                                <div className={salonStyles.spaContent}>
                                    <div className={salonStyles.spaTextContainer}>
                                        <div key={spaIndex} className={salonStyles.animateSlide}>
                                            <h2 className={salonStyles.slideHeading}>
                                                {t.spa.slides[spaIndex].title}
                                            </h2>
                                            <p className={salonStyles.slideDesc}>
                                                {t.spa.slides[spaIndex].desc}
                                            </p>

                                            {t.spa.slides[spaIndex].type === 'concept' ? (
                                                <>
                                                    <h3 className={salonStyles.benefitsTitle}>
                                                        {t.spa.slides[spaIndex].benefitsTitle}
                                                    </h3>
                                                    <div className={salonStyles.benefitsGrid}>
                                                        {t.spa.slides[spaIndex].benefits?.map((benefit: string, idx: number) => (
                                                            <div
                                                                key={idx}
                                                                className={salonStyles.benefitItem}
                                                                style={{ animationDelay: `${0.22 + idx * 0.04}s` }}
                                                            >
                                                                <Sparkles size={14} className={salonStyles.benefitIcon} />
                                                                <span>{benefit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {t.spa.slides[spaIndex].footer && (
                                                        <p
                                                            className={salonStyles.slideFooter}
                                                            style={{ animationDelay: `${0.22 + (t.spa.slides[spaIndex].benefits?.length || 0) * 0.04}s` }}
                                                        >
                                                            {t.spa.slides[spaIndex].footer}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className={salonStyles.stepsTitle}>
                                                        {t.spa.slides[spaIndex].stepsTitle}
                                                    </h3>
                                                    <div className={salonStyles.stepsList}>
                                                        {t.spa.slides[spaIndex].steps?.map((step: string, idx: number) => (
                                                            <div
                                                                key={idx}
                                                                className={salonStyles.stepItem}
                                                                style={{ animationDelay: `${0.22 + idx * 0.04}s` }}
                                                            >
                                                                <span className={salonStyles.stepNumber}>{idx + 1}.</span>
                                                                <span>{step}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Slider controls (Dots and Arrows) */}
                                        <div className={salonStyles.spaSliderControls}>
                                            <div className={salonStyles.spaIndicatorDots}>
                                                {t.spa.slides.map((_: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className={`${salonStyles.spaDot} ${spaIndex === idx ? salonStyles.spaDotActive : ""
                                                            }`}
                                                        onClick={() => setSpaIndex(idx)}
                                                    />
                                                ))}
                                            </div>
                                            <div className={salonStyles.spaArrowButtons}>
                                                <button
                                                    onClick={prevSpa}
                                                    className={salonStyles.spaArrowBtn}
                                                    aria-label="Previous Slide"
                                                >
                                                    ‹
                                                </button>
                                                <button
                                                    onClick={nextSpa}
                                                    className={salonStyles.spaArrowBtn}
                                                    aria-label="Next Slide"
                                                >
                                                    ›
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={salonStyles.spa3DWrapper}>
                                        <SpaScene3D />
                                    </div>
                                </div>
                            </section>



                            {/* THE 7-STEP JAPANESE RITUAL */}
                            <section id="ritual" className={styles.ritualSection}>
                                <div className={styles.sectionHeaderCenter}>
                                    <div className={styles.sectionCategoryLabel}>
                                        {lang === 'es' ? 'EL PROTOCOLO IMPERIAL' : 'THE IMPERIAL PROTOCOL'}
                                    </div>
                                    <h2 className={styles.sectionMainHeading}>
                                        {lang === 'es' ? 'EL RITUAL DE 7 PASOS' : 'THE 7-STEP RITUAL'}
                                    </h2>
                                    <p className={styles.sectionLeadText}>
                                        {lang === 'es'
                                            ? 'Cada etapa está diseñada para purificar, desintoxicar y llevar tu cuerpo a un estado de relajación profunda.'
                                            : 'Every phase is crafted to detoxify, nourish, and guide your body into profound zen relaxation.'}
                                    </p>
                                </div>

                                <div className={styles.ritualGrid}>
                                    {ritualSteps.map((step, idx) => (
                                        <div key={idx} className={styles.ritualCard}>
                                            <div className={styles.ritualStepHeader}>
                                                <span className={styles.ritualNumber}>{step.num}</span>

                                            </div>
                                            <h3 className={styles.ritualCardTitle}>{step.title}</h3>
                                            <p className={styles.ritualCardDesc}>{step.desc}</p>
                                            <div className={styles.ritualSensoryPill}>
                                                <span>{step.sensory}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* NAIL SPA MENU IN HEAD SPA */}
                            <section className={styles.nailMenuSection}>
                                <div className={styles.sectionHeaderCenter}>
                                    <div className={styles.sectionCategoryLabel}>
                                        {lang === 'es' ? 'SERVICIOS COMPLEMENTARIOS' : 'COMPLEMENTARY SERVICES'}
                                    </div>
                                    <h2 className={styles.sectionMainHeading}>
                                        MARÍA BONITA NAIL SPA MENU
                                    </h2>
                                    <p className={styles.sectionLeadText} style={{ marginBottom: '4rem' }}>
                                        {lang === 'es'
                                            ? 'Complementa tu relajación con nuestros servicios premium de cuidado de uñas.'
                                            : 'Complement your relaxation with our premium nail care services.'}
                                    </p>
                                </div>

                                <div className={styles.nailMenuContainer}>
                                    <div className={styles.nailMenuGrid}>
                                        {/* Manicures */}
                                        <div className={styles.nailCategory}>
                                            <h3 className={styles.nailCategoryTitle}>
                                                <Sparkles size={24} />
                                                MANICURES
                                            </h3>
                                            <div className={styles.nailItemList}>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Manicure Express</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Limpieza de uñas, corte, limado, cuidado de cutícula y esmalte regular.' : 'Nail cleaning, trimming, shaping, cuticle care, and regular polish.'}</p>
                                                </div>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Signature Manicure</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Todo lo anterior + exfoliación de manos, masaje hidratante y toalla caliente.' : 'All of the above + hand exfoliation, hydrating massage, and hot towel.'}</p>
                                                </div>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Gel Manicure</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Manicure completa con aplicación de gel polish.' : 'Full manicure with gel polish application.'}</p>
                                                </div>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Luxury Gel Manicure</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Gel manicure + exfoliación, mascarilla hidratante, toallas calientes y masaje relajante.' : 'Gel manicure + exfoliation, hydrating mask, hot towels, and relaxing massage.'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pedicures */}
                                        <div className={styles.nailCategory}>
                                            <h3 className={styles.nailCategoryTitle}>
                                                <Waves size={24} />
                                                PEDICURES
                                            </h3>
                                            <div className={styles.nailItemList}>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Pedicure Express</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Remojo, corte y limado, cuidado de cutícula y esmalte regular.' : 'Soak, trim and shape, cuticle care, and regular polish.'}</p>
                                                </div>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Signature Pedicure</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Pedicure completa + exfoliación, masaje relajante y toallas calientes.' : 'Full pedicure + exfoliation, relaxing massage, and hot towels.'}</p>
                                                </div>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Luxury Spa Pedicure</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Pedicure Signature + mascarilla hidratante, piedras caliente y masaje extendido.' : 'Signature Pedicure + hydrating mask, hot stones, and extended massage.'}</p>
                                                </div>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Maria Bonita Royal Pedicure</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Remojo aromático, exfoliación profunda, mascarilla nutritiva, piedras calientes, toallas calientes, masaje de pies y pantorrillas y bebida de cortesía.' : 'Aromatic soak, deep exfoliation, nourishing mask, hot stones, hot towels, foot and calf massage, and complimentary drink.'}</p>
                                                </div>
                                                <div className={styles.nailItem}>
                                                    <div className={styles.nailItemHeader}>
                                                        <span className={styles.nailItemName}>Royal Gel Pedicure</span>
                                                        <div className={styles.nailItemDots}></div>
                                                    </div>
                                                    <p className={styles.nailItemDesc}>{lang === 'es' ? 'Royal Pedicure + gel polish.' : 'Royal Pedicure + gel polish.'}</p>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Uñas / Extensiones */}
                                        <div className={styles.nailCategory}>
                                            <h3 className={styles.nailCategoryTitle}>
                                                <Check size={24} />
                                                {lang === 'es' ? 'UÑAS / EXTENSIONES' : 'NAILS / EXTENSIONS'}
                                            </h3>
                                            <div className={styles.nailCompactGrid}>
                                                <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Gel X Full Set</span></div>
                                                <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Acrylic Full Set</span></div>
                                                <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Acrylic Fill</span></div>
                                                <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Dip Powder</span></div>
                                                <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Builder Gel Overlay</span></div>
                                                <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Hard Gel Full Set</span></div>
                                            </div>
                                        </div>

                                        {/* Diseños & Add-ons */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div className={styles.nailCategory}>
                                                <h3 className={styles.nailCategoryTitle}>
                                                    <Sparkles size={24} />
                                                    {lang === 'es' ? 'DISEÑOS' : 'DESIGNS'}
                                                </h3>
                                                <div className={styles.nailCompactGrid}>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>French Design</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Chrome</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Cat Eye</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Nail Art Sencillo' : 'Simple Nail Art'}</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Nail Art Avanzado' : 'Advanced Nail Art'}</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Piedras y Cristales' : 'Stones and Crystals'}</span></div>
                                                </div>
                                            </div>

                                            <div className={styles.nailCategory}>
                                                <h3 className={styles.nailCategoryTitle}>
                                                    <Check size={24} />
                                                    ADD-ONS
                                                </h3>
                                                <div className={styles.nailCompactGrid}>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Gel Upgrade</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Parafina Manos' : 'Paraffin Hands'}</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Parafina Pies' : 'Paraffin Feet'}</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Masaje Extra (10 min)' : 'Extra Massage (10 min)'}</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Callus Treatment</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Mascarilla Hidratante' : 'Hydrating Mask'}</span></div>
                                                    <div className={styles.nailCompactItem}><span className={styles.nailItemName}>{lang === 'es' ? 'Piedras Calientes' : 'Hot Stones'}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Uñas Gallery */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.75rem', marginTop: '2rem', gridColumn: '1 / -1' }}>
                                            <div style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onClick={() => setSelectedNailImage('/unas/unas1.jpeg')}>
                                                <Image src="/unas/unas1.jpeg" alt="Diseño de Uñas 1" fill style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onClick={() => setSelectedNailImage('/unas/unas2.jpeg')}>
                                                <Image src="/unas/unas2.jpeg" alt="Diseño de Uñas 2" fill style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onClick={() => setSelectedNailImage('/unas/unas3.jpeg')}>
                                                <Image src="/unas/unas3.jpeg" alt="Diseño de Uñas 3" fill style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onClick={() => setSelectedNailImage('/unas/unas4.jpeg')}>
                                                <Image src="/unas/unas4.jpeg" alt="Diseño de Uñas 4" fill style={{ objectFit: 'cover' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Paquetes Recomendados */}
                                    <div className={styles.packagesRecommendedSection}>
                                        <h3 className={styles.packagesRecommendedTitle}>
                                            <Sparkles size={24} style={{ display: 'inline-block', marginRight: '10px' }} />
                                            {lang === 'es' ? 'PAQUETES RECOMENDADOS' : 'RECOMMENDED PACKAGES'}
                                            <Sparkles size={24} style={{ display: 'inline-block', marginLeft: '10px' }} />
                                        </h3>

                                        <div className={styles.packagesRecommendedGrid}>
                                            <div className={styles.recommendedCard}>
                                                <div className={styles.recommendedIcon}><Check size={40} /></div>
                                                <h4 className={styles.recommendedName}>Beauty Day</h4>
                                                <span className={styles.recommendedItem}>Gel Manicure</span>
                                                <span className={styles.recommendedPlus}>+</span>
                                                <span className={styles.recommendedItem}>Signature Pedicure</span>
                                            </div>

                                            <div className={styles.recommendedCard}>
                                                <div className={styles.recommendedIcon}><Check size={40} /></div>
                                                <h4 className={styles.recommendedName}>Spa Day</h4>
                                                <span className={styles.recommendedItem}>Luxury Gel Manicure</span>
                                                <span className={styles.recommendedPlus}>+</span>
                                                <span className={styles.recommendedItem}>Royal Pedicure</span>
                                            </div>

                                            <div className={styles.recommendedCard} style={{ borderColor: '#d4af37', boxShadow: '0 4px 15px rgba(212,175,55,0.1)' }}>
                                                <div className={styles.recommendedIcon}><Waves size={40} /></div>
                                                <h4 className={styles.recommendedName}>Ultimate Relaxation</h4>
                                                <span className={styles.recommendedItem}>Japanese Head Spa Zen (60 min)</span>
                                                <span className={styles.recommendedPlus}>+</span>
                                                <span className={styles.recommendedItem}>Royal Pedicure</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* INTERACTIVE SCALP & STRESS DIAGNOSTIC (MINI-GAME) */}
                            <section className={styles.diagnosticSection}>
                                <div className={styles.diagnosticBox}>
                                    <div className={styles.diagnosticHeader}>
                                        <div className={styles.sectionCategoryLabel}>
                                            {lang === 'es' ? 'TEST INTERACTIVO' : 'INTERACTIVE QUIZ'}
                                        </div>
                                        <h3 className={styles.diagTitle}>
                                            {lang === 'es' ? 'DIAGNÓSTICO EXPRESS: ENCUENTRA TU RITUAL IDEAL' : 'EXPRESS DIAGNOSTIC: FIND YOUR IDEAL RITUAL'}
                                        </h3>
                                        <p className={styles.diagSubtitle}>
                                            {lang === 'es'
                                                ? 'Selecciona tus condiciones actuales para generar la recomendación personalizada de nuestros expertos.'
                                                : 'Select your current scalp condition and stress level to generate a custom ritual match.'}
                                        </p>
                                    </div>

                                    {/* Step 1: Scalp Condition */}
                                    <div className={styles.diagStepContainer}>
                                        <div className={styles.diagQuestionLabel}>
                                            <span>1. {lang === 'es' ? '¿Cómo sientes tu cuero cabelludo?' : 'How does your scalp feel?'}</span>
                                        </div>
                                        <div className={styles.diagOptionsGrid}>
                                            {[
                                                { id: 'oily', label: lang === 'es' ? 'Graso / Con acumulación de producto' : 'Oily / Product Buildup' },
                                                { id: 'dry', label: lang === 'es' ? 'Seco / Con tirantez o comezón' : 'Dry / Tight or Itchy' },
                                                { id: 'sensitive', label: lang === 'es' ? 'Sensible / Enrojecido o irritado' : 'Sensitive / Irritated' },
                                                { id: 'normal', label: lang === 'es' ? 'Normal / Solo busco relajación' : 'Normal / Seeking Pure Relaxation' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => {
                                                        sfx.playHover();
                                                        setDiagScalp(opt.id);
                                                    }}
                                                    className={`${styles.diagOptionBtn} ${diagScalp === opt.id ? styles.diagOptionActive : ''}`}
                                                >
                                                    <Droplets size={16} />
                                                    <span>{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Step 2: Stress / Tension */}
                                    <div className={styles.diagStepContainer}>
                                        <div className={styles.diagQuestionLabel}>
                                            <span>2. {lang === 'es' ? '¿Cuál es tu nivel de estrés o tensión cervical?' : 'What is your current stress / neck tension level?'}</span>
                                        </div>
                                        <div className={styles.diagOptionsGrid}>
                                            {[
                                                { id: 'mild', label: lang === 'es' ? 'Ligero / Mantenimiento general' : 'Mild / General Maintenance' },
                                                { id: 'medium', label: lang === 'es' ? 'Moderado / Cansancio de pantalla y rutina' : 'Moderate / Screen Fatigue' },
                                                { id: 'high', label: lang === 'es' ? 'Alto / Tensión intensa en cuello y hombros' : 'High / Intense Neck & Shoulder Tension' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => {
                                                        sfx.playHover();
                                                        setDiagStress(opt.id);
                                                    }}
                                                    className={`${styles.diagOptionBtn} ${diagStress === opt.id ? styles.diagOptionActive : ''}`}
                                                >
                                                    <Zap size={16} />
                                                    <span>{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Diagnostic Result */}
                                    {diagScalp && diagStress && (
                                        <div className={styles.diagResultCard}>
                                            <div className={styles.diagResultTitle}>
                                                <Sparkles size={20} />
                                                <span>
                                                    {lang === 'es' ? 'RECOMENDACIÓN PERSONALIZADA:' : 'CUSTOM RECOMMENDATION:'} {diagStress === 'high' ? 'Paquete: Ultimate Relaxation' : 'Japanese Head Spa Zen (60 min)'}
                                                </span>
                                            </div>
                                            <p className={styles.diagResultText}>
                                                {lang === 'es'
                                                    ? `Con base en tu cuero cabelludo (${diagScalp}) y tu nivel de tensión (${diagStress}), nuestro protocolo recomendado incluye micro-vapor botánico calmante y masaje shiatsu enfocado en puntos suboccipitales para disolver el estrés y equilibrar el microbioma capilar.`
                                                    : `Based on your scalp condition (${diagScalp}) and stress profile (${diagStress}), we recommend our signature botanical micro-mist infusion paired with targeted Shiatsu suboccipital acupressure to dissolve tension and balance your follicular microbiome.`}
                                            </p>
                                            <button onClick={() => handleBookService('Head Spa')} className={styles.spaPrimaryBtn}>
                                                <span>{lang === 'es' ? 'RESERVAR CON ESTE PROTOCOLO' : 'BOOK WITH THIS PROTOCOL'}</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* HEAD SPA PHOTO GALLERY */}
                            <section className={styles.spaGallerySection}>
                                <div className={styles.sectionHeaderCenter}>
                                    <div className={styles.sectionCategoryLabel}>
                                        {lang === 'es' ? 'GALERÍA DE LA EXPERIENCIA' : 'SANCTUARY GALLERY'}
                                    </div>
                                    <h2 className={styles.sectionMainHeading}>
                                        {lang === 'es' ? 'VIVE LA ATMÓSFERA HEAD SPA' : 'EXPERIENCE THE ATMOSPHERE'}
                                    </h2>
                                </div>

                                <div className={styles.spaGalleryGrid}>
                                    {['/spa/spa.jpeg', '/spa/spa2.jpeg', '/spa/spa3.jpeg', '/spa/spa4.jpeg'].map((src, idx) => (
                                        <div key={idx} className={styles.spaGalleryImgBox}>
                                            <Image src={src} alt={`Head Spa Sanctuary ${idx + 1}`} fill className={styles.spaGalleryImg} />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* HEAD SPA FAQS */}
                            <section className={styles.faqSection}>
                                <div className={styles.sectionHeaderCenter}>
                                    <div className={styles.sectionCategoryLabel}>
                                        {lang === 'es' ? 'PREGUNTAS FRECUENTES' : 'FAQ'}
                                    </div>
                                    <h2 className={styles.sectionMainHeading}>
                                        {lang === 'es' ? 'TODO SOBRE TU VISITA' : 'EVERYTHING ABOUT YOUR VISIT'}
                                    </h2>
                                </div>

                                <div className={styles.faqGrid}>
                                    {spaFaqs.map((faq, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.faqCard}
                                            onClick={() => {
                                                sfx.playHover();
                                                setOpenFaq(openFaq === idx ? null : idx);
                                            }}
                                        >
                                            <div className={styles.faqQuestionRow}>
                                                <span className={styles.faqQuestion}>{faq.q}</span>
                                                <HelpCircle size={18} color="#2dd4bf" />
                                            </div>
                                            {openFaq === idx && (
                                                <p className={styles.faqAnswer}>{faq.a}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                            {/* Assist Section */}
                            <section className={`${salonStyles.assistSection} reveal`}>
                                <div className={salonStyles.aboutImageWrapper}>
                                    <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowLeft}`} onClick={prevAssist}>‹</div>
                                    <Image
                                        src={assistImages[assistIndex]}
                                        alt="Assist Staff"
                                        fill
                                        className={salonStyles.aboutImage}
                                    />
                                    <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowRight}`} onClick={nextAssist}>›</div>
                                </div>
                                <div className={salonStyles.assistTextContainer}>
                                    <h2 className={salonStyles.assistHeading}>{t.assist.heading.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h2>
                                    <p className={salonStyles.assistDesc}>
                                        {t.assist.desc}
                                    </p>
                                </div>
                            </section>

                            {/* Location Section */}
                            <section id="location" className={salonStyles.locationSection}>
                                <div className={salonStyles.locationOverlay}></div>
                                <div className={salonStyles.locationContentContainer}>
                                    <div className={salonStyles.locationTextWrapper}>
                                        <h2 className={salonStyles.locationHeading}>{t.location.heading.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h2>
                                        <div className={salonStyles.locationAddressBox}>
                                            <p className={salonStyles.locationPrompt}>{t.location.findUs}</p>
                                            <p className={salonStyles.locationAddress}>6634 Penn Ave S, Richfield, MN 55423, US</p>
                                        </div>
                                    </div>
                                    <div className={salonStyles.mapWrapper}>
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2827.872740700817!2d-93.3087300236053!3d44.86475857107026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87f626a5700b0b87%3A0xc34b7f3ba9e8c474!2s6634%20Penn%20Ave%20S%2C%20Richfield%2C%20MN%2055423!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                                            className={salonStyles.mapIframe}
                                            allowFullScreen={false}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                </div>
                            </section>

                            {/* Founders Section */}
                            <section className={salonStyles.foundersSection}>
                                <div className={salonStyles.founderRow}>
                                    <div className={salonStyles.founderImageContainer}>
                                        <Image
                                            src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/63af029ef706a13cd2eb31f2_Maria%20barrientos%20Salon%20Mar%C3%ADa%20Bonita%20Beauty.jpeg"
                                            alt="María Barrientos"
                                            fill
                                            className={salonStyles.founderImg}
                                        />
                                    </div>
                                    <div className={salonStyles.founderTextContainer}>
                                        <h3 className={salonStyles.founderNameTitle}>maría barrientos</h3>
                                        <p className={salonStyles.founderBio}>In 2003, a great need led me to change the course of my life. This project presented itself as a great opportunity. At that moment, it seemed impossible to achieve this dream. However, with all my faith and determination, it was accomplished. To this day, it remains a reality and the most beautiful project of my life.</p>
                                    </div>
                                </div>

                                <div className={salonStyles.founderRow}>
                                    <div className={salonStyles.founderImageContainer}>
                                        <Image
                                            src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/63aee23d8792abbc92a39642_Brenda%20Mar%C3%ADa%20Bonita%20Beauty%20Salon.jpeg"
                                            alt="Melissa Barrientos"
                                            fill
                                            className={salonStyles.founderImg}
                                        />
                                    </div>
                                    <div className={salonStyles.founderTextContainer}>
                                        <h3 className={salonStyles.founderNameTitle}>MELISSA barrientos</h3>
                                        <p className={salonStyles.founderBio}>In 2015, I started this project initially because I was inspired by my mother&apos;s great talent. I grew up in the beauty industry and love everything about my career as a cosmetologist. My greatest inspiration is seeing my clients happy.</p>
                                    </div>
                                </div>
                            </section>

                        </main>
                    )}

                    {/* ====================================================================
          MODE CONTENT: COMPLETE SALON EXPERIENCE (WHEN IN SALON MODE)
          ==================================================================== */}
                    {activeMode === 'salon' && (
                        <div className={styles.salonFullExperience}>
                            {/* Sticky Navigation */}
                            <div className={`${salonStyles.stickyNav} ${scrolled ? salonStyles.scrolled : ''}`}>
                                <div className={salonStyles.navLeft}>
                                    <div className={salonStyles.dot}></div>
                                    <span className={salonStyles.salonText}>Beauty Salon</span>
                                    <div className={salonStyles.navSeparator}></div>
                                    <div className={salonStyles.navSocials}>
                                        <a href="https://www.instagram.com/maria_bonitabeautysalon/" target="_blank" rel="noopener noreferrer" className={salonStyles.navSocialLink}>
                                            <InstagramIcon size={14} />
                                        </a>
                                        <a href="https://www.facebook.com/barrientostony/" target="_blank" rel="noopener noreferrer" className={salonStyles.navSocialLink}>
                                            <FacebookIcon size={14} />
                                        </a>
                                        <a href="https://www.tiktok.com/@mariabonitabeautysalon_" target="_blank" rel="noopener noreferrer" className={salonStyles.navSocialLink}>
                                            <TikTokIcon size={14} />
                                        </a>
                                    </div>
                                </div>
                                <div className={salonStyles.brand}>
                                    <Image src="/maria.png" alt="María Bonita" width={150} height={50} className={salonStyles.brandLogo} />
                                </div>
                                <div className={salonStyles.navRight}>
                                    <div className={salonStyles.langToggle} onClick={() => setLang(lang === 'en' ? 'es' : 'en')} style={{ marginRight: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Globe size={18} /> <span>{lang.toUpperCase()}</span>
                                    </div>
                                    <div onClick={toggleMenu} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                                        <span className={salonStyles.menuText}>{t.nav.menu}</span>
                                        <div className={`${salonStyles.hamburger} ${isMenuOpen ? salonStyles.active : ''}`}>
                                            <div className={salonStyles.lineDark}></div>
                                            <div className={salonStyles.lineDark}></div>
                                            <div className={salonStyles.lineDark}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Salon Hero Content */}
                            <main id="home" className={salonStyles.hero} style={{ minHeight: '80vh' }}>
                                <div className={salonStyles.backgroundImage}></div>



                                <div className={salonStyles.heroContent}>
                                    <div className={salonStyles.marqueeContainerTop}>
                                        <div className={salonStyles.marqueeContentReverse}>
                                            <span className={salonStyles.mainHeading}>SHINE WITH YOUR OWN LIGHT</span>
                                            <span className={salonStyles.mainHeading}>SHINE WITH YOUR OWN LIGHT</span>
                                            <span className={salonStyles.mainHeading}>SHINE WITH YOUR OWN LIGHT</span>
                                        </div>
                                    </div>

                                    <div className={salonStyles.marqueeContainer}>
                                        <div className={salonStyles.marqueeContent}>
                                            <span className={salonStyles.marqueeText}>WE PROVIDE YOU WITH THE BEST SALON SERVICES </span>
                                            <span className={salonStyles.marqueeText}>WE PROVIDE YOU WITH THE BEST SALON SERVICES </span>
                                        </div>
                                    </div>

                                    <button onClick={() => handleBookService()} className={salonStyles.ctaButton}>
                                        {t.hero.cta}
                                    </button>
                                </div>

                                <div className={`${salonStyles.menuOverlay} ${isMenuOpen ? salonStyles.active : ''}`}>
                                    <div className={salonStyles.closeButton} onClick={toggleMenu}>
                                        <div className={salonStyles.closeLine}></div>
                                        <div className={salonStyles.closeLine}></div>
                                    </div>
                                    <div className={salonStyles.menuLinks}>
                                        <a href="#home" className={salonStyles.menuLink} style={{ transitionDelay: '0.1s' }} onClick={() => setIsMenuOpen(false)}>{t.menu.home}</a>
                                        <a href="#about" className={salonStyles.menuLink} style={{ transitionDelay: '0.2s' }} onClick={() => setIsMenuOpen(false)}>{t.menu.about}</a>
                                        <a href="#gallery" className={salonStyles.menuLink} style={{ transitionDelay: '0.3s' }} onClick={() => setIsMenuOpen(false)}>{t.menu.gallery}</a>
                                        <a href="#blog" className={salonStyles.menuLink} style={{ transitionDelay: '0.4s' }} onClick={() => setIsMenuOpen(false)}>{t.menu.blog}</a>
                                        <a href="#location" className={salonStyles.menuLink} style={{ transitionDelay: '0.5s' }} onClick={() => setIsMenuOpen(false)}>{t.menu.location}</a>
                                        <Link href="/dashboard" className={salonStyles.menuLink} style={{ transitionDelay: '0.55s', color: '#9e8a30', fontWeight: 'bold' }} onClick={() => setIsMenuOpen(false)}>
                                            {lang === 'es' ? 'Acceso Admin' : 'Admin Login'}
                                        </Link>
                                        <div className={salonStyles.mobileSocials} style={{ transitionDelay: '0.6s' }}>
                                            <a href="https://www.instagram.com/maria_bonitabeautysalon/" target="_blank" rel="noopener noreferrer"><InstagramIcon size={24} /></a>
                                            <a href="https://www.facebook.com/barrientostony/" target="_blank" rel="noopener noreferrer"><FacebookIcon size={24} /></a>
                                            <a href="https://www.tiktok.com/@mariabonitabeautysalon_" target="_blank" rel="noopener noreferrer"><TikTokIcon size={24} /></a>
                                        </div>
                                    </div>
                                </div>
                            </main>


                            {/* About Section */}
                            <section id="about" className={`${salonStyles.aboutSection} reveal`}>
                                <div className={salonStyles.aboutSubtitle}>{t.about.subtitle}</div>
                                <div className={salonStyles.aboutContent}>
                                    <div className={salonStyles.aboutText}>
                                        <h2 className={salonStyles.aboutHeading}>{t.about.heading.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h2>
                                        <div className={salonStyles.aboutDescription}>
                                            <p className={salonStyles.aboutIntro}>{t.about.intro}</p>

                                            <p className={salonStyles.aboutDescriptionItem}>
                                                <strong className={salonStyles.aboutDescriptionTitle}>{t.about.reasons[0].title} </strong>
                                                {t.about.reasons[0].desc}
                                            </p>

                                            <p className={salonStyles.aboutDescriptionItem}>
                                                <strong className={salonStyles.aboutDescriptionTitle}>Premium Products: </strong>
                                                {t.about.reasons[1].desc}
                                            </p>

                                            <p className={salonStyles.aboutDescriptionItem}>
                                                <strong className={salonStyles.aboutDescriptionTitle}>Expert Staff: </strong>
                                                Our team is professionally trained, fully certified, and dedicated to excellence.
                                            </p>
                                        </div>
                                    </div>

                                    <div className={salonStyles.aboutImageWrapper}>
                                        <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowLeft}`} onClick={prevAbout}>‹</div>
                                        <Image
                                            src={aboutImages[aboutIndex]}
                                            alt="Quality Salon Service"
                                            fill
                                            className={salonStyles.aboutImage}
                                        />
                                        <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowRight}`} onClick={nextAbout}>›</div>
                                    </div>
                                </div>
                            </section>

                            {/* Step Inside Section */}
                            <section className={`${salonStyles.stepInsideSection} reveal`}>
                                <h2 className={salonStyles.stepInsideHeading}>{t.stepInside.heading}</h2>
                                <div className={salonStyles.videosContainer}>
                                    <div className={salonStyles.videoWrapper}>
                                        <video className={salonStyles.stepVideo} autoPlay loop muted playsInline>
                                            <source src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/68960ba4c20e34719ba73ab6_3-transcode.mp4" type="video/mp4" />
                                        </video>
                                    </div>
                                    <div className={salonStyles.videoWrapper}>
                                        <video className={salonStyles.stepVideo} autoPlay loop muted playsInline>
                                            <source src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/68960ce9329227adb01a3b48_4-transcode.mp4" type="video/mp4" />
                                        </video>
                                    </div>
                                </div>
                            </section>

                            {/* Services Intro Section */}
                            <section id="services" className={`${salonStyles.servicesIntroSection} reveal`}>
                                <div className={salonStyles.servicesSubtitle}>{t.servicesIntro.subtitle}</div>
                                <h2 className={salonStyles.servicesHeading}>{t.servicesIntro.heading}</h2>
                                <p className={salonStyles.servicesIntroText}>
                                    {t.servicesIntro.desc}
                                </p>
                            </section>

                            {/* Parallax Image Section */}
                            <div className={salonStyles.parallaxSection}></div>

                            {/* Services Grid Section */}
                            <section className={`${salonStyles.servicesGridSection} reveal`}>
                                <div className={salonStyles.servicesGrid}>
                                    {services.map((service, idx) => (
                                        <div key={idx} className={salonStyles.serviceCard}>
                                            <div className={salonStyles.serviceImageWrapper}>
                                                <Image
                                                    src={service.img}
                                                    alt={service.title}
                                                    fill
                                                    className={salonStyles.serviceImage}
                                                />
                                            </div>
                                            <div className={salonStyles.serviceInfo}>
                                                <h3 className={salonStyles.serviceTitle}>{t.servicesList[idx].title}</h3>
                                                <p className={salonStyles.serviceDesc}>{t.servicesList[idx].desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Gallery Section */}
                            <section id="gallery" className={`${salonStyles.gallerySection} reveal`}>
                                <h2 className={salonStyles.galleryHeading}>{t.gallery.heading}</h2>
                                <div className={salonStyles.galleryGrid}>
                                    {services.slice(0, 4).map((service, idx) => (
                                        <div key={idx} className={salonStyles.galleryImageWrapper}>
                                            <Image src={service.img} alt="Gallery Photo" fill className={salonStyles.aboutImage} />
                                        </div>
                                    ))}
                                    {/* Melissa Gallery */}
                                    {melissaImages.map((img, idx) => (
                                        <div key={`melissa-${idx}`} className={salonStyles.galleryImageWrapper}>
                                            <Image src={img} alt={`Melissa Photo ${idx + 1}`} fill className={salonStyles.aboutImage} />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Assist Section */}
                            <section className={`${salonStyles.assistSection} reveal`}>
                                <div className={salonStyles.aboutImageWrapper}>
                                    <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowLeft}`} onClick={prevAssist}>‹</div>
                                    <Image
                                        src={assistImages[assistIndex]}
                                        alt="Assist Staff"
                                        fill
                                        className={salonStyles.aboutImage}
                                    />
                                    <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowRight}`} onClick={nextAssist}>›</div>
                                </div>
                                <div className={salonStyles.assistTextContainer}>
                                    <h2 className={salonStyles.assistHeading}>{t.assist.heading.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h2>
                                    <p className={salonStyles.assistDesc}>
                                        {t.assist.desc}
                                    </p>
                                </div>
                            </section>

                            {/* Blog Section */}
                            <section id="blog" className={`${salonStyles.blogSection} reveal`}>
                                <h2 className={salonStyles.blogSubtitle}>{t.blog.subtitle}</h2>
                                <h3 className={salonStyles.blogHeading}>{t.menu.blog}</h3>
                                <div className={salonStyles.blogGrid}>
                                    {blogPosts.map((post, idx) => (
                                        <div key={idx} className={salonStyles.blogCard}>
                                            <div className={salonStyles.blogImageWrapper}>
                                                <Image src={post.img} alt={post.title} fill className={salonStyles.aboutImage} />
                                            </div>
                                            <a href={post.link} className={salonStyles.blogTitle}>{post.title}</a>
                                            <p className={salonStyles.blogSnippet}>{post.snippet}</p>
                                            <a href={post.link} className={salonStyles.blogLink}>Ver post completo</a>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* YouTube Videos Section */}
                            <section className={salonStyles.videoSection}>
                                <div className={salonStyles.videoGrid}>
                                    <iframe className={salonStyles.videoIframe} src="https://www.youtube.com/embed/jz6QNmWcjWY?feature=oembed" title="YouTube video 1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    <iframe className={salonStyles.videoIframe} src="https://www.youtube.com/embed/icrYjbzlR6A?feature=oembed" title="YouTube video 2" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    <iframe className={salonStyles.videoIframe} src="https://www.youtube.com/embed/qdsDXdB5vFg?feature=oembed" title="YouTube video 3" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    <iframe className={salonStyles.videoIframe} src="https://www.youtube.com/embed/U3-rkrmLP_4?feature=oembed" title="YouTube video 4" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                </div>
                            </section>

                            {/* Features Section */}
                            <section className={`${salonStyles.featuresSection} reveal`}>
                                <div className={salonStyles.featureCard}>
                                    <div className={salonStyles.featureHeader}>
                                        <Sparkles size={20} color="var(--gold)" />
                                        <h3 className={salonStyles.featureTitle}>{t.features[0].title}</h3>
                                        <Sparkles size={20} color="var(--gold)" />
                                    </div>
                                    <p className={salonStyles.featureDesc}>{t.features[0].desc}</p>
                                </div>
                                <div className={salonStyles.featureCard}>
                                    <div className={salonStyles.featureHeader}>
                                        <Sparkles size={20} color="var(--gold)" />
                                        <h3 className={salonStyles.featureTitle}>{t.features[1].title}</h3>
                                        <Sparkles size={20} color="var(--gold)" />
                                    </div>
                                    <p className={salonStyles.featureDesc}>{t.features[1].desc}</p>
                                </div>
                                <div className={salonStyles.featureCard}>
                                    <div className={salonStyles.featureHeader}>
                                        <Sparkles size={20} color="var(--gold)" />
                                        <h3 className={salonStyles.featureTitle}>{t.features[2].title}</h3>
                                        <Sparkles size={20} color="var(--gold)" />
                                    </div>
                                    <p className={salonStyles.featureDesc}>{t.features[2].desc}</p>
                                </div>
                            </section>

                            {/* Location Section */}
                            <section id="location" className={salonStyles.locationSection}>
                                <div className={salonStyles.locationOverlay}></div>
                                <div className={salonStyles.locationContentContainer}>
                                    <div className={salonStyles.locationTextWrapper}>
                                        <h2 className={salonStyles.locationHeading}>{t.location.heading.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h2>
                                        <div className={salonStyles.locationAddressBox}>
                                            <p className={salonStyles.locationPrompt}>{t.location.findUs}</p>
                                            <p className={salonStyles.locationAddress}>6634 Penn Ave S, Richfield, MN 55423, US</p>
                                        </div>
                                    </div>
                                    <div className={salonStyles.mapWrapper}>
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2827.872740700817!2d-93.3087300236053!3d44.86475857107026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87f626a5700b0b87%3A0xc34b7f3ba9e8c474!2s6634%20Penn%20Ave%20S%2C%20Richfield%2C%20MN%2055423!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                                            className={salonStyles.mapIframe}
                                            allowFullScreen={false}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                </div>
                            </section>

                            {/* Founders Section */}
                            <section className={salonStyles.foundersSection}>
                                <div className={salonStyles.founderRow}>
                                    <div className={salonStyles.founderImageContainer}>
                                        <Image
                                            src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/63af029ef706a13cd2eb31f2_Maria%20barrientos%20Salon%20Mar%C3%ADa%20Bonita%20Beauty.jpeg"
                                            alt="María Barrientos"
                                            fill
                                            className={salonStyles.founderImg}
                                        />
                                    </div>
                                    <div className={salonStyles.founderTextContainer}>
                                        <h3 className={salonStyles.founderNameTitle}>maría barrientos</h3>
                                        <p className={salonStyles.founderBio}>In 2003, a great need led me to change the course of my life. This project presented itself as a great opportunity. At that moment, it seemed impossible to achieve this dream. However, with all my faith and determination, it was accomplished. To this day, it remains a reality and the most beautiful project of my life.</p>
                                    </div>
                                </div>

                                <div className={salonStyles.founderRow}>
                                    <div className={salonStyles.founderImageContainer}>
                                        <Image
                                            src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/63aee23d8792abbc92a39642_Brenda%20Mar%C3%ADa%20Bonita%20Beauty%20Salon.jpeg"
                                            alt="Melissa Barrientos"
                                            fill
                                            className={salonStyles.founderImg}
                                        />
                                    </div>
                                    <div className={salonStyles.founderTextContainer}>
                                        <h3 className={salonStyles.founderNameTitle}>MELISSA barrientos</h3>
                                        <p className={salonStyles.founderBio}>In 2015, I started this project initially because I was inspired by my mother&apos;s great talent. I grew up in the beauty industry and love everything about my career as a cosmetologist. My greatest inspiration is seeing my clients happy.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Assist Section */}
                            <section className={`${salonStyles.assistSection} reveal`}>
                                <div className={salonStyles.aboutImageWrapper}>
                                    <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowLeft}`} onClick={prevAssist}>‹</div>
                                    <Image
                                        src={assistImages[assistIndex]}
                                        alt="Assist Staff"
                                        fill
                                        className={salonStyles.aboutImage}
                                    />
                                    <div className={`${salonStyles.sliderArrow} ${salonStyles.sliderArrowRight}`} onClick={nextAssist}>›</div>
                                </div>
                                <div className={salonStyles.assistTextContainer}>
                                    <h2 className={salonStyles.assistHeading}>{t.assist.heading.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h2>
                                    <p className={salonStyles.assistDesc}>
                                        {t.assist.desc}
                                    </p>
                                </div>
                            </section>

                            {/* Location Section */}
                            <section id="location" className={salonStyles.locationSection}>
                                <div className={salonStyles.locationOverlay}></div>
                                <div className={salonStyles.locationContentContainer}>
                                    <div className={salonStyles.locationTextWrapper}>
                                        <h2 className={salonStyles.locationHeading}>{t.location.heading.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h2>
                                        <div className={salonStyles.locationAddressBox}>
                                            <p className={salonStyles.locationPrompt}>{t.location.findUs}</p>
                                            <p className={salonStyles.locationAddress}>6634 Penn Ave S, Richfield, MN 55423, US</p>
                                        </div>
                                    </div>
                                    <div className={salonStyles.mapWrapper}>
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2827.872740700817!2d-93.3087300236053!3d44.86475857107026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87f626a5700b0b87%3A0xc34b7f3ba9e8c474!2s6634%20Penn%20Ave%20S%2C%20Richfield%2C%20MN%2055423!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                                            className={salonStyles.mapIframe}
                                            allowFullScreen={false}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                </div>
                            </section>

                            {/* Founders Section */}
                            <section className={salonStyles.foundersSection}>
                                <div className={salonStyles.founderRow}>
                                    <div className={salonStyles.founderImageContainer}>
                                        <Image
                                            src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/63af029ef706a13cd2eb31f2_Maria%20barrientos%20Salon%20Mar%C3%ADa%20Bonita%20Beauty.jpeg"
                                            alt="María Barrientos"
                                            fill
                                            className={salonStyles.founderImg}
                                        />
                                    </div>
                                    <div className={salonStyles.founderTextContainer}>
                                        <h3 className={salonStyles.founderNameTitle}>maría barrientos</h3>
                                        <p className={salonStyles.founderBio}>In 2003, a great need led me to change the course of my life. This project presented itself as a great opportunity. At that moment, it seemed impossible to achieve this dream. However, with all my faith and determination, it was accomplished. To this day, it remains a reality and the most beautiful project of my life.</p>
                                    </div>
                                </div>

                                <div className={salonStyles.founderRow}>
                                    <div className={salonStyles.founderImageContainer}>
                                        <Image
                                            src="https://cdn.prod.website-files.com/6397a990f9c238169485ce1d/63aee23d8792abbc92a39642_Brenda%20Mar%C3%ADa%20Bonita%20Beauty%20Salon.jpeg"
                                            alt="Melissa Barrientos"
                                            fill
                                            className={salonStyles.founderImg}
                                        />
                                    </div>
                                    <div className={salonStyles.founderTextContainer}>
                                        <h3 className={salonStyles.founderNameTitle}>MELISSA barrientos</h3>
                                        <p className={salonStyles.founderBio}>In 2015, I started this project initially because I was inspired by my mother&apos;s great talent. I grew up in the beauty industry and love everything about my career as a cosmetologist. My greatest inspiration is seeing my clients happy.</p>
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {/* ====================================================================
          SHARED FOOTER
          ==================================================================== */}
                    <footer className={salonStyles.footerDark} style={{ marginTop: '0', background: '#020609' }}>
                        <div className={salonStyles.footerContentGrid}>
                            {/* Contact Column */}
                            <div className={salonStyles.footerColumn}>
                                <h4 className={salonStyles.footerColTitle}>CONTACT US</h4>
                                <div className={salonStyles.footerInfoItem}>
                                    <span className={salonStyles.footerInfoLabel}>Phone:</span>
                                    <a href="tel:+16123454187" className={salonStyles.footerInfoValue}>+1 612-345-4187</a>
                                </div>
                                <div className={salonStyles.footerInfoItem}>
                                    <span className={salonStyles.footerInfoLabel}>Address:</span>
                                    <p className={salonStyles.footerInfoValue}>6634 Penn Ave S, Richfield, MN 55423, USA</p>
                                </div>
                            </div>

                            {/* Social Column */}
                            <div className={salonStyles.footerColumn}>
                                <h4 className={salonStyles.footerColTitle}>FOLLOW US</h4>
                                <div className={salonStyles.footerSocialIcons}>
                                    <a href="https://www.instagram.com/maria_bonitabeautysalon/" target="_blank" rel="noopener noreferrer" className={salonStyles.socialIconLink}>
                                        <span className={salonStyles.socialIconLabel}>Instagram</span>
                                    </a>
                                    <a href="https://www.facebook.com/barrientostony/" target="_blank" rel="noopener noreferrer" className={salonStyles.socialIconLink}>
                                        <span className={salonStyles.socialIconLabel}>Facebook</span>
                                    </a>
                                    <a href="https://www.tiktok.com/@mariabonitabeautysalon_" target="_blank" rel="noopener noreferrer" className={salonStyles.socialIconLink}>
                                        <span className={salonStyles.socialIconLabel}>TikTok</span>
                                    </a>
                                </div>
                            </div>

                            {/* Hours Column */}
                            <div className={salonStyles.footerColumn}>
                                <h4 className={salonStyles.footerColTitle}>OPENING HOURS</h4>
                                <div className={salonStyles.hoursGrid}>
                                    <div className={salonStyles.hourRow}><span>Mon - Sat:</span> <span>10:00 AM - 7:00 PM</span></div>
                                    <div className={salonStyles.hourRow}><span>Sunday:</span> <span>10:00 AM - 4:00 PM</span></div>
                                </div>
                            </div>
                        </div>

                        <div className={salonStyles.footerLegal}>
                            <a href="#" className={salonStyles.legalLink}>Contact</a>
                            <a href="#" className={salonStyles.legalLink}>Terms and conditions</a>
                            <a href="#" className={salonStyles.legalLink}>Privacy policies</a>
                            <Link href="/" className={salonStyles.legalLink} style={{ color: '#d4af37', fontWeight: 'bold', marginLeft: '10px' }}>
                                {lang === 'es' ? '← Ir a Página Original' : '← Go to Original Page'}
                            </Link>
                            
                            <div className={salonStyles.adminBtnWrapper}>
                                <Link href="/dashboard" className={salonStyles.adminAccessBtn}>
                                    {lang === 'es' ? 'ACCESO ADMIN' : 'ADMIN LOGIN'}
                                </Link>
                            </div>
                        </div>
                    </footer>
                </div>
            )}

            {/* ====================================================================
          FLOATING HUD SWITCHER BAR (HOT-SWITCH ANYTIME ONCE UNLOCKED)
          ==================================================================== */}
            {activeMode && (
                <div className={styles.floatingHudSwitcher}>
                    <button
                        onClick={() => handleModeSwitch('salon')}
                        className={`${styles.hudSwitchTab} ${activeMode === 'salon' ? styles.hudTabActiveSalon : ''}`}
                    >
                        <Scissors size={14} />
                        <span>{lang === 'es' ? 'SALÓN' : 'SALON'}</span>
                    </button>

                    <button
                        onClick={() => handleModeSwitch('spa')}
                        className={`${styles.hudSwitchTab} ${activeMode === 'spa' ? styles.hudTabActiveSpa : ''}`}
                    >
                        <Droplets size={14} />
                        <span>{lang === 'es' ? 'HEAD SPA' : 'HEAD SPA'}</span>
                    </button>
                </div>
            )}

            {/* Booking Scheduler Modal */}
            <BookingScheduler
                lang={lang}
                isOpen={isBookingOpen}
                onClose={() => {
                    setIsBookingOpen(false);
                    setSelectedServiceForBooking(null);
                }}
            />

            {/* Image Modal for Gallery */}
            {selectedNailImage && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out', padding: '1.5rem' }}
                    onClick={() => setSelectedNailImage(null)}
                >
                    <button 
                        onClick={() => setSelectedNailImage(null)}
                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '24px', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                    <div style={{ position: 'relative', width: '100%', height: '85vh', maxWidth: '850px', maxHeight: '850px' }}>
                        <Image src={selectedNailImage} alt="Enlarged view" fill style={{ objectFit: 'contain' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
