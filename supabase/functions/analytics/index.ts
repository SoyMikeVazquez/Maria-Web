// Deno Edge Function: analytics
// Location: supabase/functions/analytics/index.ts

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

  const propertyId = Deno.env.get('GA_PROPERTY_ID');
  const clientEmail = Deno.env.get('GA_CLIENT_EMAIL');
  const privateKeyString = Deno.env.get('GA_PRIVATE_KEY')?.replace(/\\n/g, '\n');

  let startDate = '30daysAgo';
  let endDate = 'today';

  try {
    const body = await req.json().catch(() => ({}));
    if (body.startDate) startDate = body.startDate;
    if (body.endDate) endDate = body.endDate;
  } catch (e) {
    // Fall back to default
  }

  if (!propertyId || !clientEmail || !privateKeyString) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Google Analytics credentials or Property ID are missing in environment variables on Supabase.',
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
      scope: 'https://www.googleapis.com/auth/analytics.readonly'
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

    // 3. Run GA4 reports in parallel using Google REST API
    const reportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    const [dailyRes, pagesRes, devicesRes, countriesRes] = await Promise.all([
      // 1. Daily views and active users
      fetch(reportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        })
      }),
      // 2. Top Visited Pages
      fetch(reportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [{ name: 'screenPageViews' }],
          limit: 10
        })
      }),
      // 3. Device category
      fetch(reportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'activeUsers' }]
        })
      }),
      // 4. Countries
      fetch(reportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }],
          limit: 5
        })
      })
    ]);

    const dailyReport = await dailyRes.json();
    const pagesReport = await pagesRes.json();
    const devicesReport = await devicesRes.json();
    const countriesReport = await countriesRes.json();

    if (!dailyRes.ok) throw new Error(`Daily report failed: ${JSON.stringify(dailyReport)}`);
    if (!pagesRes.ok) throw new Error(`Pages report failed: ${JSON.stringify(pagesReport)}`);
    if (!devicesRes.ok) throw new Error(`Devices report failed: ${JSON.stringify(devicesReport)}`);
    if (!countriesRes.ok) throw new Error(`Countries report failed: ${JSON.stringify(countriesReport)}`);

    // Parse daily report rows
    const dailyData = (dailyReport.rows || []).map((row: any) => {
      const dateStr = row.dimensionValues?.[0]?.value || ''; // Format: YYYYMMDD
      let formattedDate = dateStr;
      if (dateStr.length === 8) {
        formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      }
      return {
        date: formattedDate,
        pageViews: parseInt(row.metricValues?.[0]?.value || '0', 10),
        activeUsers: parseInt(row.metricValues?.[1]?.value || '0', 10),
      };
    });

    // Parse pages report rows
    const pagesData = (pagesReport.rows || []).map((row: any) => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // Parse devices report rows
    const devicesData = (devicesReport.rows || []).map((row: any) => ({
      device: row.dimensionValues?.[0]?.value || 'Other',
      users: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // Parse countries report rows
    const countriesData = (countriesReport.rows || []).map((row: any) => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // Totals calculations
    const totalViews = dailyData.reduce((acc: number, curr: any) => acc + curr.pageViews, 0);
    const totalUsers = dailyData.reduce((acc: number, curr: any) => acc + curr.activeUsers, 0);

    return new Response(
      JSON.stringify({
        success: true,
        totals: {
          pageViews: totalViews,
          activeUsers: totalUsers,
        },
        daily: dailyData,
        pages: pagesData,
        devices: devicesData,
        countries: countriesData,
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
    console.error('Error fetching GA4 data:', error);
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
