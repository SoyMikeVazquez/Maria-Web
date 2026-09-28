const fs = require('fs');
const file = 'src/app/copia/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update GameSoundFX playSelect
const soundRegex = /    \/\/ Gaming Realm Selection Chime\n[\s\S]*?    \}\n/m;
const newSoundLogic = `    // Relaxing Realm Selection Sound
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
`;

content = content.replace(soundRegex, newSoundLogic);

// Update playHover as well to be less intense
const hoverRegex = /    \/\/ Futuristic UI Hover Click\n[\s\S]*?    \}\n/m;
const newHoverLogic = `    // Soft UI Hover Click
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
`;
content = content.replace(hoverRegex, newHoverLogic);

// 2. Replace Nail Menu JSX with bilingual version
const nailMenuRegex = /                            \{\/\* NAIL SPA MENU IN HEAD SPA \*\/\}[\s\S]*?                                \<\/div\>\n                            \<\/section\>/;

const newNailMenuJSX = `                            {/* NAIL SPA MENU IN HEAD SPA */}
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
                            </section>`;

if (nailMenuRegex.test(content)) {
    content = content.replace(nailMenuRegex, newNailMenuJSX);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced sounds and nail menu!");
} else {
    console.log("Could not find the nail menu section. Check the regex.");
}
