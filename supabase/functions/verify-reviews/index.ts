import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  const placeId = Deno.env.get('GOOGLE_PLACE_ID');

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Faltan credenciales de Supabase en el entorno' }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }

  if (!googleApiKey || !placeId) {
    return new Response(
      JSON.stringify({ error: 'Faltan credenciales de Google API en el entorno' }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }

  try {
    // 1. Fetch the latest 5 reviews from Google Places API
    const googleRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${googleApiKey}`
    );
    const googleData = await googleRes.json();
    
    if (googleData.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: 'Error de Google API', details: googleData }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    const reviews = googleData.result?.reviews || [];

    // 2. Fetch pending reviews from Supabase
    const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/staff_reviews?status=eq.pending&select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    
    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      return new Response(
        JSON.stringify({ error: 'Error al consultar Supabase', details: errText }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    const pendingReviews = await supabaseRes.json();
    if (pendingReviews.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No hay reseñas pendientes para validar.' }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let approvedCount = 0;

    // 3. Match reviews
    for (const pending of pendingReviews) {
      const pendingTime = new Date(pending.created_at).getTime() / 1000;
      
      const match = reviews.find((gReview: any) => {
        const timeDiffSeconds = Math.abs(gReview.time - pendingTime);
        
        if (pending.author_name) {
          const pendingNameLower = pending.author_name.toLowerCase();
          const googleNameLower = gReview.author_name.toLowerCase();
          if (googleNameLower.includes(pendingNameLower) || pendingNameLower.includes(googleNameLower)) {
            return timeDiffSeconds < 604800; // 7 días en segundos
          }
        }
        
        return timeDiffSeconds < 86400; // 24 horas en segundos
      });

      if (match) {
        // 4. Update status to 'approved' in Supabase
        await fetch(`${supabaseUrl}/rest/v1/staff_reviews?id=eq.${pending.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ status: 'approved' })
        });
        approvedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Validación completada',
        pendientesRevisadas: pendingReviews.length,
        aprobadas: approvedCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
