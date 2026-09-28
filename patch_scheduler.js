const fs = require('fs');

let fileContent = fs.readFileSync('src/components/BookingScheduler.tsx', 'utf8');

// 1. Update Booking interface
fileContent = fileContent.replace(
  /interface Booking {[\s\S]*?createdAt: string;\n}/m,
  `interface Booking {
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
}`
);

// 2. Update newBooking creation
const bookingCreationRegex = /const newBooking: Booking = {[\s\S]*?createdAt: new Date\(\)\.toISOString\(\)\n\s*};/;
fileContent = fileContent.replace(bookingCreationRegex, 
  `const newBooking: Booking = {
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
    };`
);

// 3. Add parsing logic before return statement
const logicToAdd = `
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
`;
fileContent = fileContent.replace('  return (\n    <div className={styles.modalOverlay}', logicToAdd + '    <div className={styles.modalOverlay}');

// 4. Update my-bookings rendering
const oldMyBookingsRegex = /\{bookings\.length === 0 \? \([\s\S]*?<div className=\{styles\.myBookingsNotice\}\>[\s\S]*?\{text\.myBookingsCancelNotice\}[\s\S]*?\<\/div\>[\s\S]*?\<\/div\>[\s\S]*?\<\/div\>[\s\S]*?\<\/\>\s*\)\}/;

const newMyBookings = `{todayBookings.length === 0 && upcomingBookings.length === 0 ? (
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
                        {lang === 'es' ? 'Citas del día' : 'Today\\'s Bookings'}
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
              )}`;

// Wait, the regex might be tricky. Let's just find the start and replace up to </>)
fileContent = fileContent.replace(
  /\{bookings\.length === 0 \? \([\s\S]*?\{text\.myBookingsCancelNotice\}\s*<\/div>\s*<\/>\s*\)}/,
  newMyBookings
);

fs.writeFileSync('src/components/BookingScheduler.tsx', fileContent);
console.log('Done');
