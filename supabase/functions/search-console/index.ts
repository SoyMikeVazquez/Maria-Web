// Deno Edge Function: search-console
// Location: supabase/functions/search-console/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as jose from "npm:jose@4.14.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const clientEmail = Deno.env.get('GA_CLIENT_EMAIL');
  const privateKeyString = Deno.env.get('GA_PRIVATE_KEY')?.replace(/\\n/g, '\n');

  let startDateParam = '';
  let endDateParam = '';

  try {
    const body = await req.json().catch(() => ({}));
    if (body.startDate) startDateParam = body.startDate;
    if (body.endDate) endDateParam = body.endDate;
  } catch (e) {
    // Fall back to default
  }

  if (!clientEmail || !privateKeyString) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Google API credentials are missing in environment variables on Supabase.',
        code: 'CONFIG_MISSING'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }

  try {
    // 1. Sign JWT locally using jose for Service Account Auth
    const privateKey = await jose.importPKCS8(privateKeyString, 'RS256');
    const jwt = await new jose.SignJWT({
      scope: 'https://www.googleapis.com/auth/webmasters.readonly'
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(clientEmail)
      .setAudience('https://oauth2.googleapis.com/token')
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(privateKey);

    // 2. Exchange JWT for Google API access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(`Google Auth Token exchange failed: ${JSON.stringify(tokenData)}`);
    }
    const accessToken = tokenData.access_token;

    // 3. List verified sites in Search Console
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const sitesData = await sitesRes.json();
    if (!sitesRes.ok) {
      throw new Error(`Failed to list Search Console sites: ${JSON.stringify(sitesData)}`);
    }
    const sites = sitesData.siteEntry || [];

    if (sites.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No verified sites found in Google Search Console for this account.',
          code: 'NO_SITES'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Dynamic selection of the best-matching site (preferring mariabonita, else take the first verified site)
    const matchedSite = sites.find((s: any) => s.siteUrl?.includes('mariabonita'));
    const siteUrl = matchedSite?.siteUrl || sites[0].siteUrl;

    if (!siteUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not resolve site URL.',
          code: 'NO_SITE_URL'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Set dates
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const startDateStr = startDateParam || formatDate(thirtyDaysAgo);
    const endDateStr = endDateParam || formatDate(today);

    // 4. Query search queries (keywords) and daily performance in parallel using REST API
    const analyticsEndpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

    const [queriesRes, dailyRes] = await Promise.all([
      fetch(analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ['query'],
          rowLimit: 15,
        })
      }),
      fetch(analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ['date'],
          rowLimit: 31,
        })
      })
    ]);

    const queriesData = await queriesRes.json();
    const dailyData = await dailyRes.json();

    if (!queriesRes.ok) {
      throw new Error(`Search Console query fetch failed: ${JSON.stringify(queriesData)}`);
    }
    if (!dailyRes.ok) {
      throw new Error(`Search Console daily fetch failed: ${JSON.stringify(dailyData)}`);
    }

    // Parse top search queries (keywords)
    const queries = (queriesData.rows || []).map((row: any) => ({
      keyword: row.keys?.[0] || 'Unknown',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100, // convert decimal to percentage
      position: Math.round((row.position || 0) * 10) / 10,
    }));

    // Parse daily performance details for charts
    const daily = (dailyData.rows || []).map((row: any) => ({
      date: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: Math.round((row.position || 0) * 10) / 10,
    })).sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Calculate aggregated stats over 30 days
    const totalClicks = daily.reduce((sum: number, d: any) => sum + d.clicks, 0);
    const totalImpressions = daily.reduce((sum: number, d: any) => sum + d.impressions, 0);
    
    // Average CTR and position
    const avgCtr = daily.length > 0 
      ? Math.round((daily.reduce((sum: number, d: any) => sum + d.ctr, 0) / daily.length) * 10) / 10
      : 0;
    const avgPosition = daily.length > 0
      ? Math.round((daily.reduce((sum: number, d: any) => sum + d.position, 0) / daily.length) * 10) / 10
      : 0;

    return new Response(
      JSON.stringify({
        success: true,
        siteUrl,
        totals: {
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: avgCtr,
          position: avgPosition
        },
        queries,
        daily
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error: any) {
    console.error('Error fetching Search Console data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal Server Error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
})
