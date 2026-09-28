import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Menu items
content = content.replace(">HOME<", ">{t.menu.home}<")
content = content.replace(">SERVICES<", ">{t.menu.services}<")
content = content.replace(">SPA<", ">{t.menu.spa}<")
content = content.replace(">ABOUT<", ">{t.menu.about}<")
content = content.replace(">GALLERY<", ">{t.menu.gallery}<")
content = content.replace(">BLOG<", ">{t.menu.blog}<")
content = content.replace(">LOCATION<", ">{t.menu.location}<")

# Hero
content = content.replace("María Bonita Beauty Salon - Where beauty meets art - ", "{t.hero.marquee}")
content = content.replace("SCHEDULE AN APPOINTMENT", "{t.hero.cta}")

# Spa
content = content.replace("/ N E W &nbsp; S P A &nbsp; O P E N I N G", "{t.spa.subtitle}")
content = content.replace("DISCOVER OUR NEW SPA SERVICES", "{t.spa.heading}")
content = content.replace("We are thrilled to announce the opening of our brand new Spa section. \n              Designed as an oasis of tranquility, it features the following characteristics:", "{t.spa.desc}")
content = content.replace("<li>Relaxing Massages (Deep tissue, Swedish)</li>", "<li>{t.spa.list[0]}</li>")
content = content.replace("<li>Rejuvenating Facial Treatments</li>", "<li>{t.spa.list[1]}</li>")
content = content.replace("<li>Aromatherapy & Holistic Care</li>", "<li>{t.spa.list[2]}</li>")
content = content.replace("<li>Aesthetic Treatments & Skincare</li>", "<li>{t.spa.list[3]}</li>")

# About
content = content.replace("/ A B O U T &nbsp; U S", "{t.about.subtitle}")
content = content.replace("Q U A L I T Y<br/>C E R T I F I C A T I O N &nbsp; I N<br/>M I N N E S O T A", "{t.about.heading.split('\\n').map((line, i) => <span key={i}>{line}<br/></span>)}")
content = content.replace("We are a premier salon in Minnesota for three key reasons:", "{t.about.intro}")

content = content.replace('<strong className={styles.aboutDescriptionTitle}>Hair Health First: </strong>', '<strong className={styles.aboutDescriptionTitle}>{t.about.reasons[0].title} </strong>')
content = content.replace('Our top priority is the integrity and health of your hair.', '{t.about.reasons[0].desc}')

content = content.replace('<strong className={styles.aboutDescriptionTitle}>Integrity: </strong>', '<strong className={styles.aboutDescriptionTitle}>{t.about.reasons[1].title} </strong>')
content = content.replace('We exclusively use certified, high-quality products. We never compromise with low-quality alternatives that could damage your hair over time.', '{t.about.reasons[1].desc}')

content = content.replace('<strong className={styles.aboutDescriptionTitle}>Certified Professionals: </strong>', '<strong className={styles.aboutDescriptionTitle}>{t.about.reasons[2].title} </strong>')
content = content.replace('Melissa, the founder, along with her team, are certified professionals ensuring top-tier service.', '{t.about.reasons[2].desc}')

content = content.replace('<strong className={styles.aboutDescriptionTitle}>Exclusivity and Quality: </strong>', '<strong className={styles.aboutDescriptionTitle}>{t.about.reasons[3].title} </strong>')
content = content.replace('Every process is handled with the utmost care, ensuring a premium experience.', '{t.about.reasons[3].desc}')

content = content.replace('STEP INSIDE — BEAUTY BEGINS HERE', '{t.stepInside.heading}')

content = content.replace('/ S E R V I C E S &nbsp; / S E R V I C I O S', '{t.servicesIntro.subtitle}')
content = content.replace('EVERY TRANSFORMATION STARTS WITH THE DECISION TO EMBRACE CHANGE.', '{t.servicesIntro.heading}')
content = content.replace('Located in Richfield, Minnesota, María Bonita Beauty Salon is a welcoming space dedicated to holistic beauty and self-care. We offer high quality services in a calm, comfortable environment where every client feels valued and cared for. Our goal is simple: to help you look and feel your best while enjoying a relaxing, personalized experience.', '{t.servicesIntro.desc}')

# Services loop
content = content.replace('<h3 className={styles.serviceTitle}>{service.title}</h3>', '<h3 className={styles.serviceTitle}>{t.servicesList[idx].title}</h3>')
content = content.replace('<p className={styles.serviceDesc}>{service.desc}</p>', '<p className={styles.serviceDesc}>{t.servicesList[idx].desc}</p>')

# Gallery
content = content.replace('MARÍA BONITA BEAUTY SALON PHOTOS', '{t.gallery.heading}')

# Assist
content = content.replace('WE WILL BE HAPPY TO<br/>ASSIST YOU', '{t.assist.heading.split(\'\\n\').map((line, i) => <span key={i}>{line}<br/></span>)}')
content = content.replace('We are here to serve you, and even if we are not available, we continuously train our staff to provide you with the best service.', '{t.assist.desc}')

# Blog
content = content.replace("LET&apos;S TALK ABOUT YOUR TRANSFORMATION", "{t.blog.subtitle}")
content = content.replace('>BLOG<', '>{t.blog.heading}<')

# Features
content = content.replace('>Premium products<', '>{t.features[0].title}<')
content = content.replace('We use high-quality products that won&apos;t damage your hair, eyelashes, etc', '{t.features[0].desc}')

content = content.replace('>Professional Make up<', '>{t.features[1].title}<')
content = content.replace('Our professional team, led by Melissa, will ensure you receive the best makeup design. You&apos;ll look so beautiful that nobody will recognize you', '{t.features[1].desc}')

content = content.replace('>Premium Services<', '>{t.features[2].title}<')
content = content.replace('You will always have different, unique, and premium services. Believe me, we put a lot of effort into the quality of the services we provide you, standing out from our competitors.', '{t.features[2].desc}')

# Location
content = content.replace('¡WE ARE WAITING<br/>FOR YOU!', '{t.location.heading.split(\'\\n\').map((line, i) => <span key={i}>{line}<br/></span>)}')
content = content.replace('You can find us:', '{t.location.findUs}')
content = content.replace('¡We are waiting for you!', '{t.location.heading.split(\'\\n\').map((line, i) => <span key={i}>{line}<br/></span>)}')


# Footer
content = content.replace('>ADDRESS<', '>{t.footer.address}<')
content = content.replace('>HOURS<', '>{t.footer.hours}<')
content = content.replace('>SOCIAL<', '>{t.footer.social}<')
content = content.replace('>POLICIES<', '>{t.footer.policies}<')
content = content.replace('>Monday - Friday<', '>{t.footer.days.monFri}<')
content = content.replace('>Saturday<', '>{t.footer.days.sat}<')
content = content.replace('>Sunday<', '>{t.footer.days.sun}<')
content = content.replace('>Closed<', '>{t.footer.closed}<')
content = content.replace('>Privacy Policy<', '>{t.footer.privacy}<')
content = content.replace('>Terms of Service<', '>{t.footer.terms}<')
content = content.replace('All rights reserved.', '{t.footer.rights}')


with open('src/app/page.tsx', 'w') as f:
    f.write(content)
