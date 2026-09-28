import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, staff } = body;

    const apiKey = process.env.RESEND_API_KEY || '';
    
    // Send Owner Email via Fetch (Directly to Resend API)
    const ownerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; background-color: #f7f7f7; color: #333333; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border-top: 5px solid #ef4444; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
          h2 { color: #111111; margin-top: 0; font-weight: normal; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #666666; width: 140px; display: inline-block; }
          .item { margin-bottom: 8px; font-size: 14px; }
          .stars { font-size: 24px; color: #d4af37; margin: 10px 0; }
          .comment-box { background: #fdfdfd; border: 1px solid #eeeeee; padding: 15px; border-radius: 6px; font-style: italic; color: #444; line-height: 1.5; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Buzón de Reseñas: Nueva Evaluación</h2>
          
          <div class="section">
            <div class="item">
              <span class="label">Personal Evaluado:</span>
              <span><strong>${staff || 'No especificado'}</strong></span>
            </div>

            <div class="item">
              <span class="label">Calificación:</span>
              <div class="stars">
                ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)
              </div>
            </div>
            
            <div class="item" style="margin-top: 20px;">
              <span class="label">Comentarios del Cliente:</span>
              <div class="comment-box">
                "${comment || 'Sin comentarios adicionales.'}"
              </div>
            </div>
          </div>

          <div style="margin-top: 20px; font-size: 13px; color: #666; font-style: italic; border-top: 1px dashed #eee; padding-top: 10px;">
            Este mensaje fue capturado internamente desde la página de retroalimentación para evitar que se publique en Google Maps. Se recomienda investigar lo sucedido en el salón hoy.
          </div>
        </div>
      </body>
      </html>
    `;

    const ownerEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'María Bonita Buzón <citas@mariabonitabeautysalon.com>',
        to: ['soymikevazquez@gmail.com', 'mariabarrientossalon@gmail.com'],
        subject: `Atención Requerida: Reseña de ${rating} Estrellas`,
        html: ownerHtml
      })
    });

    const ownerEmailData = await ownerEmailRes.json();
    
    if (ownerEmailRes.ok) {
      return NextResponse.json({ success: true, id: ownerEmailData.id });
    } else {
      console.error('Error from Resend:', ownerEmailData);
      return NextResponse.json({ success: false, error: ownerEmailData }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in feedback API route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
