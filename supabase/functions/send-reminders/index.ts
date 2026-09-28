// Deno Edge Function: send-reminders
// Location: supabase/functions/send-reminders/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';

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

serve(async (req) => {
  try {
    // 1. Initialize Supabase Service Role Client to bypass Row Level Security
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing.")
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    const now = new Date()
    
    // ==========================================
    // 1. PROCESS 1-HOUR-BEFORE REMINDERS
    // ==========================================
    // Look for appointments starting in the next 45 to 75 minutes
    const rangeStart = new Date(now.getTime() + 45 * 60 * 1000)
    const rangeEnd = new Date(now.getTime() + 75 * 60 * 1000)
    
    const { data: hourBookings, error: hourError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('hour_reminder_sent', false)
      .gte('datetime_timestamp', rangeStart.toISOString())
      .lte('datetime_timestamp', rangeEnd.toISOString())

    if (hourError) throw hourError

    console.log(`Found ${hourBookings?.length ?? 0} hour-prior reminders to send.`);

    const sentHourIds: string[] = []
    if (hourBookings && hourBookings.length > 0) {
      for (const b of hourBookings) {
        const subject = `Recordatorio: Tu cita es en 1 hora (${b.ref_code}) - María Bonita`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5d9b6; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 3px solid #9e8a30; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #111111; margin: 0; text-transform: uppercase; font-weight: 300; letter-spacing: 2px;">María Bonita</h2>
              <p style="color: #9e8a30; margin: 5px 0 0 0; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Beauty Salon</p>
            </div>
            <p>Hola <strong>${b.client_name}</strong>,</p>
            <p>Te recordamos que tu cita está programada para comenzar en <strong>aproximadamente 1 hora</strong>, a las <strong>${b.time_str}</strong> hoy.</p>
            <div style="background: #fdfdfb; border: 1px solid rgba(158, 138, 48, 0.2); padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Estilista:</strong> ${b.staff_name}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${b.time_str}</p>
              <p style="margin: 5px 0;"><strong>Duración:</strong> ${formatDuration(b.total_duration, 'es')}</p>
              <p style="margin: 10px 0 5px 0;"><strong>Servicios:</strong></p>
              <ul style="margin: 0; padding-left: 20px; color: #444444;">
                ${b.services.map((s: any) => `<li>${s.title}</li>`).join('')}
              </ul>
            </div>
            <p style="font-size: 12px; color: #888888; text-align: center; margin-top: 25px; line-height: 1.5;">
              Te esperamos en <strong>6634 Penn Ave S, Richfield, MN 55423, USA</strong>.<br>
              Si necesitas cancelar o reprogramar, por favor contáctanos lo antes posible al <a href="tel:+16123454187" style="color: #9e8a30; text-decoration: none;">+1 612-345-4187</a>.
            </p>
          </div>
        `;
        
        try {
          const res = await sendEmail(b.client_email, subject, html);
          if (res.ok) {
            sentHourIds.push(b.id)
          } else {
            const errText = await res.text();
            console.error(`Error sending hour reminder email to ${b.client_email}:`, errText);
          }
        } catch (mailErr) {
          console.error(`Fetch error sending email to ${b.client_email}:`, mailErr);
        }
      }
    }

    if (sentHourIds.length > 0) {
      const { error: updateHourError } = await supabaseClient
        .from('bookings')
        .update({ hour_reminder_sent: true })
        .in('id', sentHourIds)
      if (updateHourError) console.error("Error updating hour_reminder_sent flags:", updateHourError);
    }

    // ==========================================
    // 2. PROCESS MORNING REMINDERS
    // ==========================================
    // Look for appointments today where morning_reminder_sent = false
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const { data: morningBookings, error: morningError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('morning_reminder_sent', false)
      .gte('datetime_timestamp', startOfDay.toISOString())
      .lte('datetime_timestamp', endOfDay.toISOString())

    if (morningError) throw morningError

    console.log(`Found ${morningBookings?.length ?? 0} morning reminders to send.`);

    const sentMorningIds: string[] = []
    if (morningBookings && morningBookings.length > 0) {
      for (const b of morningBookings) {
        // Only send morning reminder if appointment is at least 2 hours in the future
        // (to avoid double sending if someone books same-day last minute)
        const bTime = new Date(b.datetime_timestamp)
        if (bTime.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
          console.log(`Skipping morning reminder for ${b.client_email} because it is a near-term appointment.`);
          sentMorningIds.push(b.id); // Mark as sent so we don't check again
          continue;
        }

        const subject = `Recordatorio: Tu cita de hoy (${b.ref_code}) - María Bonita`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5d9b6; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 3px solid #9e8a30; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #111111; margin: 0; text-transform: uppercase; font-weight: 300; letter-spacing: 2px;">María Bonita</h2>
              <p style="color: #9e8a30; margin: 5px 0 0 0; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Beauty Salon</p>
            </div>
            <p>Hola <strong>${b.client_name}</strong>,</p>
            <p>Te recordamos que hoy tienes una cita programada con nosotros. ¡Estamos ansiosas por atenderte!</p>
            <div style="background: #fdfdfb; border: 1px solid rgba(158, 138, 48, 0.2); padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${b.date_str}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${b.time_str}</p>
              <p style="margin: 5px 0;"><strong>Estilista:</strong> ${b.staff_name}</p>
              <p style="margin: 5px 0;"><strong>Duración:</strong> ${formatDuration(b.total_duration, 'es')}</p>
              <p style="margin: 10px 0 5px 0;"><strong>Servicios:</strong></p>
              <ul style="margin: 0; padding-left: 20px; color: #444444;">
                ${b.services.map((s: any) => `<li>${s.title}</li>`).join('')}
              </ul>
            </div>
            <p style="font-size: 12px; color: #888888; text-align: center; margin-top: 25px; line-height: 1.5;">
              Dirección: <strong>6634 Penn Ave S, Richfield, MN 55423, USA</strong>.<br>
              Si necesitas realizar algún cambio o tienes dudas, llámanos al <a href="tel:+16123454187" style="color: #9e8a30; text-decoration: none;">+1 612-345-4187</a>.
            </p>
          </div>
        `;
        
        try {
          const res = await sendEmail(b.client_email, subject, html);
          if (res.ok) {
            sentMorningIds.push(b.id)
          } else {
            const errText = await res.text();
            console.error(`Error sending morning reminder email to ${b.client_email}:`, errText);
          }
        } catch (mailErr) {
          console.error(`Fetch error sending email to ${b.client_email}:`, mailErr);
        }
      }
    }

    if (sentMorningIds.length > 0) {
      const { error: updateMorningError } = await supabaseClient
        .from('bookings')
        .update({ morning_reminder_sent: true })
        .in('id', sentMorningIds)
      if (updateMorningError) console.error("Error updating morning_reminder_sent flags:", updateMorningError);
    }

    return new Response(JSON.stringify({
      success: true,
      hourRemindersSent: sentHourIds.length,
      morningRemindersSent: sentMorningIds.length
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})

async function sendEmail(to: string, subject: string, html: string) {
  return await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: "María Bonita <citas@mariabonitabeautysalon.com>",
      to: [to],
      subject: subject,
      html: html
    })
  });
}
