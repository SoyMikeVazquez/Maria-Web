const fs = require('fs');
const file = 'src/app/copia/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. We will replace the packagesSection JSX.
// First, find the packages section
const jsxRegex = /\{\/\* HEAD SPA PACKAGES & MENU \*\/\}\n\s*<section className=\{styles\.packagesSection\}>[\s\S]*?<\/section>\n/;
let jsxMatch = content.match(jsxRegex);
if (!jsxMatch) {
  console.error("Could not find packages section JSX");
  process.exit(1);
}

const nailMenuJSX = `          {/* NAIL SPA MENU IN HEAD SPA */}
          <section className={styles.nailMenuSection}>
            <div className={styles.sectionHeaderCenter}>
              <div className={styles.sectionCategoryLabel}>
                {lang === 'es' ? 'SERVICIOS COMPLEMENTARIOS' : 'COMPLEMENTARY SERVICES'}
              </div>
              <h2 className={styles.sectionMainHeading}>
                NUEVOS SERVICIOS TAMBIÉN PARA TUS UÑAS
              </h2>
              <p className={styles.sectionLeadText} style={{marginBottom: '4rem'}}>
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
                      <p className={styles.nailItemDesc}>Limpieza de uñas, corte, limado, cuidado de cutícula y esmalte regular.</p>
                    </div>
                    <div className={styles.nailItem}>
                      <div className={styles.nailItemHeader}>
                        <span className={styles.nailItemName}>Signature Manicure</span>
                        <div className={styles.nailItemDots}></div>
                      </div>
                      <p className={styles.nailItemDesc}>Todo lo anterior + exfoliación de manos, masaje hidratante y toalla caliente.</p>
                    </div>
                    <div className={styles.nailItem}>
                      <div className={styles.nailItemHeader}>
                        <span className={styles.nailItemName}>Gel Manicure</span>
                        <div className={styles.nailItemDots}></div>
                      </div>
                      <p className={styles.nailItemDesc}>Manicure completa con aplicación de gel polish.</p>
                    </div>
                    <div className={styles.nailItem}>
                      <div className={styles.nailItemHeader}>
                        <span className={styles.nailItemName}>Luxury Gel Manicure</span>
                        <div className={styles.nailItemDots}></div>
                      </div>
                      <p className={styles.nailItemDesc}>Gel manicure + exfoliación, mascarilla hidratante, toallas calientes y masaje relajante.</p>
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
                      <p className={styles.nailItemDesc}>Remojo, corte y limado, cuidado de cutícula y esmalte regular.</p>
                    </div>
                    <div className={styles.nailItem}>
                      <div className={styles.nailItemHeader}>
                        <span className={styles.nailItemName}>Signature Pedicure</span>
                        <div className={styles.nailItemDots}></div>
                      </div>
                      <p className={styles.nailItemDesc}>Pedicure completa + exfoliación, masaje relajante y toallas calientes.</p>
                    </div>
                    <div className={styles.nailItem}>
                      <div className={styles.nailItemHeader}>
                        <span className={styles.nailItemName}>Luxury Spa Pedicure</span>
                        <div className={styles.nailItemDots}></div>
                      </div>
                      <p className={styles.nailItemDesc}>Pedicure Signature + mascarilla hidratante, piedras caliente y masaje extendido.</p>
                    </div>
                    <div className={styles.nailItem}>
                      <div className={styles.nailItemHeader}>
                        <span className={styles.nailItemName}>Maria Bonita Royal Pedicure</span>
                        <div className={styles.nailItemDots}></div>
                      </div>
                      <p className={styles.nailItemDesc}>Remojo aromático, exfoliación profunda, mascarilla nutritiva, piedras calientes, toallas calientes, masaje de pies y pantorrillas y bebida de cortesía.</p>
                    </div>
                    <div className={styles.nailItem}>
                      <div className={styles.nailItemHeader}>
                        <span className={styles.nailItemName}>Royal Gel Pedicure</span>
                        <div className={styles.nailItemDots}></div>
                      </div>
                      <p className={styles.nailItemDesc}>Royal Pedicure + gel polish.</p>
                    </div>
                  </div>
                </div>

                {/* Uñas / Extensiones */}
                <div className={styles.nailCategory}>
                  <h3 className={styles.nailCategoryTitle}>
                    <Check size={24} />
                    UÑAS / EXTENSIONES
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
                      DISEÑOS
                    </h3>
                    <div className={styles.nailCompactGrid}>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>French Design</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Chrome</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Cat Eye</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Nail Art Sencillo</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Nail Art Avanzado</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Piedras y Cristales</span></div>
                    </div>
                  </div>

                  <div className={styles.nailCategory}>
                    <h3 className={styles.nailCategoryTitle}>
                      <Check size={24} />
                      ADD-ONS
                    </h3>
                    <div className={styles.nailCompactGrid}>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Gel Upgrade</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Parafina Manos</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Parafina Pies</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Masaje Extra (10 min)</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Callus Treatment</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Mascarilla Hidratante</span></div>
                      <div className={styles.nailCompactItem}><span className={styles.nailItemName}>Piedras Calientes</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paquetes Recomendados */}
              <div className={styles.packagesRecommendedSection}>
                <h3 className={styles.packagesRecommendedTitle}>
                  <Sparkles size={24} style={{ display: 'inline-block', marginRight: '10px' }} />
                  PAQUETES RECOMENDADOS
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
`;

content = content.replace(jsxMatch[0], nailMenuJSX);

// 2. We should also remove the `const spaPackages = ...` array since it's unused now.
// It's quite large, from line ~493 to ~580. We can just regex replace it.
const arrayRegex = /\/\/ Head Spa Treatment Packages\n\s*const spaPackages = lang === 'es' \? \[[\s\S]*?\];\n/;
content = content.replace(arrayRegex, '');

fs.writeFileSync(file, content);
console.log("Successfully replaced packages with Nail Menu!");
