import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

  let startDateParam = '';
  let endDateParam = '';

  try {
    const body = await request.json().catch(() => ({}));
    if (body.startDate) startDateParam = body.startDate;
    if (body.endDate) endDateParam = body.endDate;
  } catch (e) {
    // Fall back to default
  }

  if (!clientEmail || !privateKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'Google API credentials are missing in environment variables.',
      code: 'CONFIG_MISSING'
    }, { status: 200 });
  }

  try {
    // Authenticate with Google JWT
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const searchconsole = google.searchconsole({
      version: 'v1',
      auth: auth,
    });

    // 1. List sites to auto-discover the registered URL
    const sitesRes = await searchconsole.sites.list();
    const sites = sitesRes.data.siteEntry || [];

    if (sites.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No verified sites found in Google Search Console for this account.',
        code: 'NO_SITES'
      }, { status: 200 });
    }

    // Dynamic selection of the best-matching site (preferring mariabonita, else take the first verified site)
    const matchedSite = sites.find(s => s.siteUrl?.includes('mariabonita'));
    const siteUrl = matchedSite?.siteUrl || sites[0].siteUrl;

    if (!siteUrl) {
      return NextResponse.json({
        success: false,
        error: 'Could not resolve site URL.',
        code: 'NO_SITE_URL'
      }, { status: 200 });
    }

    // Set dates
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const startDateStr = startDateParam || formatDate(thirtyDaysAgo);
    const endDateStr = endDateParam || formatDate(today);

    // 2. Query search queries (keywords) and daily performance in parallel
    const [queriesRes, dailyRes] = await Promise.all([
      // Fetch top 15 search queries
      searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ['query'],
          rowLimit: 15,
        },
      }),
      // Fetch daily performance (clicks, impressions, CTR, average position)
      searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ['date'],
          rowLimit: 31,
        },
      })
    ]);

    // Parse top search queries (keywords)
    const queries = (queriesRes.data.rows || []).map(row => ({
      keyword: row.keys?.[0] || 'Unknown',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100, // convert decimal to percentage
      position: Math.round((row.position || 0) * 10) / 10,
    }));

    // Parse daily performance details for charts
    const daily = (dailyRes.data.rows || []).map(row => ({
      date: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: Math.round((row.position || 0) * 10) / 10,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate aggregated stats over 30 days
    const totalClicks = daily.reduce((sum, d) => sum + d.clicks, 0);
    const totalImpressions = daily.reduce((sum, d) => sum + d.impressions, 0);
    
    // Average CTR and position weighted or simple averages
    const avgCtr = daily.length > 0 
      ? Math.round((daily.reduce((sum, d) => sum + d.ctr, 0) / daily.length) * 10) / 10
      : 0;
    const avgPosition = daily.length > 0
      ? Math.round((daily.reduce((sum, d) => sum + d.position, 0) / daily.length) * 10) / 10
      : 0;

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('Error fetching Search Console data:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
