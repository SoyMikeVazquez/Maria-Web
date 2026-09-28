import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      refCode, 
      date, 
      time, 
      staffName, 
      services, 
      contact, 
      totalPrice, 
      totalDuration, 
      dateISO,
      lang 
    } = body;

    const apiKey = process.env.RESEND_API_KEY || '';

    // 1. HTML Email for the Client
    const clientSubject = lang === 'es' 
      ? `Cita Confirmada (${refCode}) - María Bonita Beauty Salon`
      : `Appointment Confirmed (${refCode}) - María Bonita Beauty Salon`;

    const clientHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7f6f2;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5d9b6;
          }
          .header {
            background: linear-gradient(135deg, #111111 0%, #222222 100%);
            padding: 30px 20px;
            text-align: center;
            border-bottom: 4px solid #9e8a30;
          }
          .header h1 {
            color: #ffffff;
            font-size: 22px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 300;
          }
          .header p {
            color: #d4af37;
            font-size: 13px;
            margin: 5px 0 0 0;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .content {
            padding: 30px 25px;
          }
          .intro {
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 25px;
            color: #444444;
          }
          .summary-card {
            background: #fdfdfb;
            border: 1px solid rgba(158, 138, 48, 0.25);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
          }
          .summary-header {
            border-bottom: 1px solid #eeeeee;
            padding-bottom: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
          }
          .summary-title {
            font-weight: bold;
            font-size: 14px;
            color: #111111;
            text-transform: uppercase;
          }
          .ref-code {
            color: #9e8a30;
            font-weight: bold;
          }
          .row {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .label {
            font-weight: 600;
            color: #666666;
            display: inline-block;
            width: 100px;
          }
          .val {
            color: #111111;
          }
          .services-list {
            margin-top: 15px;
            border-top: 1px dashed #dddddd;
            padding-top: 15px;
          }
          .service-item {
            margin-bottom: 8px;
            font-size: 13px;
          }
          .service-name {
            font-weight: bold;
            color: #111111;
          }
          .service-meta {
            color: #888888;
            font-size: 11px;
          }
          .total-row {
            border-top: 1px solid #eeeeee;
            margin-top: 15px;
            padding-top: 10px;
            font-weight: bold;
            font-size: 16px;
            color: #9e8a30;
          }
          .privacy-notice {
            background-color: #f8f9fa;
            border-left: 3px solid #9e8a30;
            padding: 12px 15px;
            font-size: 12px;
            color: #666666;
            margin-top: 25px;
            line-height: 1.5;
          }
          .footer {
            background-color: #111111;
            color: #888888;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #222222;
          }
          .footer a {
            color: #d4af37;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>María Bonita</h1>
            <p>Beauty Salon</p>
          </div>
          
          <div class="content">
            <div class="intro">
              ${lang === 'es' 
                ? `Hola <strong>${contact.name}</strong>,<br><br>¡Tu cita ha sido confirmada con éxito! A continuación encontrarás los detalles del servicio reservado.<br><br><em>Esta cita proviene de la página oficial.</em>`
                : `Hello <strong>${contact.name}</strong>,<br><br>Your appointment has been successfully confirmed! Please find your booking details below.<br><br><em>This appointment comes from the official website.</em>`
              }
            </div>
            
            <div class="summary-card">
              <div class="summary-header">
                <span class="summary-title">${lang === 'es' ? 'Resumen de Cita' : 'Appointment Summary'}</span>
                <span class="ref-code">${refCode}</span>
              </div>
              
              <div class="row">
                <span class="label">${lang === 'es' ? 'Fecha:' : 'Date:'}</span>
                <span class="val">${date}</span>
              </div>
              
              <div class="row">
                <span class="label">${lang === 'es' ? 'Hora:' : 'Time:'}</span>
                <span class="val">${time}</span>
              </div>
              
              <div class="row">
                <span class="label">${lang === 'es' ? 'Personal:' : 'Staff:'}</span>
                <span class="val">${staffName}</span>
              </div>

              <div class="services-list">
                <span class="label" style="margin-bottom: 8px;">${lang === 'es' ? 'Servicios:' : 'Services:'}</span>
                ${services.map((s: any) => `
                  <div class="service-item">
                    <span class="service-name">${s.title}</span><br>
                    <span class="service-meta">${lang === 'es' ? 'Con base a valoración' : 'Based on assessment'} | ${s.durationMin} min</span>
                  </div>
                `).join('')}
              </div>

               <div class="total-row">
                 <span class="label">${lang === 'es' ? 'Duración Total:' : 'Total Duration:'}</span>
                 <span class="val">${formatDuration(totalDuration, lang)}</span>
               </div>
               <div style="margin-top: 15px; border-top: 1px dashed #dddddd; padding-top: 10px; font-size: 13px; color: #555555; font-style: italic;">
                 ${lang === 'es' 
                   ? 'Nota: Todo precio será con base a valoración.' 
                   : 'Note: All pricing will be based on assessment.'
                 }
               </div>
            </div>

            <div style="background-color: #fcfbf7; border: 1px dashed rgba(158, 138, 48, 0.4); border-radius: 8px; padding: 15px; margin-top: 20px; font-size: 13px; color: #444444; line-height: 1.5; text-align: center; font-family: sans-serif;">
              <strong>${lang === 'es' ? '¿Necesitas cancelar o modificar?' : 'Need to cancel or reschedule?'}</strong><br>
              ${lang === 'es'
                ? 'Si deseas realizar algún cambio en tu cita, puedes hacerlo respondiendo directamente a este correo electrónico.'
                : 'If you wish to make any changes to your appointment, you can do so by replying directly to this email.'
              }
            </div>

            <div class="privacy-notice">
              <strong>${lang === 'es' ? 'Aviso de Privacidad:' : 'Privacy Notice:'}</strong><br>
              ${lang === 'es'
                ? 'Tus datos de contacto no serán almacenados para fines publicitarios. Solo se utilizarán para enviar este comprobante, confirmar tu cita y enviarte recordatorios. No te enviaremos publicidad por correo ni por teléfono.'
                : 'Your contact details will not be stored for advertising purposes. They will only be used to send this receipt, confirm your appointment, and send reminders. No promotional content will be sent.'
              }
            </div>
          </div>
          
          <div class="footer">
            <p>María Bonita Beauty Salon<br>
            6634 Penn Ave S, Richfield, MN 55423, USA<br>
            Teléfono: <a href="tel:+16123454187">+1 612-345-4187</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. HTML Email for the Owner (soymikevazquez@gmail.com)
    const ownerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; background-color: #f7f7f7; color: #333333; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border-top: 5px solid #9e8a30; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
          h2 { color: #111111; margin-top: 0; font-weight: normal; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #666666; width: 140px; display: inline-block; }
          .item { margin-bottom: 8px; font-size: 14px; }
          .services { background: #fdfdfd; border: 1px solid #eeeeee; padding: 15px; border-radius: 6px; }
          .service-row { font-size: 13px; margin-bottom: 6px; border-bottom: 1px dashed #f0f0f0; padding-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Nueva Cita Agendada: ${refCode}</h2>
          
          <div class="section">
            <strong>Detalles del Cliente:</strong>
            <div class="item" style="margin-top: 10px;"><span class="label">Nombre:</span> <span>${contact.name}</span></div>
            <div class="item"><span class="label">Email:</span> <span>${contact.email}</span></div>
            <div class="item"><span class="label">Teléfono:</span> <span>${contact.phone}</span></div>
          </div>
          
          <div class="section">
            <strong>Detalles de la Reserva:</strong>
            <div class="item" style="margin-top: 10px;"><span class="label">Fecha:</span> <span>${date}</span></div>
            <div class="item"><span class="label">Hora:</span> <span>${time}</span></div>
            <div class="item"><span class="label">Estilista:</span> <span>${staffName}</span></div>
          </div>

          <div class="section">
            <strong>Servicios Seleccionados:</strong>
            <div class="services">
              ${services.map((s: any) => `
                <div class="service-row">
                  <strong>${s.title}</strong><br>
                  ${lang === 'es' ? 'Con base a valoración' : 'Based on assessment'} | ${s.durationMin} min
                </div>
              `).join('')}
              <div style="font-weight: bold; margin-top: 10px; color: #9e8a30; font-size: 14px;">
                ${lang === 'es' ? 'Duración Total:' : 'Total Duration:'} ${formatDuration(totalDuration, lang)}
              </div>
              <div style="margin-top: 10px; font-size: 13px; color: #666; font-style: italic; border-top: 1px dashed #eee; padding-top: 10px;">
                Cita solicitada desde la página oficial. Todo precio será con base a valoración.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Send Client Email via Fetch (Directly to Resend API)
    const clientEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'María Bonita <citas@mariabonitabeautysalon.com>',
        to: [contact.email],
        subject: clientSubject,
        html: clientHtml
      })
    });

    const clientEmailData = await clientEmailRes.json();
    console.log('Resend Client response:', clientEmailData);

    // 4. Send Owner Email via Fetch (Directly to Resend API)
    const ownerEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'María Bonita <citas@mariabonitabeautysalon.com>',
        to: ['soymikevazquez@gmail.com', 'mariabarrientossalon@gmail.com'],
        subject: `Nueva Cita Agendada - ${contact.name}`,
        html: ownerHtml
      })
    });

    const ownerEmailData = await ownerEmailRes.json();
    console.log('Resend Owner response:', ownerEmailData);

    // Sync booking to Supabase REST if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const cleanDateStr = date.split(',')[1] ? date.split(',')[1].trim() : date;
        const parsedDate = new Date(`${cleanDateStr} ${time}`);
        const datetimeTimestamp = dateISO || (isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString());

        const supabaseBooking = {
          ref_code: refCode,
          date_str: date,
          time_str: time,
          datetime_timestamp: datetimeTimestamp,
          staff_name: staffName,
          services: services,
          client_name: contact.name,
          client_email: contact.email,
          client_phone: contact.phone,
          total_duration: totalDuration,
          morning_reminder_sent: false,
          hour_reminder_sent: false
        };

        const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(supabaseBooking)
        });

        if (!supabaseRes.ok) {
          const errMsg = await supabaseRes.text();
          console.error('Failed to sync booking to Supabase REST:', errMsg);
        } else {
          console.log('Successfully synced booking to Supabase REST');
        }
      } catch (dbErr) {
        console.error('Error syncing booking to Supabase database:', dbErr);
      }
    } else {
      console.log('Supabase URL or Anon Key not configured in environment. Skipping database sync.');
    }

    // 5. Send WhatsApp Notifications (Client & Owner)
    try {
      const whatsappToken = process.env.WHATSAPP_TOKEN || '';
      const whatsappUrl = 'https://graph.facebook.com/v17.0/115310538279253/messages';

      const sendWhatsApp = async (toPhone: string) => {
        try {
          const serviceNames = services.map((s: any) => s.title).join(', ');
          const payload = {
            messaging_product: 'whatsapp',
            to: toPhone,
            type: 'template',
            template: {
              name: 'alerta_para_el_salon',
              language: {
                code: 'es_MX'
              },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: contact.name
                    },
                    {
                      type: 'text',
                      text: serviceNames
                    },
                    {
                      type: 'text',
                      text: date
                    },
                    {
                      type: 'text',
                      text: time
                    }
                  ]
                }
              ]
            }
          };

          const res = await fetch(whatsappUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${whatsappToken}`
            },
            body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (res.ok) {
            console.log(`WhatsApp notification successfully sent to ${toPhone}:`, data);
          } else {
            console.error(`Failed to send WhatsApp notification to ${toPhone}:`, data);
          }
          return { success: res.ok, data };
        } catch (waErr) {
          console.error(`Network error sending WhatsApp to ${toPhone}:`, waErr);
          return { success: false, error: waErr };
        }
      };

      // Format customer phone
      const cleanPhone = contact.phone.replace(/\D/g, '');
      const clientWhatsAppPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
      const ownerWhatsAppPhone = '16126361374';

      // Send to both in parallel
      const waPromises = [];
      if (clientWhatsAppPhone && clientWhatsAppPhone.length >= 10) {
        waPromises.push(sendWhatsApp(clientWhatsAppPhone));
      }
      waPromises.push(sendWhatsApp(ownerWhatsAppPhone));

      await Promise.all(waPromises);
    } catch (globalWaErr) {
      console.error('Error dispatching WhatsApp notifications:', globalWaErr);
    }

    return NextResponse.json({ 
      success: true, 
      clientEmailId: clientEmailData.id || null, 
      ownerEmailId: ownerEmailData.id || null 
    });

  } catch (error: any) {
    console.error('Error in send-email API route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
