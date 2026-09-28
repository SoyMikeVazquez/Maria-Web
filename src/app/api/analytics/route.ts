import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

  let startDate = '30daysAgo';
  let endDate = 'today';

  try {
    const body = await request.json().catch(() => ({}));
    if (body.startDate) startDate = body.startDate;
    if (body.endDate) endDate = body.endDate;
  } catch (e) {
    // Fall back to default
  }

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'Google Analytics credentials or Property ID are missing in environment variables.',
      code: 'CONFIG_MISSING'
    }, { status: 200 }); // Return 200 with success: false so the frontend can catch it and display setup instructions without throwing a 400 error in logs.
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: process.env.GA_PROJECT_ID || 'mariabonitaapp2025',
    });

    // Run GA4 reports in parallel
    const [dailyReport, pagesReport, devicesReport, countriesReport] = await Promise.all([
      // 1. Daily views and active users
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      // 2. Top Visited Pages
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        limit: 10,
      }),
      // 3. Device category
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      // 4. Countries
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 5,
      }),
    ]);

    // Parse daily report rows
    const dailyData = (dailyReport[0].rows || []).map(row => {
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
    const pagesData = (pagesReport[0].rows || []).map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // Parse devices report rows
    const devicesData = (devicesReport[0].rows || []).map(row => ({
      device: row.dimensionValues?.[0]?.value || 'Other',
      users: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // Parse countries report rows
    const countriesData = (countriesReport[0].rows || []).map(row => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // Totals calculations
    const totalViews = dailyData.reduce((acc, curr) => acc + curr.pageViews, 0);
    const totalUsers = dailyData.reduce((acc, curr) => acc + curr.activeUsers, 0);

    return NextResponse.json({
      success: true,
      totals: {
        pageViews: totalViews,
        activeUsers: totalUsers,
      },
      daily: dailyData,
      pages: pagesData,
      devices: devicesData,
      countries: countriesData,
    });
  } catch (error: any) {
    console.error('Error fetching GA4 data:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
