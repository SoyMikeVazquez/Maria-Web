import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, staffName, lang, imageBase64 } = await req.json()

    if (!email || !staffName || !imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const apiKey = Deno.env.get('RESEND_API_KEY') || '';
    
    // Clean base64 string if it has the data URI prefix
    const base64Content = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const subject = lang === 'es' 
      ? `Horario Actualizado - ${staffName} - María Bonita Beauty Salon`
      : `Updated Schedule - ${staffName} - María Bonita Beauty Salon`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f6f2; color: #1a1a1a; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5d9b6; }
          .header { background: linear-gradient(135deg, #111111 0%, #222222 100%); padding: 30px 20px; text-align: center; border-bottom: 4px solid #9e8a30; }
          .header h1 { color: #ffffff; font-size: 22px; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 300; }
          .header p { color: #d4af37; font-size: 13px; margin: 5px 0 0 0; letter-spacing: 1px; text-transform: uppercase; }
          .content { padding: 30px 25px; }
          .intro { font-size: 15px; line-height: 1.6; margin-bottom: 25px; color: #444444; }
          .footer { background-color: #111111; color: #888888; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #222222; }
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
                ? `Hola <strong>${staffName}</strong>,<br><br>Adjunto a este correo encontrarás tu horario de disponibilidad actualizado. Puedes descargar la imagen adjunta para tenerla a la mano.`
                : `Hello <strong>${staffName}</strong>,<br><br>Attached to this email you will find your updated availability schedule. You can download the attached image to keep it handy.`
              }
            </div>
          </div>
          <div class="footer">
            <p>María Bonita Beauty Salon</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'María Bonita <citas@mariabonitabeautysalon.com>',
        to: [email],
        subject: subject,
        html: html,
        attachments: [
          {
            filename: `horario_${staffName.toLowerCase().replace(/\s+/g, '_')}.png`,
            content: base64Content
          }
        ]
      })
    });

    const emailData = await emailRes.json();
    
    if (!emailRes.ok) {
      console.error('Failed to send schedule email:', emailData);
      return new Response(
        JSON.stringify({ success: false, error: emailData }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: emailData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    console.error('Error in send-schedule API route:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
